/**
 * decode.ts —— 纯解码层
 * --------------------------------------------------------------------------
 * 把 Windows .ani（RIFF/ACON）解析成可直接绘制的 canvas 帧数组。
 * 这层不碰页面 DOM、不注册监听、不含任何生命周期，可独立测试。
 *
 * .ani 结构：
 *   "RIFF" + size + "ACON"
 *     "anih"  帧数 / 步数 / 默认帧率（jiffy，1/60 秒）
 *     "rate"  可选，每步时长
 *     LIST("fram") → 若干 "icon" 子块，每块是一个完整的 ICO/CUR 文件
 *       CUR = ICONDIR(6B) + ICONDIRENTRY(16B) + BITMAPINFOHEADER
 *             + XOR 像素（自下而上）+ AND 掩码（1bpp）
 * --------------------------------------------------------------------------
 */
import type { DecodedAni } from './types'

const JIFFY_MS = 1000 / 60
/** 文件缺少 rate 块时的回退帧时长（jiffy） */
const FALLBACK_JIFFIES = 6

const cache = new Map<string, Promise<DecodedAni>>()

function le16(view: DataView, offset: number): number {
  return view.getUint16(offset, true)
}
function le32(view: DataView, offset: number): number {
  return view.getUint32(offset, true)
}
function tag(buf: Uint8Array, offset: number): string {
  return String.fromCharCode(buf[offset], buf[offset + 1], buf[offset + 2], buf[offset + 3])
}

interface RawAni {
  /** 每个元素是一个完整的 ICO/CUR 文件字节 */
  icons: Uint8Array[]
  /** rate 块原始字节，每项 4 字节（jiffy） */
  rate: Uint8Array | null
  /** anih 中的默认帧率 */
  dispRate: number
}

/**
 * 从 LIST("fram") 块中收集所有 icon 子块。
 * 每个 icon 子块本身就是一个完整的 ICO/CUR 文件字节。
 */
function collectIcons(
  buf: Uint8Array,
  view: DataView,
  start: number,
  size: number,
  out: Uint8Array[]
): void {
  const end = start + size
  let q = start + 4 // 跳过 "fram"
  while (q + 8 <= end) {
    const subId = tag(buf, q)
    const subSize = le32(view, q + 4)
    if (subId === 'icon' || subId === 'ICON') {
      out.push(buf.subarray(q + 8, q + 8 + subSize))
    }
    q += 8 + subSize + (subSize & 1) // 块按 2 字节对齐
  }
}

function parseAni(buf: Uint8Array): RawAni {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const icons: Uint8Array[] = []
  let rate: Uint8Array | null = null
  let dispRate = FALLBACK_JIFFIES

  let p = 12 // RIFF(4) + size(4) + "ACON"(4)
  while (p + 8 <= buf.length) {
    const id = tag(buf, p)
    const size = le32(view, p + 4)
    const start = p + 8

    if (id === 'anih') {
      const value = le32(view, start + 28)
      if (value > 0) dispRate = value
    } else if (id === 'rate') {
      rate = buf.subarray(start, start + size)
    } else if (id === 'LIST' && tag(buf, start) === 'fram') {
      collectIcons(buf, view, start, size, icons)
    } else if (id === 'icon' || id === 'ICON') {
      // 个别文件直接把 icon 放在顶层
      icons.push(buf.subarray(start, start + size))
    }

    p += 8 + size + (size & 1)
  }

  return { icons, rate, dispRate }
}

interface DecodedCur {
  canvas: HTMLCanvasElement
  hotX: number
  hotY: number
  w: number
  h: number
}

/**
 * 把一个完整的 ICO/CUR 文件字节解码成 canvas。
 * 仅支持 32 位位图（laffy 光标集均为该格式）。
 */
