<template>
    <div class="music-player-wrapper">
        <!-- 加载占位 -->
        <div v-if="loading" class="player-placeholder">
            <SvgIcon icon="mdi:music-note-whole" :size="20" />
            <span>加载中...</span>
        </div>
        <!-- APlayer 挂载容器（DOM 必须稳定存在，不能 v-if / v-show 切换） -->
        <div ref="playerRef" class="aplayer-box"></div>
    </div>
</template>

<script setup lang="ts">
interface AudioItem {
    title: string
    author: string
    url: string
    pic: string
    lrc?: string
}
interface Props {
    server?: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
    type?: 'song' | 'playlist' | 'album' | 'search' | 'artist'
    playlistId?: string
    theme?: string
    fixed?: boolean
    autoplay?: boolean
    loop?: 'all' | 'one' | 'none'
    order?: 'list' | 'random'
    volume?: number
    listFolded?: boolean
    listMaxHeight?: string
    mini?: boolean
    mutex?: boolean
    preload?: 'auto' | 'metadata' | 'none'
    /** Meting API 地址（可自建） */
    api?: string
    /** 直接传本地/自定义歌单，设置后优先级最高，不再扫描本地目录与请求 Meting */
    customAudio?: AudioItem[]
    /** 是否使用 public/music 目录下的本地音频文件（默认 true，不依赖任何在线解析） */
    useLocal?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    server: 'netease',
    type: 'playlist',
    playlistId: '7620268871',
    theme: '#2980b9',
    fixed: false,
    autoplay: false,
    loop: 'all',
    order: 'list',
    volume: 0.7,
    listFolded: true,
    listMaxHeight: '180px',
    mini: false,
    mutex: true,
    preload: 'auto',
    api: 'https://api.i-meto.com/meting/api',
    customAudio: () => [] as AudioItem[],
    useLocal: true,
})

// 本地 aplayer 静态资源路径（对应 public/libs/aplayer/ 目录）
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const LOCAL_CSS = `${BASE}/libs/aplayer/APlayer.min.css`
const LOCAL_JS = `${BASE}/libs/aplayer/APlayer.min.js`

