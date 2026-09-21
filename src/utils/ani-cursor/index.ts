/**
 * --------------------------------------------------------------------------
 * 只需一次函数调用即可把 .ani 动画光标套到页面上：
 *
 *   setANICursor('html', '/ani/laffy/Normal.ani')
 *   setANICursorWithGroupElement(['a', 'button'], '/ani/laffy/Link.ani')
 *
 * 实现方式为纯 CSS：解码 .ani 得到逐帧 PNG，生成 @keyframes 动画 cursor 属性，
 * 只往 document.head 注入样式 —— 不监听鼠标、不在 body 插 DOM、无运行时开销。
 *
 * 注意：浏览器对光标图片尺寸有限制，建议不要超过 32×32，
 * 超过 128×128 会被直接忽略。详见 MDN "cursor: icon size limits"。
 * --------------------------------------------------------------------------
 */
import { loadAni } from './decode'
import type { ANIInfo, CursorController, FrameInfo } from './types'

const KEYFRAMES_PREFIX = 'ani-cursor-'

/** 已注入的 @keyframes 引用计数，避免同一光标被重复注入 */
const keyframesRefs = new Map<string, { count: number; el: HTMLStyleElement }>()

function hash(input: string): string {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/** 把一帧缩放到目标尺寸并转成 PNG data URL */
function frameToDataURL(frame: HTMLCanvasElement, width: number, height: number): string {
  if (frame.width === width && frame.height === height) return frame.toDataURL('image/png')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return frame.toDataURL('image/png')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(frame, 0, 0, width, height)
  return canvas.toDataURL('image/png')
}

function acquireKeyframes(info: ANIInfo): void {
  const existing = keyframesRefs.get(info.keyframesName)
  if (existing) {
    existing.count++
    return
  }
  const el = document.createElement('style')
  el.setAttribute('data-ani-cursor-keyframes', info.keyframesName)
  el.textContent = info.keyFrameContent
  document.head.appendChild(el)
  keyframesRefs.set(info.keyframesName, { count: 1, el })
}

function releaseKeyframes(name: string): void {
  const entry = keyframesRefs.get(name)
  if (!entry) return
  entry.count--
  if (entry.count <= 0) {
    entry.el.remove()
    keyframesRefs.delete(name)
  }
}

/**
 * 加载一个 ani 文件，返回包含逐帧图像与关键帧信息的对象。
 * hotspotX / hotspotY 需同时传入才会生效，否则使用 ani 文件自带的热区（按尺寸缩放）。
 */
export async function LoadANICursorPromise(
  aniURL: string,
  cursorType = 'auto',
  width = 32,
  height = 32,
  hotspotX?: number,
  hotspotY?: number
): Promise<ANIInfo> {
  const ani = await loadAni(aniURL)

  const scaleX = width / ani.size.w
  const scaleY = height / ani.size.h
  const customHotspot = hotspotX !== undefined && hotspotY !== undefined
  const hotX = customHotspot ? (hotspotX as number) : Math.round(ani.hotspot.x * scaleX)
  const hotY = customHotspot ? (hotspotY as number) : Math.round(ani.hotspot.y * scaleY)

  const frameURLs = ani.frames.map((frame) => frameToDataURL(frame, width, height))
  const totalRoundTime = ani.durations.reduce((sum, duration) => sum + duration, 0)

  // cursor 是离散属性，用百分比关键帧 + step-end 保证每帧停留整段时长
  const steps: string[] = []
  let elapsed = 0
  for (let i = 0; i < frameURLs.length; i++) {
    const percent = totalRoundTime > 0 ? (elapsed / totalRoundTime) * 100 : 0
    steps.push(
      `  ${Number(percent.toFixed(4))}% { cursor: url("${frameURLs[i]}") ${hotX} ${hotY}, ${cursorType}; }`
    )
    elapsed += ani.durations[i]
  }

  const keyframesName =
    KEYFRAMES_PREFIX + hash(`${aniURL}|${width}|${height}|${hotX}|${hotY}|${cursorType}`)
  const frameInfo: FrameInfo[] = ani.durations.map((duration, index) => ({ index, duration }))

  return {
    keyframesName,
    keyFrameContent: `@keyframes ${keyframesName} {\n${steps.join('\n')}\n}`,
    totalRoundTime,
    frameURLs,
    frameInfo,
    hotspot: { x: hotX, y: hotY },
    cursorType
  }
}

/** 把已加载的光标应用到指定 CSS 选择器，返回注入的 style 元素 */
export async function setLoadedCursorToElement(
  elementSelector: string,
  loadedCursorPromise: Promise<ANIInfo>
): Promise<HTMLStyleElement> {
  const info = await loadedCursorPromise
  acquireKeyframes(info)
  const style = document.createElement('style')
  style.setAttribute('data-ani-cursor', info.keyframesName)
  style.textContent =
    `${elementSelector} { animation: ${info.keyframesName} ` +
    `${Math.round(info.totalRoundTime)}ms infinite step-end; }`
  document.head.appendChild(style)
  return style
}

/**
 * 给单个 CSS 选择器设置 ani 动画光标。
 * @returns 控制器，可用于 await ready 或 destroy()
 */
export function setANICursor(
  elementSelector: string,
  aniURL: string,
  cursorType = 'auto',
  width = 32,
  height = 32,
  hotspotX?: number,
  hotspotY?: number
): CursorController {
  let destroyed = false
  let ruleEl: HTMLStyleElement | null = null
  let keyframesName = ''

  const ready = LoadANICursorPromise(aniURL, cursorType, width, height, hotspotX, hotspotY)
    .then((info) => {
      if (destroyed) return // 加载完成前已销毁，不再注入
      keyframesName = info.keyframesName
      acquireKeyframes(info)
      ruleEl = document.createElement('style')
      ruleEl.setAttribute('data-ani-cursor', keyframesName)
      ruleEl.textContent =
        `${elementSelector} { animation: ${keyframesName} ` +
        `${Math.round(info.totalRoundTime)}ms infinite step-end; }`
      document.head.appendChild(ruleEl)
    })
    .catch((err) => {
      console.warn('[ani-cursor] 加载失败:', aniURL, err)
    })

  return {
    ready,
    get destroyed() {
      return destroyed
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      if (ruleEl) {
        ruleEl.remove()
        ruleEl = null
      }
      if (keyframesName) releaseKeyframes(keyframesName)
    }
  }
}

/** 给一组 CSS 选择器设置同一个 ani 动画光标 */
export function setANICursorWithGroupElement(
  elementSelectors: string[],
  aniURL: string,
  cursorType = 'auto',
  width = 32,
  height = 32,
  hotspotX?: number,
  hotspotY?: number
): CursorController {
  return setANICursor(
    elementSelectors.join(', '),
    aniURL,
    cursorType,
    width,
    height,
    hotspotX,
    hotspotY
  )
}

/**
 * 扫描已加载的样式表，按 cursor 值分组收集所有声明过 cursor 的选择器。
 *
 * 为什么需要：cursor 虽可继承，但元素自身声明的 cursor 会击败继承值。
 * 项目里大量元素自带 cursor（卡片、按钮、表格列宽拖拽柄等），它们不属于 a/button，
 * 若不逐个纳入动画范围，鼠标划过时仍会显示系统指针。
 *
 * 一次遍历完成全部分组——按 cursor 值逐个扫描会重复遍历整份样式表，
 * Element Plus 这类大样式表重复十几次并不划算。
 */
export function collectSelectorsByCursors(cursors: string[]): Map<string, string[]> {
  const wanted = new Set(cursors)
  const buckets = new Map<string, Set<string>>()

  const walk = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      const styleRule = rule as CSSStyleRule
      const cursor = styleRule.style?.getPropertyValue('cursor')
      if (cursor && wanted.has(cursor) && styleRule.selectorText) {
        let bucket = buckets.get(cursor)
        if (!bucket) buckets.set(cursor, (bucket = new Set<string>()))
        bucket.add(styleRule.selectorText)
      }
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) walk(nested)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.cssRules) walk(sheet.cssRules)
    } catch {
      /* 跨域样式表无法读取 cssRules，跳过 */
    }
  }

  const result = new Map<string, string[]>()
  for (const [cursor, set] of buckets) result.set(cursor, [...set])
  return result
}

export { loadAni, clearAniCache } from './decode'
export type { ANIInfo, CursorController, DecodedAni, FrameInfo } from './types'
