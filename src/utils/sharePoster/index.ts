import type { QrMatrix } from '@/utils/qrcode'

/**
 * 文章分享海报
 *
 * 固定输出 16:9（1920×1080）：封面铺满，底部渐变压暗后把信息压在图上，
 * 字号/间距按画幅等比缩放（基准宽 1080），二维码在右下。
 * 备选（card）：1080×1350 的「上封面下信息」，传 `variant: 'card'` 才启用。
 * 没有封面时用 typographic：深色底 + 大字排版，不拿站点默认图冒充。
 * 纯 canvas 手绘，不引 html2canvas。
 */
export const POSTER_WIDTH = 1080
export const POSTER_HEIGHT = 1350

/** 16:9 横版（左侧封面 + 右侧信息），适合当文章头图 / 社交卡片 */
const WIDE_WIDTH = 1920
const WIDE_HEIGHT = 1080

/** 统一的画布内边距 */
const PADDING = 72
/** 卡片式的封面高度（约占 52%） */
const CARD_COVER_HEIGHT = 700
const CARD_PADDING_X = 64

const FONT_FAMILY = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif'
const COLOR_TITLE = '#16181d'
const COLOR_MUTED = '#9aa0ab'
const COLOR_LINE = '#ececec'
const COLOR_DARK_BG = '#14161a'
const ACCENT = '#fd4781'

export type PosterVariant = 'wide' | 'card'

export interface PosterData {
    title: string
    description?: string
    cover?: string
    /** "2026-09-28 10:00:00" 或 ISO 字符串 */
    publishTime?: string
    author?: string
    avatar?: string
    siteName: string
    /** 二维码指向的地址 */
    url: string
    /** 文章封面加载失败时的兜底图（一般传站点默认分享图，同源才能画上去） */
    fallbackCover?: string
    /** 版式，默认 wide（1920×1080）；传 card 可回到 1080×1350 的上封面下信息 */
    variant?: PosterVariant
}

export interface PosterResult {
    canvas: HTMLCanvasElement
    /** 是否成功画上封面图 */
    coverLoaded: boolean
}

const font = (size: number, weight: string | number = 400) =>
    `${weight} ${size}px ${FONT_FAMILY}`

/** 单次加载：带 crossorigin 请求，失败返回 null */
function loadOnce(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image()
        // 图床必须返回 Access-Control-Allow-Origin，否则画上去会污染画布、导不出来
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
    })
}

/**
 * 给地址加一个固定参数，强制换一个缓存 key
 * CDN 边缘可能存着「页面里普通 img 请求」留下的副本——那次请求不带 Origin，
 * 图床不会回 Access-Control-Allow-Origin，于是这份缓存对 canvas 不可用。
 * 我们带 Origin 的请求命中它就会被拦，换个 key 才会真正回源拿到带头的那份。
 */
function withCorsBust(src: string): string {
    const [head, hash = ''] = src.split('#')
    const joiner = head.includes('?') ? '&' : '?'
    return `${head}${joiner}crossorigin=1${hash ? `#${hash}` : ''}`
}

/** 加载图片；首次失败（多为命中无 CORS 头的边缘缓存）自动换 key 重试一次 */
async function loadImage(src?: string): Promise<HTMLImageElement | null> {
    if (!src) return Promise.resolve(null)
    const first = await loadOnce(src)
    if (first) return first
    return loadOnce(withCorsBust(src))
}