function decodeCur(data: Uint8Array): DecodedCur | null {
  if (data.length < 22) return null
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)

  // ICONDIR 之后即第一个 ICONDIRENTRY
  const entry = 6
  const hotX = le16(view, entry + 4)
  const hotY = le16(view, entry + 6)
  const imgOff = le32(view, entry + 12)
  if (imgOff + 40 > data.length) return null

  const biSize = le32(view, imgOff)
  const width = le32(view, imgOff + 4)
  const storedHeight = le32(view, imgOff + 8)
  const bitCount = le16(view, imgOff + 14)

  // 图标高度是 XOR + AND 之和，必为偶数；奇数说明文件损坏
  // 只支持 32bpp（laffy 光标集均为该格式），低色深需要调色板，宁可放弃也不解出花屏
  if (biSize < 40 || bitCount !== 32) return null
  if (width <= 0 || storedHeight <= 0 || storedHeight & 1) return null
  const height = storedHeight >> 1

  // 32bpp 每行恒为 width*4 字节（天然 4 字节对齐）；AND 掩码为 1bpp，需补齐到 4 字节
  const xorRowBytes = width * 4
  const andRowBytes = ((width + 31) >> 5) * 4
  const xorOff = imgOff + biSize
  const andOff = xorOff + xorRowBytes * height
  // 越界校验一次性做完，避免在内层循环里每像素判断一次
  if (andOff + andRowBytes * height > data.length) return null

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const image = ctx.createImageData(width, height)
  const px = image.data
  let maxAlpha = 0

  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y // BMP 自下而上存储
    // 行首偏移提到外层算一次，内层只剩列偏移
    const srcRow = xorOff + srcY * xorRowBytes
    const maskRow = andOff + srcY * andRowBytes
    let dst = y * xorRowBytes
    for (let x = 0; x < width; x++, dst += 4) {
      const src = srcRow + (x << 2)

      // BMP DIB 为 BGRA 顺序，需换成 RGBA
      px[dst] = data[src + 2]
      px[dst + 1] = data[src + 1]
      px[dst + 2] = data[src]

      // AND 掩码置 1 表示该像素透明
      let alpha = data[src + 3]
      if ((data[maskRow + (x >> 3)] >> (7 - (x & 7))) & 1) alpha = 0

      px[dst + 3] = alpha
      if (alpha > maxAlpha) maxAlpha = alpha
    }
  }

  // alpha 全为 0 说明只用了 AND 掩码表达透明，补成不透明
  if (maxAlpha === 0) {
    for (let i = 3; i < px.length; i += 4) px[i] = 255
  }

  ctx.putImageData(image, 0, 0)
  return { canvas, hotX, hotY, w: width, h: height }
}

/**
 * 加载并解码一个 .ani 文件，同一 URL 只解码一次。
 */
export function loadAni(url: string): Promise<DecodedAni> {
  const cached = cache.get(url)
  if (cached) return cached

  const task = (async (): Promise<DecodedAni> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`加载光标失败: ${url} (${res.status})`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (tag(bytes, 0) !== 'RIFF' || tag(bytes, 8) !== 'ACON') {
      throw new Error(`不是有效的 .ani 文件: ${url}`)
    }

    const { icons, rate, dispRate } = parseAni(bytes)
    const decoded = icons.map(decodeCur).filter((cur): cur is DecodedCur => cur !== null)
    if (!decoded.length) throw new Error(`所有帧解码失败: ${url}`)

    // 热区与尺寸取自第一帧，整个 .ani 内所有帧应一致
    const frames = decoded.map((cur) => cur.canvas)
    const hotspot = { x: decoded[0].hotX, y: decoded[0].hotY }
    const size = { w: decoded[0].w, h: decoded[0].h }

    const rateView =
      rate !== null && rate.length >= frames.length * 4
        ? new DataView(rate.buffer, rate.byteOffset, rate.byteLength)
        : null

    const durations = new Array<number>(frames.length)
    if (rateView) {
      for (let i = 0; i < durations.length; i++) {
        durations[i] = Math.max(1, JIFFY_MS * le32(rateView, i * 4))
      }
    } else {
      durations.fill(Math.max(1, JIFFY_MS * dispRate))
    }

    return { frames, durations, hotspot, size }
  })()

  cache.set(url, task)
  return task
}

/** 清空解码缓存（切换光标目录时用） */
export function clearAniCache(): void {
  cache.clear()
}
