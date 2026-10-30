/**
 * 页面级 SEO / 分享信息
 *
 * SPA 只有一个 index.html，切换路由时 title 与 Open Graph 标签不会自动变化，
 * 导致每页分享出去都是同一张卡片。这里统一管理：
 * - 路由级信息由 router/guards/afterEach.ts 从 meta 读取后写入
 * - 详情页拿到数据后再调用一次，用真实标题 / 简介 / 封面覆盖
 */
export const SITE = {
    name: '鱼博客',
    title: '鱼博客',
    description: '这里是鱼博客 - 分享知识，记录生活',
    url: 'https://blog.fishbarn.cn',
    image: 'https://blog.fishbarn.cn/og-share.webp',
} as const

/** 标题与站点名之间的连接符 */
const TITLE_SEPARATOR = ' - '

export interface PageMeta {
    /** 页面标题，默认拼成「标题 - 鱼博客」 */
    title?: string
    /** 页面描述，为空时回落到站点描述 */
    description?: string
    /** 分享图，为空时回落到站点默认图 */
    image?: string
    /** og:type，文章 / 笔记详情传 article */
    type?: 'website' | 'article'
    /** 规范化地址，默认取当前地址 */
    url?: string
    /** 发布时间，仅 type=article 时有意义 */
    publishedTime?: string
    /** 修改时间，仅 type=article 时有意义 */
    modifiedTime?: string
    /** 标题已是完整句子时置 true，不再拼接站点名（首页用） */
    absolute?: boolean
}

/** 把相对路径补成绝对地址，社交平台抓取时只认绝对地址 */
function toAbsoluteUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url
    return new URL(url, window.location.origin).href
}

/** 写入 / 更新 / 移除单个 meta 标签（content 为空则移除，避免残留上一页信息） */
function setMeta(attr: 'name' | 'property', key: string, content?: string): void {
    const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!content) {
        el?.remove()
        return
    }
    if (el) {
        el.setAttribute('content', content)
        return
    }
    const meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    meta.setAttribute('content', content)
    document.head.appendChild(meta)
}

/** 写入 canonical 链接，便于搜索引擎归并带参数的重复地址 */
function setCanonical(href: string): void {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', 'canonical')
        document.head.appendChild(el)
    }
    el.setAttribute('href', href)
}

/** 更新当前页面的标题、描述与分享卡片信息 */
export function setPageMeta(meta: PageMeta = {}): void {
    const title = meta.title
        ? (meta.absolute ? meta.title : `${meta.title}${TITLE_SEPARATOR}${SITE.name}`)
        : SITE.title
    const description = meta.description || SITE.description
    const image = toAbsoluteUrl(meta.image || SITE.image)
    const url = meta.url || window.location.href

    document.title = title

    setMeta('name', 'description', description)

    setMeta('property', 'og:type', meta.type ?? 'website')
    setMeta('property', 'og:site_name', SITE.name)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:locale', 'zh_CN')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)

    // 非文章页要把上一篇文章的时间清掉
    setMeta('property', 'article:published_time', meta.publishedTime)
    setMeta('property', 'article:modified_time', meta.modifiedTime)

    setCanonical(url)
}