/** 圆角矩形路径 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
}

/** 等比铺满目标区域（超出部分居中裁掉） */
function drawCoverFit(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number
) {
    const scale = Math.max(w / img.width, h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

/**
 * 把文本切成「不可拆」的片段：连续的英文/数字算一个词，中文按字
 * 按字符硬切会出现 "JavaSc / ript" 这种断词，很难看
 */
function tokenize(text: string): string[] {
    const tokens: string[] = []
    let latin = ''
    for (const char of text) {
        if (/[A-Za-z0-9@._\-+#]/.test(char)) {
            latin += char
            continue
        }
        if (latin) {
            tokens.push(latin)
            latin = ''
        }
        tokens.push(char)
    }
    if (latin) tokens.push(latin)
    return tokens
}

/** 按宽度折行，返回是否被截断（截断时末行补省略号） */
function wrapLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number
): { lines: string[], truncated: boolean } {
    // 单个词本身就超宽时（长链接等）退回按字符切
    const tokens = tokenize(text).flatMap((token) =>
        ctx.measureText(token).width > maxWidth ? Array.from(token) : [token])

    const lines: string[] = []
    let line = ''
    let truncated = false

    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index]
        const candidate = line + token
        if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line)
            line = token === ' ' ? '' : token
            if (lines.length === maxLines) {
                truncated = index < tokens.length - 1
                break
            }
        } else {
            line = !line && token === ' ' ? '' : candidate
        }
    }
    if (line && lines.length < maxLines) lines.push(line)

    if (truncated) {
        let last = lines[maxLines - 1] ?? ''
        while (last && ctx.measureText(`${last}…`).width > maxWidth) {
            last = last.slice(0, -1)
        }
        lines[maxLines - 1] = `${last}…`
    }
    return { lines, truncated }
}

/** 单行省略 */
function ellipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text
    let result = text
    while (result && ctx.measureText(`${result}…`).width > maxWidth) {
        result = result.slice(0, -1)
    }
    return `${result}…`
}

/**
 * 标题自适应：从最大字号开始试，装不下就降一档
 * 固定字号遇到长标题只能缩到很小或截断，逐级降字号观感更好
 */
function fitTitle(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    sizes: number[],
    maxLines: number
): { size: number, lines: string[] } {
    for (const size of sizes) {
        ctx.font = font(size, 'bold')
        const { lines, truncated } = wrapLines(ctx, text, maxWidth, maxLines)
        if (!truncated) return { size, lines }
    }
    const size = sizes[sizes.length - 1]
    ctx.font = font(size, 'bold')
    return { size, lines: wrapLines(ctx, text, maxWidth, maxLines).lines }
}

/** 从发布时间的字符串里取日 / 年月 / 完整日期，不依赖时区解析 */
function parseDate(publishTime?: string) {
    const match = (publishTime || '').match(/(\d{4})\D(\d{2})\D(\d{2})/)
    if (!match) return null
    return {
        day: match[3],
        month: `${match[1]} ${match[2]}`,
        full: `${match[1]}.${match[2]}.${match[3]}`,
    }
}

/**
 * 采样封面平均亮度（0~1）
 * 压层透明度按它决定：亮封面压得更重，否则白字会糊在亮部里
 */
function sampleLuminance(img: HTMLImageElement): number {
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 8
        canvas.height = 8
        const ctx = canvas.getContext('2d')
        if (!ctx) return 0.5
        ctx.drawImage(img, 0, 0, 8, 8)
        const { data } = ctx.getImageData(0, 0, 8, 8)
        let sum = 0
        for (let i = 0; i < data.length; i += 4) {
            sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        }
        return sum / (data.length / 4)
    } catch {
        // 拿不到像素就按中等亮度处理，保证压层不至于太薄
        return 0.5
    }
}

/** 二维码：白底圆角卡片，压在图上也能扫 */
function drawQrCard(ctx: CanvasRenderingContext2D, qr: QrMatrix, x: number, y: number, size: number) {
    const pad = 16
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, x, y, size, size, 10)
    ctx.fill()

    const inner = size - pad * 2
    const cell = inner / qr.size
    ctx.fillStyle = COLOR_TITLE
    for (let row = 0; row < qr.size; row++) {
        for (let col = 0; col < qr.size; col++) {
            if (!qr.isDark(row, col)) continue
            // 向上取整，避免相邻模块之间出现白缝
            ctx.fillRect(
                Math.round(x + pad + col * cell),
                Math.round(y + pad + row * cell),
                Math.ceil(cell),
                Math.ceil(cell)
            )
        }
    }
}

/** 作者头像：圆形裁切，取不到就画个占位圆（底色按深/浅色面板传） */
function drawAvatar(
    ctx: CanvasRenderingContext2D,
    avatar: HTMLImageElement | null,
    x: number, y: number, size: number,
    placeholder = 'rgba(255, 255, 255, 0.16)'
) {
    if (!avatar) {
        ctx.fillStyle = placeholder
        ctx.beginPath()
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()
        return
    }
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    drawCoverFit(ctx, avatar, x, y, size, size)
    ctx.restore()
}

