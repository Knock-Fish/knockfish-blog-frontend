import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import type { Logger, Plugin } from 'vite'
import subsetFont from 'subset-font'

/**
 * 字体子集化插件
 *
 * 扫描 src 源码收集实际出现过的字符，用 HarfBuzz WASM 裁剪字库并输出 woff2。
 * 触发时机由 Vite 托管——dev 启动与 build 时自动执行，产物变化时还会增量重跑，
 * 开发者不需要手动执行任何脚本。
 */

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const SRC_DIR = path.join(ROOT, 'src')
const FONT_DIR = path.join(SRC_DIR, 'assets', 'fonts')
const CACHE_FILE = path.join(
  ROOT,
  'node_modules',
  '.cache',
  'knockfish-font-subset',
  'charset.hash',
)

/** 原始字库 -> 生成的子集（原始字库放在 source/ 下，不参与打包） */
const FONTS = [
  { source: 'LeMiCookie.ttf', output: 'LeMiCookie.woff2' },
  { source: 'ZCOOLKuaiLe-Regular.ttf', output: 'ZCOOLKuaiLe-Regular.woff2' },
]

/** 需要扫描的源码后缀 */
const SCAN_EXT = /\.(vue|ts|tsx|js|jsx|html)$/

/** 兜底字符：即使源码里没出现也保留，避免常见场景缺字 */
const BASE_CHARS = new Set<string>([
  // ASCII 可见字符
  ...Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(i + 0x20)),
  // 中文标点与常用符号
  ...'，。！？、；：（）《》【】…—·“”‘’￥%℃№',
  '　', // 全角空格
])

/** 递归收集源码文件 */
function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectFiles(full, acc)
    } else if (SCAN_EXT.test(entry.name)) {
      acc.push(full)
    }
  }
  return acc
}

/** 跳过控制字符与 Unicode 非打印类别（Cf/Cs/Co/Cn） */
function isPrintable(char: string): boolean {
  const code = char.codePointAt(0)
  if (code === undefined) return false
  if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return false
  return !/[\p{Cf}\p{Cs}\p{Co}\p{Cn}]/u.test(char)
}

/** 扫描源码，收集站点实际使用到的字符 */
function collectChars(): Set<string> {
  const chars = new Set(BASE_CHARS)
  for (const file of collectFiles(SRC_DIR)) {
    const content = fs.readFileSync(file, 'utf8')
    for (const char of content) {
      if (isPrintable(char)) chars.add(char)
    }
  }
  return chars
}

/** 按字符集裁剪字体并输出 woff2 */
async function subsetOne(font: { source: string; output: string }, charset: Set<string>, logger: Logger) {
  const sourcePath = path.join(FONT_DIR, 'source', font.source)
  if (!fs.existsSync(sourcePath)) {
    logger.warn(`[font-subset] 未找到原始字库：${path.relative(ROOT, sourcePath)}`)
    return { rawSize: 0, outSize: 0 }
  }

  const text = [...charset].join('')
  const raw = await fs.promises.readFile(sourcePath)
  const woff2 = await subsetFont(raw, text, { targetFormat: 'woff2' })
  const outPath = path.join(FONT_DIR, font.output)
  await fs.promises.writeFile(outPath, Buffer.from(woff2))

  const rawSize = raw.byteLength
  const outSize = fs.statSync(outPath).size
  logger.info(
    `[font-subset] ${font.source} -> ${font.output}：` +
      `${(rawSize / 1024 / 1024).toFixed(2)}MB -> ${(outSize / 1024).toFixed(1)}KB` +
      `（减少 ${(100 - (outSize / rawSize) * 100).toFixed(1)}%）`,
  )
  return { rawSize, outSize }
}

/**
 * 执行一次子集化。
 * 字符集哈希未变化时直接跳过，避免 dev 每次启动都重算。
 * @returns 是否真的重新生成了字体
 */
async function run(logger: Logger): Promise<boolean> {
  const charset = collectChars()
  const hash = createHash('md5')
    .update([...charset].sort().join(''))
    .digest('hex')

  const outputsReady = FONTS.every((font) => fs.existsSync(path.join(FONT_DIR, font.output)))
  const cacheHit =
    fs.existsSync(CACHE_FILE) && fs.readFileSync(CACHE_FILE, 'utf8').trim() === hash

  if (cacheHit && outputsReady) {
    logger.info(`[font-subset] 字符集无变化（${charset.size} 个字符），跳过`)
    return false
  }

  const started = Date.now()
  logger.info(`[font-subset] 收集到 ${charset.size} 个唯一字符，开始子集化…`)

  let totalRaw = 0
  let totalOut = 0
  for (const font of FONTS) {
    const { rawSize, outSize } = await subsetOne(font, charset, logger)
    totalRaw += rawSize
    totalOut += outSize
  }

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
  fs.writeFileSync(CACHE_FILE, hash, 'utf8')

  if (totalRaw > 0) {
    logger.info(
      `[font-subset] 合计 ${(totalRaw / 1024 / 1024).toFixed(2)}MB -> ` +
        `${(totalOut / 1024).toFixed(1)}KB，耗时 ${Date.now() - started}ms`,
    )
  }
  return true
}

export function fontSubsetPlugin(): Plugin {
  let logger: Logger | null = null
  // 同一时刻只允许一个子集化任务；期间到达的请求合并为「再跑一轮」，
  // 避免 watcher 的高频事件把任务叠加起来（会重复耗时并并发写同一文件）
  let inflight: Promise<void> | null = null
  let queued = false

  async function runOnce(log: Logger): Promise<void> {
    if (inflight) {
      queued = true
      return inflight
    }
    const task = (async () => {
      do {
        queued = false
        await run(log)
      } while (queued)
    })()
    inflight = task.finally(() => {
      inflight = null
    })
    return inflight
  }

  return {
    name: 'knockfish:font-subset',
    configResolved(config) {
      logger = config.logger
    },
    async buildStart() {
      if (logger) await runOnce(logger)
    },
    // dev 下源码变化后自动重跑；重新生成会改动 woff2，
    // Vite 监听到该资源变化会自行刷新页面，无需手动 reload
    configureServer(server) {
      let timer: ReturnType<typeof setTimeout> | null = null
      const schedule = (file: string) => {
        const rel = path.relative(SRC_DIR, file)
        if (rel.startsWith('..') || path.isAbsolute(rel)) return
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          timer = null
          void runOnce(server.config.logger)
        }, 400)
      }
      server.watcher.on('change', schedule)
      server.watcher.on('add', schedule)
      server.watcher.on('unlink', schedule)
    },
  }
}