// public/music 本地音频（Vite 构建期扫描，不用 fs）
// import.meta.glob 路径必须是纯字符串字面量，不能用模板字符串插值
const LOCAL_AUDIO_MAP: Record<string, string> = import.meta.glob(
    '../../../public/music/**/*.{mp3,flac,m4a,wav,ogg,aac}',
    { as: 'url', eager: true },
)
// 同时扫描封面：public/music/cover.(jpg/jpeg/png/webp)
const LOCAL_COVER_MAP: Record<string, string> = import.meta.glob(
    '../../../public/music/cover.{jpg,jpeg,png,webp}',
    { as: 'url', eager: true },
)
const DEFAULT_COVER: string =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff9ebb"/>
                    <stop offset="100%" stop-color="#8ba4ff"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
            <text x="50%" y="54%" font-family="Arial" font-size="76" fill="white" text-anchor="middle" dominant-baseline="middle">♪</text>
        </svg>`,
    )
const localCoverUrl = Object.values(LOCAL_COVER_MAP)[0] || DEFAULT_COVER

const BASE_NAME_RE = /(.*)[\\/]([^\\/]+)$/
const EXT_RE = /\.[^.]+$/
/** 从 "标题-歌手.ext" / "标题.ext" 中提取 title / author */
const parseFileName = (filePath: string) => {
    const m = filePath.match(BASE_NAME_RE)
    const base = (m ? m[2] : filePath).replace(EXT_RE, '')
    const idxDash = base.search(/\s*[-–—]\s*/)
    if (idxDash >= 0) {
        const title = base.slice(0, idxDash).trim()
        const author = base.slice(idxDash).replace(/^\s*[-–—]\s*/, '').trim()
        return { title: title || base, author }
    }
    return { title: base, author: '' }
}

/** 扫描 public/music 下的本地音频并生成 APlayer 歌单 */
const scanLocalPlaylist = (): AudioItem[] => {
    const entries = Object.entries(LOCAL_AUDIO_MAP)
    if (!entries.length) return []
    return entries.map(([srcFile, webUrl]) => {
        const { title, author } = parseFileName(srcFile)
        return {
            title,
            author,
            url: webUrl,
            pic: localCoverUrl,
        }
    })
}

const playerRef = useTemplateRef<HTMLElement>('playerRef')
const loading = ref(true)
let player: any = null

/** 去重注入本地 link / script，不走 CDN */
const injectLocal = (
    tag: 'link' | 'script',
    attrs: Record<string, string>,
    checkReady?: () => boolean,
) => {
    const key = Object.values(attrs).join('|')
    const id = 'kf-local-' + tag + '-' + btoa(key).slice(0, 16)
    if (document.getElementById(id)) return Promise.resolve()
    if (checkReady && checkReady()) return Promise.resolve()
    return new Promise<void>((resolve, reject) => {
        const el = document.createElement(tag) as any
        el.id = id
        Object.entries(attrs).forEach(([k, v]) => {
            try { el.setAttribute(k, v) } catch { /* noop */ }
        })
        el.addEventListener('load', () => resolve())
        el.addEventListener('error', (e: any) =>
            reject(e?.error || new Error(`本地 ${tag} 加载失败：${attrs.href || attrs.src}`)),
        )
        document.head.appendChild(el)
    })
}

const loadAplayer = () =>
    Promise.resolve()
        .then(() => injectLocal('link', { rel: 'stylesheet', href: LOCAL_CSS }))
        .then(() => injectLocal('script', { src: LOCAL_JS, defer: 'defer' }, () => typeof (window as any).APlayer !== 'undefined'))

const fetchPlaylist = async (): Promise<AudioItem[]> => {
    // 优先级 1：显式传入的自定义歌单（最高，覆盖一切）
    if (props.customAudio && props.customAudio.length > 0) return props.customAudio
    // 优先级 2：public/music 本地目录（默认开启，不依赖任何网络）
    if (props.useLocal) {
        const list = scanLocalPlaylist()
        if (list.length) return list
    }
    // 回退：走 Meting API 在线解析
    const url =
        props.api +
        '?server=' + encodeURIComponent(props.server) +
        '&type=' + encodeURIComponent(props.type) +
        '&id=' + encodeURIComponent(props.playlistId) +
        '&r=' + Math.random().toString(36).slice(2, 8)
    const res = await fetch(url)
    if (!res.ok) throw new Error('Meting API HTTP ' + res.status)
    const data = await res.json()
    return Array.isArray(data) ? data : [data]
}

onMounted(async () => {
    try {
        const [audio] = await Promise.all([fetchPlaylist(), loadAplayer()])
        await nextTick()
        if (!playerRef.value) return
        const APlayerCtor = (window as any).APlayer
        if (!APlayerCtor) throw new Error('APlayer 未找到，请确认 public/libs/aplayer/ 下已放入 APlayer.min.js 和 APlayer.min.css')
        player = new APlayerCtor({
            container: playerRef.value,
            fixed: props.fixed,
            mini: props.mini,
            autoplay: props.autoplay,
            theme: props.theme,
            loop: props.loop,
            order: props.order,
            volume: props.volume,
            mutex: props.mutex,
            preload: props.preload,
            listFolded: props.listFolded,
            listMaxHeight: props.listMaxHeight,
            audio: audio as any[],
        })
    } catch (e) {
        console.warn('[music] 初始化失败：', e)
    } finally {
        loading.value = false
    }
})

onBeforeUnmount(() => {
    try {
        player?.destroy?.()
    } catch { /* noop */ }
    player = null
})
</script>

<style lang="scss" scoped>
.music-player-wrapper {
    position: relative;
    width: 100%;

    .player-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.75);
        font-size: 13px;
    }

    :deep(.aplayer-box) {
        width: 100%;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        overflow: hidden;
    }
}
</style>