/** ---------- 主版式：封面铺满 + 底部压字（竖版 4:5 与横版 16:9 共用同一套排布） ---------- */
function layoutOverlay(
    ctx: CanvasRenderingContext2D,
    data: PosterData,
    cover: HTMLImageElement,
    avatar: HTMLImageElement | null,
    qr: QrMatrix,
    width: number,
    height: number
) {
    // 字号 / 间距 / 边距按画幅宽度等比缩放：横版画布是竖版的 1.78 倍宽，
    // 字号统一按画幅宽度取比例（参照首页卡片：标题约占宽 4.2%，日期/摘要 2.4~2.6%）
    // 之前按竖版像素放大 1.78 倍，标题占到 6.7%，信息块把封面吃掉太多
    const padding = Math.round(width * 0.045)
    const qrSize = Math.round(width * 0.1)
    const metaSize = Math.round(width * 0.026)
    const descSize = Math.round(width * 0.024)
    const authorSize = Math.round(width * 0.025)
    const avatarSize = Math.round(width * 0.042)
    const gap = Math.round(width * 0.012)
    const titleSizes = [0.042, 0.038, 0.034, 0.030].map((ratio) => Math.round(width * ratio))

    drawCoverFit(ctx, cover, 0, 0, width, height)

    const qrX = width - padding - qrSize
    const qrY = height - padding - qrSize
    const textWidth = qrX - gap * 3 - padding

    const { size, lines } = fitTitle(ctx, data.title, textWidth, titleSizes, 2)
    const titleLineHeight = size * 1.22
    const date = parseDate(data.publishTime)
    const dateText = [date?.full, data.siteName].filter(Boolean).join(' · ')
    const hasDesc = Boolean(data.description)
    const metaHeight = Math.round(metaSize * 1.25)
    const descHeight = Math.round(descSize * 1.3)

    const blockHeight = metaHeight + Math.round(gap * 0.9)
        + lines.length * titleLineHeight
        + (hasDesc ? gap + descHeight : 0)
        + gap + avatarSize
    let y = height - padding - blockHeight

    // 压层分两层：整张轻压（让白字在任何封面上都立得住）+ 底部渐变（托住文字块）
    const lum = sampleLuminance(cover)
    const alpha = lum > 0.7 ? 0.94 : lum > 0.5 ? 0.88 : 0.82
    ctx.fillStyle = 'rgba(10, 11, 13, 0.12)'
    ctx.fillRect(0, 0, width, height)

    const scrimTop = Math.max(height * 0.16, y - height * 0.22)
    const scrim = ctx.createLinearGradient(0, scrimTop, 0, height)
    scrim.addColorStop(0, 'rgba(10, 11, 13, 0)')
    scrim.addColorStop(0.35, `rgba(10, 11, 13, ${(alpha * 0.7).toFixed(3)})`)
    scrim.addColorStop(1, `rgba(10, 11, 13, ${alpha})`)
    ctx.fillStyle = scrim
    ctx.fillRect(0, 0, width, height)

    // 文字整体偏小后，靠压层不够，统一加一层轻阴影
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = Math.round(width * 0.009)

    // 日期 · 站点
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
    ctx.font = font(metaSize, 500)
    ctx.fillText(dateText, padding, y)
    y += metaHeight + Math.round(gap * 0.9)

    // 标题（白色粗体，微信二次压缩后也要清楚）
    ctx.fillStyle = '#ffffff'
    ctx.font = font(size, 'bold')
    ctx.shadowBlur = Math.round(width * 0.012)
    for (const line of lines) {
        ctx.fillText(line, padding, y)
        y += titleLineHeight
    }
    ctx.shadowBlur = Math.round(width * 0.009)

    // 摘要一行
    if (hasDesc) {
        y += gap
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = font(descSize, 400)
        ctx.fillText(ellipsis(ctx, data.description!, textWidth), padding, y)
        y += descHeight
    }

    // 作者
    y += gap
    drawAvatar(ctx, avatar, padding, y, avatarSize)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(authorSize, 500)
    ctx.fillText(data.author || data.siteName, padding + avatarSize + Math.round(gap * 0.9), y + Math.round((avatarSize - authorSize) / 2))
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    drawQrCard(ctx, qr, qrX, qrY, qrSize)
}

/** ---------- 备选版式：上封面 + 下信息 ---------- */
function layoutCard(
    ctx: CanvasRenderingContext2D,
    data: PosterData,
    cover: HTMLImageElement | null,
    avatar: HTMLImageElement | null,
    qr: QrMatrix
) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)

    if (cover) {
        drawCoverFit(ctx, cover, 0, 0, POSTER_WIDTH, CARD_COVER_HEIGHT)
    } else {
        const gradient = ctx.createLinearGradient(0, 0, POSTER_WIDTH, CARD_COVER_HEIGHT)
        gradient.addColorStop(0, '#fdf3f6')
        gradient.addColorStop(1, '#f2f4f7')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, POSTER_WIDTH, CARD_COVER_HEIGHT)
    }

    // 日期角标
    const date = parseDate(data.publishTime)
    if (date) {
        const badgeW = 116
        const badgeH = 100
        const badgeX = 40
        const badgeY = CARD_COVER_HEIGHT - 40 - badgeH
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)'
        roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 12)
        ctx.fill()

        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = '#ffffff'
        ctx.font = font(44, 'bold')
        ctx.fillText(date.day, badgeX + badgeW / 2, badgeY + 60)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.86)'
        ctx.font = font(18, 400)
        ctx.fillText(date.month, badgeX + badgeW / 2, badgeY + 84)
        ctx.textAlign = 'left'
    }

    // 标题
    ctx.fillStyle = COLOR_TITLE
    ctx.font = font(56, 'bold')
    ctx.textBaseline = 'alphabetic'
    const { lines } = wrapLines(ctx, data.title, POSTER_WIDTH - CARD_PADDING_X * 2, 2)
    lines.forEach((line, index) => {
        ctx.fillText(line, CARD_PADDING_X, 800 + index * 74)
    })

    // 摘要
    if (data.description) {
        const descY = 944
        ctx.fillStyle = '#d9dce1'
        ctx.fillRect(CARD_PADDING_X, descY - 20, 4, 26)
        ctx.fillStyle = COLOR_MUTED
        ctx.font = font(26, 400)
        ctx.fillText(ellipsis(ctx, data.description, POSTER_WIDTH - CARD_PADDING_X * 2 - 22), CARD_PADDING_X + 20, descY)
    }

    // 分割线
    ctx.strokeStyle = COLOR_LINE
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CARD_PADDING_X, 1144)
    ctx.lineTo(POSTER_WIDTH - CARD_PADDING_X, 1144)
    ctx.stroke()

    // 作者
    const avatarSize = 76
    const avatarY = 1180
    drawAvatar(ctx, avatar, CARD_PADDING_X, avatarY, avatarSize, 'rgba(0, 0, 0, 0.06)')
    const textX = CARD_PADDING_X + avatarSize + 24
    ctx.fillStyle = COLOR_MUTED
    ctx.font = font(22, 400)
    ctx.fillText('作者', textX, 1200)
    ctx.fillStyle = COLOR_TITLE
    ctx.font = font(30, 500)
    ctx.fillText(data.author || data.siteName, textX, 1236)
    ctx.fillStyle = COLOR_MUTED
    ctx.font = font(22, 400)
    ctx.fillText('扫码阅读', textX, 1274)
    ctx.fillStyle = COLOR_TITLE
    ctx.font = font(30, 500)
    ctx.fillText(data.siteName, textX, 1310)

    drawQrCard(ctx, qr, POSTER_WIDTH - CARD_PADDING_X - 196, 1164, 196)
}

/** ---------- 无封面版式：深色底 + 大字排版 ---------- */
function layoutTypographic(
    ctx: CanvasRenderingContext2D,
    data: PosterData,
    avatar: HTMLImageElement | null,
    qr: QrMatrix,
    width: number,
    height: number
) {
    // 同 overlay：字号与间距按画幅宽度等比缩放
    const scale = width / POSTER_WIDTH
    const padding = Math.round(PADDING * scale)
    const qrSize = Math.round(196 * Math.min(scale, 1.5))
    const titleSizes = [72, 64, 56, 48].map((value) => Math.round(value * scale))
    const descSize = Math.round(28 * scale)
    const descLineHeight = Math.round(44 * scale)
    const avatarSize = Math.round(56 * scale)
    const authorSize = Math.round(30 * scale)

    ctx.fillStyle = COLOR_DARK_BG
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    // 左上角站点名 + 粉色短线
    ctx.fillStyle = ACCENT
    ctx.font = font(Math.round(24 * scale), 500)
    ctx.fillText(data.siteName, padding, Math.round(120 * scale))
    ctx.fillStyle = ACCENT
    ctx.fillRect(padding, Math.round(162 * scale), Math.round(64 * scale), Math.max(4, Math.round(4 * scale)))

    // 右侧要留出二维码的位置，否则描述第二行会压到码上
    const textWidth = width - padding * 2 - qrSize - Math.round(16 * scale)
    const { size, lines } = fitTitle(
        ctx, data.title, textWidth, titleSizes, 2
    )
    const titleLineHeight = size * 1.2
    // 量宽用的是当前 ctx.font，先切到摘要字号再折行
    ctx.font = font(descSize, 400)
    const descLines = data.description
        ? wrapLines(ctx, data.description, textWidth, 2).lines
        : []

    const baseY = height - padding - avatarSize
    const blockGap = Math.round(28 * scale)
    const blockHeight = lines.length * titleLineHeight
        + (descLines.length ? blockGap + descLines.length * descLineHeight : 0)
    // 文字块贴着底部作者行往上排，避免和作者/日期叠在一起
    let y = baseY - Math.round(36 * scale) - blockHeight

    ctx.fillStyle = '#ffffff'
    ctx.font = font(size, 'bold')
    for (const line of lines) {
        ctx.fillText(line, padding, y)
        y += titleLineHeight
    }

    if (descLines.length) {
        y += blockGap
        ctx.fillStyle = 'rgba(255, 255, 255, 0.58)'
        ctx.font = font(descSize, 400)
        for (const line of descLines) {
            ctx.fillText(line, padding, y)
            y += descLineHeight
        }
    }

    // 底部：作者 + 日期 + 二维码
    const qrX = width - padding - qrSize
    const qrY = height - padding - qrSize

    drawAvatar(ctx, avatar, padding, baseY, avatarSize)
    const nameY = baseY + Math.round((avatarSize - authorSize) / 2) - Math.round(12 * scale)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(authorSize, 500)
    ctx.fillText(data.author || data.siteName, padding + avatarSize + Math.round(14 * scale), nameY)

    const date = parseDate(data.publishTime)
    if (date) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = font(Math.round(24 * scale), 400)
        ctx.fillText(date.full, padding + avatarSize + Math.round(14 * scale), nameY + authorSize + Math.round(12 * scale))
    }

    drawQrCard(ctx, qr, qrX, qrY, qrSize)
}


export async function renderSharePoster(data: PosterData): Promise<PosterResult> {
    const isCard = data.variant === 'card'
    const canvas = document.createElement('canvas')
    canvas.width = isCard ? POSTER_WIDTH : WIDE_WIDTH
    canvas.height = isCard ? POSTER_HEIGHT : WIDE_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    // 二维码库 52KB，只有真的生成海报时才加载，不占详情页的首屏体积
    const { createQrMatrix } = await import('@/utils/qrcode')
    const qr = createQrMatrix(data.url)

    let cover = await loadImage(data.cover)
    if (!cover && data.cover) {
        // 最常见的失败原因是图床没回 Access-Control-Allow-Origin：图片能显示，但画到 canvas 上就污染
        console.warn('[sharePoster] 文章封面加载失败，请检查图床是否允许跨域：', data.cover)
        cover = await loadImage(data.fallbackCover)
    }
    const avatar = await loadImage(data.avatar)
    const coverLoaded = Boolean(cover)

    if (isCard && cover) {
        layoutCard(ctx, data, cover, avatar, qr)
    } else if (cover) {
        layoutOverlay(ctx, data, cover, avatar, qr, canvas.width, canvas.height)
    } else {
        layoutTypographic(ctx, data, avatar, qr, canvas.width, canvas.height)
    }

    return { canvas, coverLoaded }
}

/** 下载用的文件名：去掉标题里不能做文件名的字符 */
export function posterFileName(title: string): string {
    const safe = title.replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 40)
    return `${safe || 'share'}.png`
}

/** canvas → Blob，供下载或 navigator.share 使用 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1))
}
