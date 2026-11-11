<template>
    <section class="mc" :class="{ 'mc--lyric-mode': innerLyricView }">
        <!-- 隐藏的 APlayer 挂载容器：只用它当播放引擎 -->
        <div ref="aplayerMount" style="display:none" aria-hidden="true"></div>

        <!-- 正常 / 全屏歌词视图切换（同一个 Transition，out-in） -->
        <Transition name="mc-fade" mode="out-in">
            <div v-if="!innerLyricView" class="mc__normal" key="normal">
                <!-- 主体：封面 + 信息 -->
                <div class="mc__body">
                    <!-- 封面（点击切换到歌词） -->
                    <div
                        class="mc__cover"
                        :class="{ 'mc__cover--spin': state.playing }"
                        title="点击查看歌词"
                        @click="innerLyricView = true"
                    >
                        <img :src="state.current?.pic || defaultCover" :alt="state.current?.title || ''" />
                    </div>

                    <!-- 歌名 + 歌手 + 时间/音量 -->
                    <div class="mc__info">
                        <div class="mc__song" :title="state.current?.title">{{ state.current?.title || '—' }}</div>
                        <div class="mc__artist" :title="state.current?.author">{{ state.current?.author || '未知艺术家' }}</div>
                        <div class="mc__meta">
                            <span class="mc__time">{{ formatTime(state.curTime) }} / {{ formatTime(state.duration) }}</span>
                            <div class="mc__volume">
                                <button class="mc__vol" type="button" @click="toggleMute" :title="state.muted ? '取消静音' : '静音'">
                                    <component :is="volumeIcon" width="16" height="16" />
                                </button>
                                <input
                                    type="range"
                                    class="mc__vol-slider"
                                    :min="0"
                                    :max="100"
                                    :value="state.muted ? 0 : Math.round(state.volume * 100)"
                                    @input="onVolumeChange"
                                    :title="`音量 ${Math.round(state.muted ? 0 : state.volume * 100)}%`"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 进度条（独立全宽行） -->
                <div
                    class="mc__pbar"
                    ref="progressBar"
                    @click="onProgressClick"
                    @mousedown="onProgressStart"
                    @touchstart.passive="onProgressStart"
                >
                    <div class="mc__pbar-track">
                        <div class="mc__pbar-fill" :style="{ width: state.percent * 100 + '%' }"></div>
                        <div class="mc__pbar-thumb" :style="{ left: state.percent * 100 + '%' }"></div>
                    </div>
                </div>

                <!-- 控制按钮 -->
                <div class="mc__controls">
                    <button
                        type="button"
                        class="mc__btn mc__btn--ghost"
                        :title="loopModeLabel"
                        @click="cycleLoopMode"
                    >
                        <component :is="loopModeIcon" width="18" height="18" />
                    </button>
                    <button type="button" class="mc__btn mc__btn--ghost" title="上一首" @click="playPrev">
                        <i-mdi-skip-previous width="20" height="20" />
                    </button>
                    <button type="button" class="mc__btn mc__btn--play" :title="state.playing ? '暂停' : '播放'" @click="togglePlay">
                        <component :is="playIcon" width="22" height="22" class="mc__play-icon" />
                    </button>
                    <button type="button" class="mc__btn mc__btn--ghost" title="下一首" @click="playNext">
                        <i-mdi-skip-next width="20" height="20" />
                    </button>
                    <button
                        type="button"
                        class="mc__btn mc__btn--ghost"
                        :class="{ 'mc__btn--on': listOpen }"
                        title="播放列表"
                        @click="onToggleList"
                    >
                        <i-mdi-playlist-music-outline width="18" height="18" />
                    </button>
                </div>
            </div>

            <div v-else class="mc__lyric-mode" key="lyric">
                <div ref="lmViewport" class="mc__lm-viewport" :style="lmViewportStyle">
                    <div
                        ref="lmInner"
                        class="mc__lm-inner"
                        :style="{ transform: `translateY(${innerLyricTranslate}px)` }"
                    >
                        <div
                            v-for="(line, idx) in lrcLines"
                            :key="idx"
                            class="mc__lm-line"
                            :class="{ 'mc__lm-line--active': idx === lrcActiveIndex }"
                        >{{ line.text || '…' }}</div>
                    </div>
                    <div v-if="lrcLines.length === 0" class="mc__lm-empty">暂无歌词</div>
                </div>
                <div class="mc__lm-footer" @click="innerLyricView = false" title="点击返回">
                    <span class="mc__lm-bar">—</span>
                    <span class="mc__lm-title">《{{ state.current?.title || '—' }}》</span>
                    <span class="mc__lm-sep">·</span>
                    <span class="mc__lm-author">{{ state.current?.author || '未知艺术家' }}</span>
                </div>
            </div>
        </Transition>

        <!-- 播放列表：挂到 body 上用 fixed 定位，避免被 .header-bg 的 overflow:hidden 裁掉 -->
        <Teleport to="body">
            <Transition name="mc-pop">
                <div v-if="listOpen && !innerLyricView" class="mc__list" :style="listStyle">
                    <div class="mc__list-scroll" :style="{ maxHeight: listMaxHeight + 'px' }">
                        <div
                            v-for="(item, idx) in playlist"
                            :key="item.url"
                            class="mc__list-item"
                            :class="{ 'mc__list-item--cur': idx === state.index }"
                            @click="onListClick(idx)"
                        >
                            <span class="mc__list-idx">{{ idx + 1 }}</span>
                            <span class="mc__list-title">{{ item.title }}</span>
                            <span class="mc__list-author">{{ item.author || '—' }}</span>
                        </div>
                        <div v-if="!playlist.length" class="mc__list-empty">没有本地音乐（public/music）</div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
interface AudioItem {
    title: string
    author: string
    url: string
    pic: string
    lrcUrl?: string
}
type LoopMode = 'all' | 'one' | 'random'
interface LrcLine { time: number; text: string }

/**
 * 组件只负责播放器本身，歌单/接口地址由父组件传入：
 * 组件里不写任何具体歌单 id，方便复用与开源。
 */
interface Props {
    /** 网易云歌单 id（分享链接 ?id= 后那串数字）；不传则不进"在线歌单"模式 */
    playlistId?: string
    /** Meting 解析接口地址，公共实例挂了可以直接换 */
    metingApi?: string
    /** 在线歌单不可用时，是否回落到 public/music 下的本地音频 */
    useLocal?: boolean
    /** 父组件直接给曲目列表（优先级最高，传了就不扫描本地目录） */
    localTracks?: AudioItem[]
}
const props = withDefaults(defineProps<Props>(), {
    playlistId: '',
    metingApi: 'https://api.injahow.cn/meting/',
    useLocal: true,
    localTracks: () => [],
})

// 需要按状态切换的图标：编译期引入为组件，由 computed 选中后交给 <component :is>
import IconVolumeOff from '~icons/mdi/volume-off'
import IconVolumeLow from '~icons/mdi/volume-low'
import IconVolumeHigh from '~icons/mdi/volume-high'
import IconRepeat from '~icons/mdi/repeat'
import IconRepeatOnce from '~icons/mdi/repeat-once'
import IconShuffle from '~icons/mdi/shuffle'
import IconPause from '~icons/mdi/pause'
import IconPlay from '~icons/mdi/play'

// 不用 import.meta.glob 扫描 public 目录（Terser 无法压缩日文文件名生成的变量）
// 直接列出 public/music/ 下的音频文件，运行时构造 URL
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')
const MUSIC_FILES = [
    'mikumikuooeeoo.mp3',
    'ポジティブ・パレード - DECO 27,初音ミク.mp3',
]
const LOCAL_COVER_MAP: Record<string, string> = import.meta.glob(
    '../../../public/music/cover.{jpg,jpeg,png,webp}',
    { as: 'url', eager: true },
)
// .lrc 不走 import.meta.glob（Vite 构建会把它当 JS 解析报错），运行时直接 fetch
const defaultCover =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
            <defs><filter id="blur"><feGaussianBlur stdDeviation="6"/></filter></defs>
            <rect width="100%" height="100%" rx="32" fill="rgba(255,255,255,0.15)"/>
            <rect width="100%" height="100%" rx="32" fill="rgba(255,255,255,0.3)" filter="url(#blur)"/>
            <text x="50%" y="55%" font-family="Arial" font-size="54" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">♪</text>
        </svg>`,
    )
const coverFromDir = Object.values(LOCAL_COVER_MAP)[0] || defaultCover

/** 歌单请求超时（毫秒），超时就回落本地，别让播放器一直空着 */
const PLAYLIST_TIMEOUT = 8000

/**
 * 拉取在线歌单并转换成 APlayer 需要的 AudioItem
 * 失败一律返回空数组，由调用方回落到本地音乐
 */
const fetchNeteasePlaylist = async (): Promise<AudioItem[]> => {
    if (!props.playlistId) return []
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), PLAYLIST_TIMEOUT)
    try {
        const url = `${props.metingApi}?server=netease&type=playlist&id=${encodeURIComponent(props.playlistId)}`
        const resp = await fetch(url, { signal: ctrl.signal })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        if (!Array.isArray(data)) throw new Error('接口返回格式异常')
        return data
            .map((item: any, index: number) => ({
                title: String(item?.name ?? '').trim() || `网易云歌曲 ${index + 1}`,
                author: String(item?.artist ?? '').trim(),
                url: String(item?.url ?? '').trim(),
                pic: String(item?.pic ?? '').trim() || coverFromDir,
                lrcUrl: String(item?.lrc ?? '').trim() || undefined,
            }))
            .filter(item => item.url)
    } catch (e) {
        console.warn('[music-card] 网易云歌单加载失败，回落到本地音乐：', e)
        return []
    } finally {
        clearTimeout(timer)
    }
}

const EXT_RE = /\.[^.]+$/
const AUDIO_EXT_RE = /\.(mp3|flac|m4a|wav|ogg|aac)$/i
const parseFileName = (fileName: string) => {
    const base = fileName.replace(EXT_RE, '')
    const idx = base.search(/\s*[-–—]\s*/)
    if (idx >= 0) {
        const title = base.slice(0, idx).trim()
        const author = base.slice(idx).replace(/^\s*[-–—]\s*/, '').trim()
        return { title: title || base, author }
    }
    return { title: base, author: '' }
}
const findLrcUrl = (audioUrl: string): string | undefined => {
    return audioUrl.replace(AUDIO_EXT_RE, '.lrc')
}
const buildPlaylist = (): AudioItem[] => MUSIC_FILES.map((file) => {
    // 不要手动 encodeURIComponent：浏览器/<audio> 按 URL 标准会自动编码；
    // 手动编码会导致 Vite dev/prod 静态服务器对日文文件名二次编码 → 404（NotSupportedError）
    const url = `${BASE_URL}/music/${file}`
    const { title, author } = parseFileName(file)
    return { title, author, url, pic: coverFromDir, lrcUrl: findLrcUrl(url) }
})

const LOCAL_CSS = `${BASE_URL}/libs/aplayer/APlayer.min.css`
const LOCAL_JS = `${BASE_URL}/libs/aplayer/APlayer.min.js`
const injectLocal = (
    tag: 'link' | 'script',
    attrs: Record<string, string>,
    checkReady?: () => boolean,
) => {
    const key = Object.values(attrs).join('|')
    const id = 'kf-mc2-' + tag + '-' + btoa(key).slice(0, 16)
    if (document.getElementById(id)) return Promise.resolve()
    if (checkReady && checkReady()) return Promise.resolve()
    return new Promise<void>((resolve, reject) => {
        const el = document.createElement(tag) as any
        el.id = id
        Object.entries(attrs).forEach(([k, v]) => { try { el.setAttribute(k, v) } catch { /* noop */ } })
        el.addEventListener('load', () => resolve())
        el.addEventListener('error', (e: any) => reject(e?.error || new Error(`本地 ${tag} 加载失败`)))
        document.head.appendChild(el)
    })
}
const loadAplayerLib = () => Promise.resolve()
    .then(() => injectLocal('link', { rel: 'stylesheet', href: LOCAL_CSS }))
    .then(() => injectLocal('script', { src: LOCAL_JS, defer: 'defer' }, () => typeof (window as any).APlayer !== 'undefined'))

// ===== 响应式状态 =====
// 初始为空：onMounted 里先拉网易云歌单，失败再回落本地文件，避免先放本地再切歌
const playlist = ref<AudioItem[]>([])
const listOpen = ref(false)
const lyricOpen = ref(false)
const loopMode = ref<LoopMode>('all')
const prevVolume = ref(0.7)
const innerLyricView = ref(false)   // 封面 → 内嵌歌词 切换

const state = reactive({
    playing: false,
    index: 0,
    curTime: 0,
    duration: 0,
    volume: 0.7,
    muted: false,
    get percent(): number { return this.duration > 0 ? this.curTime / this.duration : 0 },
    get current(): AudioItem | undefined { return playlist.value[this.index] },
})

// ===== 歌词 =====
const LRC_LINE_RE = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]\s*(.*)/
const lrcLines = ref<LrcLine[]>([])
const lrcActiveIndex = ref(-1)

const parseLrcText = (text: string): LrcLine[] => {
    const lines = text.split(/\r?\n/)
    const result: LrcLine[] = []
    for (const line of lines) {
        const m = line.match(LRC_LINE_RE)
        if (!m) continue
        const min = parseInt(m[1], 10) || 0
        const sec = parseInt(m[2], 10) || 0
        const rawMs = m[3] ? parseInt(m[3], 10) : 0
        const ms = rawMs === 0 ? 0 : (m[3] && m[3].length === 3 ? rawMs : rawMs * 10)
        const txt = (m[4] || '').trim()
        if (!txt) continue
        result.push({ time: min * 60 + sec + ms / 1000, text: txt })
    }
    result.sort((a, b) => a.time - b.time)
    return result
}

let lrcAbort: AbortController | null = null
const loadLyricFor = async (item?: AudioItem) => {
    lrcAbort?.abort(); lrcAbort = null
    lrcLines.value = []; lrcActiveIndex.value = -1
    if (!item?.lrcUrl) return
    try {
        const ctrl = new AbortController(); lrcAbort = ctrl
        const resp = await fetch(item.lrcUrl, { signal: ctrl.signal })
        if (resp.ok) {
            const text = await resp.text()
            // 网易云对无歌词的曲目会返回 "[00:00.00]暂无歌词"，别把它当歌词渲染
            lrcLines.value = /暂无歌词/.test(text) ? [] : parseLrcText(text)
        }
    } catch (e) { if ((e as any)?.name !== 'AbortError') { /* noop */ } }
}

// 内嵌歌词视图：LM_LINE_HEIGHT/LM_VISIBLE_LINES/translate 都在后面基于真实行高计算（长句换行显示）
const updateLrcActive = (t: number) => {
    const arr = lrcLines.value
    if (!arr.length) {
        if (lrcActiveIndex.value !== -1) lrcActiveIndex.value = -1
        return
    }
    // 从当前索引附近双向查找，避免每次从头遍历
    const cur = lrcActiveIndex.value
    if (cur >= 0 && cur < arr.length && arr[cur].time <= t) {
        let j = cur
        while (j + 1 < arr.length && arr[j + 1].time <= t) j++
        if (j !== lrcActiveIndex.value) lrcActiveIndex.value = j
        return
    }
    let idx = -1
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].time <= t) idx = i; else break
    }
    if (idx !== lrcActiveIndex.value) lrcActiveIndex.value = idx
}

// ===== helpers =====
const loopModeIcon = computed(() => ({ all: IconRepeat, one: IconRepeatOnce, random: IconShuffle })[loopMode.value])
// 音量图标：静音或音量为 0 显示静音图标，低音量显示低音量图标
const volumeIcon = computed(() =>
    state.muted || state.volume === 0
        ? IconVolumeOff
        : state.volume < 0.5
            ? IconVolumeLow
            : IconVolumeHigh
)
const playIcon = computed(() => (state.playing ? IconPause : IconPlay))
const loopModeLabel = computed(() => ({ all: '列表循环', one: '单曲循环', random: '随机播放' } as const)[loopMode.value])

const formatTime = (s: number) => {
    if (!Number.isFinite(s) || s < 0) s = 0
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
}

// ===== refs =====
const aplayerMount = useTemplateRef<HTMLElement>('aplayerMount')
const progressBar = useTemplateRef<HTMLElement>('progressBar')
const lmInner = useTemplateRef<HTMLElement>('lmInner')
const lmViewport = useTemplateRef<HTMLElement>('lmViewport')
let player: any = null

// 内嵌歌词：每行高度不固定（长句会换行），因此基于实际测量的 offsetHeight 计算 translate
//   - 视口高度固定为 LM_MAX_VP_HEIGHT（足够容纳三句换行后的长句），避免底部歌名栏随句子长短上下抖动
//   - translate = 视口中心 - 当前句中心（累计前置高度 + 本句一半） → 把正在唱的句放到视口正中央
const LM_VP_HEIGHT = 160   // 固定高度：约 5 × 32px，保证三句各自换行两句（3×64=192）都能容纳
const lmOffsetMap = ref<number[]>([])   // offsetMap[i] = 行 i 的顶端 y（累计前置高，行0为0）
const lmLineHeights = ref<number[]>([]) // lineHeights[i] = 行 i 的高度
const measureLyricLayout = () => {
    const inner = lmInner.value
    if (!inner || !lrcLines.value.length) {
        lmOffsetMap.value = []
        lmLineHeights.value = []
        return
    }
    const nodes = inner.querySelectorAll<HTMLElement>('.mc__lm-line')
    const heights: number[] = []
    const offsets: number[] = [0]
    let sum = 0
    nodes.forEach((n, i) => {
        const h = n.offsetHeight || 32
        heights[i] = h
        sum += h
        offsets[i + 1] = sum
    })
    offsets.length = Math.max(lrcLines.value.length + 1, 1)
    heights.length = lrcLines.value.length
    lmOffsetMap.value = offsets
    lmLineHeights.value = heights
}
let __lmRaf = 0
const scheduleMeasureLyricLayout = () => {
    if (__lmRaf) cancelAnimationFrame(__lmRaf)
    __lmRaf = requestAnimationFrame(() => { nextTick(measureLyricLayout) })
}
watch(lrcLines, () => scheduleMeasureLyricLayout(), { flush: 'post' })
watch(lrcActiveIndex, () => scheduleMeasureLyricLayout(), { flush: 'post' })
watch(innerLyricView, (v) => v && nextTick(scheduleMeasureLyricLayout))
let __lmRO: ResizeObserver | null = null
const ensureObserveLyric = () => {
    if (!__lmRO) return
    const v = lmViewport.value, i = lmInner.value
    if (v) __lmRO.observe(v)
    if (i) __lmRO.observe(i)
}
onMounted(() => {
    const Target = (window as any).ResizeObserver
    if (Target) {
        __lmRO = new Target(() => scheduleMeasureLyricLayout())
        ensureObserveLyric()
    }
    scheduleMeasureLyricLayout()
})
watch([lmViewport, lmInner], ensureObserveLyric, { flush: 'post' })
onBeforeUnmount(() => {
    if (__lmRaf) cancelAnimationFrame(__lmRaf)
    if (__lmRO) __lmRO.disconnect()
})

// 内嵌歌词：translate 到"当前句在视口中央"
const innerLyricTranslate = computed<number>(() => {
    const n = lrcLines.value.length
    if (!n) return 0
    const idx = Math.max(0, Math.min(lrcActiveIndex.value, n - 1))
    const offsets = lmOffsetMap.value
    const heights = lmLineHeights.value
    if (!offsets.length || !heights.length) return (1 - idx) * 32
    const offsetTop = offsets[idx] || idx * 32
    const h = heights[idx] || 32
    return LM_VP_HEIGHT / 2 - (offsetTop + h / 2)
})
const lmViewportStyle = computed(() => ({ height: `${LM_VP_HEIGHT}px` }))

const initPlayer = async () => {
    if (!aplayerMount.value || playlist.value.length === 0) return
    const APlayerCtor = (window as any).APlayer
    if (!APlayerCtor) throw new Error('APlayer 未找到')

    // loopMode → APlayer 原生 loop 映射：all/one 交给 APlayer 原生处理，random 用自定义 ended
    const apLoop = loopMode.value === 'random' ? 'none' : loopMode.value
    player = new APlayerCtor({
        container: aplayerMount.value, mini: true, volume: state.volume,
        preload: 'metadata', mutex: true, loop: apLoop,
        audio: playlist.value.map((x, i) => ({
            name: x.title || `歌曲 ${i + 1}`, artist: x.author, url: x.url, cover: x.pic,
        })),
    })

    const audio = player.audio as HTMLAudioElement

    // 网易云歌单里 VIP / 无版权曲目的代理会返回空流，audio 直接报错；
    // 这里自动跳到下一首，连续失败到所有曲目都试过就停下，避免"点了没反应"的卡死
    let errorStreak = 0
    audio.addEventListener('error', () => {
        const total = playlist.value.length
        if (total <= 1) {
            state.playing = false
            return
        }
        errorStreak += 1
        if (errorStreak >= total) {
            state.playing = false
            console.warn('[music-card] 歌单内曲目均不可播放')
            return
        }
        const failed = playlist.value[state.index]
        console.warn('[music-card] 曲目不可播放，自动跳过：', failed?.title)
        playAt((state.index + 1) % total, true)
    })
    audio.addEventListener('canplay', () => { errorStreak = 0 })

    const syncFromAudio = () => {
        state.curTime = audio.currentTime || 0
        if (Number.isFinite(audio.duration) && audio.duration > 0) state.duration = audio.duration
        updateLrcActive(audio.currentTime || 0)
    }
    audio.addEventListener('timeupdate', syncFromAudio)
    audio.addEventListener('seeking', syncFromAudio)
    audio.addEventListener('seeked', syncFromAudio)
    audio.addEventListener('progress', syncFromAudio)
    audio.addEventListener('loadedmetadata', () => {
        state.duration = Number.isFinite(audio.duration) ? audio.duration : 0
        // 先根据当前索引加载歌词，加载完成后按当前播放时间立刻更新高亮
        const idx0 = state.index
        Promise.resolve()
            .then(() => loadLyricFor(state.current))
            .finally(() => {
                if (state.index === idx0) updateLrcActive(audio.currentTime || 0)
            })
    })
    audio.addEventListener('canplay', syncFromAudio)
    audio.addEventListener('play', () => { state.playing = true; syncFromAudio() })
    audio.addEventListener('playing', () => { state.playing = true; syncFromAudio() })
    audio.addEventListener('pause', () => (state.playing = false))
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('volumechange', () => {
        state.volume = audio.muted ? 0 : audio.volume
        state.muted = audio.muted
    })

    player.on('listswitch', (ctx: any) => {
        if (ctx && typeof ctx.index === 'number') {
            state.index = ctx.index; lrcActiveIndex.value = -1
            const audio = player.audio as HTMLAudioElement | undefined
            const idx0 = ctx.index
            Promise.resolve()
                .then(() => loadLyricFor(playlist.value[ctx.index]))
                .finally(() => {
                    if (state.index === idx0 && audio) updateLrcActive(audio.currentTime || 0)
                })
        }
    })
}

const handleEnded = () => {
    // all / one 模式由 APlayer 原生 loop 处理，这里只处理 random
    if (loopMode.value !== 'random') return
    if (playlist.value.length > 1) {
        let next = Math.floor(Math.random() * playlist.value.length)
        if (next === state.index) next = (next + 1) % playlist.value.length
        playAt(next, true)
    } else {
        player.audio.currentTime = 0; player.play()
    }
}

const togglePlay = () => { if (player) state.playing ? player.pause() : player.play() }
const playPrev = () => { const n = playlist.value.length; playAt((state.index - 1 + n) % n, true) }
const playNext = () => { const n = playlist.value.length; playAt((state.index + 1) % n, true) }
const playAt = (idx: number, autoPlay = false) => {
    if (!player || !playlist.value.length) return
    player.list.switch(idx); state.index = idx
    if (autoPlay) player.play()
}
const onListClick = (idx: number) => {
    // 点击正在播放的歌曲：暂停/恢复，不重新加载
    if (idx === state.index) { togglePlay(); return }
    playAt(idx, true)
}
const cycleLoopMode = () => {
    loopMode.value = ({ all: 'one', one: 'random', random: 'all' } as const)[loopMode.value]
    // 同步更新 APlayer 原生 loop：all/one 交给 APlayer，random 用自定义 ended
    if (player) player.loop = loopMode.value === 'random' ? 'none' : loopMode.value
}
const toggleMute = () => {
    if (!player) return
    const audio = player.audio as HTMLAudioElement
    if (audio.muted || state.volume === 0) {
        audio.muted = false
        player.volume = prevVolume.value > 0 ? prevVolume.value : 0.7
    } else {
        prevVolume.value = state.volume
        audio.muted = true
    }
}
const onVolumeChange = (e: Event) => {
    if (!player) return
    const val = Number((e.target as HTMLInputElement).value) / 100
    const audio = player.audio as HTMLAudioElement
    if (val > 0) {
        audio.muted = false
        audio.volume = val
        prevVolume.value = val
    } else {
        prevVolume.value = state.volume
        audio.muted = true
    }
}
/**
 * 列表固定展示在卡片下方。
 *
 * 之前的做法是把浮层留在 .header-bg 里绝对定位，但 header 是 overflow:hidden，
 * 向下弹会被裁掉（滚动后还缩到 80vh、底部有 z-index:1000 的波浪）。
 * 现在用 <Teleport to="body"> + position:fixed 锚在卡片下方，既保持"在下面"，
 * 又不受任何祖先的裁剪和层叠影响；高度按视口剩余空间收口，超出部分内部滚动。
 */
const LIST_ITEM_HEIGHT = 34
const LIST_MAX_HEIGHT = 240
const listMaxHeight = ref(LIST_MAX_HEIGHT)
const listStyle = ref<Record<string, string>>({})

const updateListPosition = () => {
    const rect = document.querySelector('.mc')?.getBoundingClientRect()
    if (!rect) return
    const top = Math.round(rect.bottom + 8)
    const available = window.innerHeight - top - 12
    const wanted = Math.min(playlist.value.length * LIST_ITEM_HEIGHT + 8, LIST_MAX_HEIGHT)
    listMaxHeight.value = Math.max(80, Math.min(wanted, available))
    listStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${Math.round(rect.left)}px`,
        width: `${Math.round(rect.width)}px`,
        'z-index': '1500',
    }
}

const onToggleList = () => {
    const next = !listOpen.value
    if (next) {
        updateListPosition()
        lyricOpen.value = false
    }
    listOpen.value = next
}

/** 列表是 fixed 定位，页面滚动/窗口变化会让它和卡片脱节，直接关掉最省事 */
const onViewportChange = () => {
    if (listOpen.value) listOpen.value = false
}


// ===== 进度条拖拽 =====
let progressDragging = false
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const pctFromEvent = (el: HTMLElement, e: MouseEvent | TouchEvent): number => {
    const rect = el.getBoundingClientRect()
    let clientX = 0
    if ('touches' in e && e.touches[0]) clientX = e.touches[0].clientX
    else if ('clientX' in e) clientX = (e as MouseEvent).clientX
    return clamp((clientX - rect.left) / rect.width)
}
const onProgressClick = (e: MouseEvent) => {
    if (progressDragging || !player || !state.duration) return
    player.audio.currentTime = pctFromEvent(progressBar.value as HTMLElement, e) * state.duration
}
const onProgressStart = (_e: MouseEvent | TouchEvent) => {
    if (!player || !state.duration) return
    progressDragging = true
    const onMove = (ev: MouseEvent | TouchEvent) => {
        const t = pctFromEvent(progressBar.value as HTMLElement, ev) * state.duration
        state.curTime = t
        updateLrcActive(t)
    }
    const onUp = (ev: MouseEvent | TouchEvent) => {
        player.audio.currentTime = pctFromEvent(progressBar.value as HTMLElement, ev) * state.duration
        progressDragging = false
        window.removeEventListener('mousemove', onMove as any); window.removeEventListener('mouseup', onUp as any)
        window.removeEventListener('touchmove', onMove as any); window.removeEventListener('touchend', onUp as any)
    }
    window.addEventListener('mousemove', onMove as any); window.addEventListener('mouseup', onUp as any)
    window.addEventListener('touchmove', onMove as any, { passive: true }); window.addEventListener('touchend', onUp as any)
}

// ===== 生命周期 =====
onMounted(async () => {
    // 列表是 fixed 浮层，滚动/改窗口大小会让它和卡片错位，直接关掉
    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange)
    try {
        // 并行加载 APlayer 与在线歌单；在线不可用时按 props 决定回落本地还是留空
        const [remote] = await Promise.all([fetchNeteasePlaylist(), loadAplayerLib()])
        if (remote.length > 0) {
            playlist.value = remote
        } else if (props.localTracks.length > 0) {
            playlist.value = [...props.localTracks]
        } else if (props.useLocal) {
            playlist.value = buildPlaylist()
        } else {
            playlist.value = []
        }
        state.index = 0
        await nextTick()
        await initPlayer()
    } catch (e) { console.warn('[music-card] 初始化失败：', e) }
})
onBeforeUnmount(() => {
    window.removeEventListener('scroll', onViewportChange)
    window.removeEventListener('resize', onViewportChange)
    try { player?.destroy?.() } catch { /* noop */ }
    player = null; lrcAbort?.abort(); lrcAbort = null
})
</script>

<style lang="scss" scoped>
// ===== 主题色 =====
$mc-green: #6ccf8e;
$mc-green-deep: #4eb873;
$mc-green-soft: rgba(108, 207, 142, 0.18);
$mc-text: #ffffff;
$mc-text-2: rgba(255, 255, 255, 0.85);
$mc-text-3: rgba(255, 255, 255, 0.65);
// ===== CSS 中使用的常量（与 script 中的 JS 常量保持一致） =====
$LRC-LINE-HEIGHT: 26px;
$LRC-VISIBLE-LINES: 5;
$LY-LM-LINE-HEIGHT: 32px;
$LY-LM-VISIBLE-LINES: 3;

// ========= 透明背景容器 =========
.mc {
    width: 250px;
    display: flex;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    color: $mc-text;
    // 歌词/正常两种模式的容器统一高度（与 mc__normal 自然高度对齐：封面64 + gap12 + pbar18 + gap12 + 控制54 + padding8 ≈ 168，留余量）
    min-height: 172px;

    // ===== 主体：封面 + 歌名 =====
    &__body {
        display: flex;
        align-items: stretch;
        gap: 14px;
        min-height: 64px;
    }
    &__cover {
        flex: 0 0 auto;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition: transform .18s ease, box-shadow .18s ease;
        &:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18); }
        img {
            width: 100%; height: 100%; object-fit: cover; display: block;
        }
        &--spin img { animation: mc-spin 18s linear infinite; }
    }
    &__normal {
        box-sizing: border-box;
        width: 100%;
        max-height: 183px;
        min-height: 183px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 4px 2px;
        box-sizing: border-box;
    }
    &__lyric-mode {
        box-sizing: border-box;
        min-width: 300px;
        min-height: 183px;
        background: transparent;
        justify-content: space-between;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        color: #ffffff;
        position: relative;
    }
    &__lm-viewport {
        position: relative;
        flex: 0 0 auto;
        width: 100%;
        // 高度固定由 JS 设置（避免底部歌名栏随句子长短抖动），内部歌词仅纵向 scroll 不改变外框高度
        overflow: hidden;
        padding: 0;
        border-radius: 0;
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
    }
    &__lm-inner {
        width: 100%;
        transition: transform .3s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
    }
    &__lm-line {
        width: 100%;
        min-height: $LY-LM-LINE-HEIGHT;
        line-height: $LY-LM-LINE-HEIGHT;
        text-align: left;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.72);
        white-space: normal;
        word-break: break-word;
        overflow-wrap: anywhere;
        transition: color .25s ease, font-size .25s ease, font-weight .25s ease, opacity .25s ease, text-shadow .25s ease;
        opacity: 0.9;
        padding: 2px 0;
        box-sizing: border-box;
    }
    &__lm-line--active {
        color: #ffffff;
        font-weight: 700;
        font-size: 19px;
        opacity: 1;
        letter-spacing: 0.5px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
    }
    &__lm-line--active + &__lm-line,
    &__lm-line:has(+ &__lm-line--active) {
        color: rgba(255, 255, 255, 0.88);
        opacity: 1;
    }
    &__lm-empty {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        text-align: center;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.7;
    }
    &__lm-footer {
        position: relative;
        text-align: center;
        font-size: 12px;
        line-height: 1.4;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.62);
        transition: color .2s ease;
        &:hover { color: #ffffff; }
    }
    &__lm-bar { opacity: 0.7; }
    &__lm-title { color: rgba(255, 255, 255, 0.88); font-weight: 500; }
    &__lm-author { color: rgba(255, 255, 255, 0.62); }
    &__info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    &__song {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.25;
        color: $mc-text;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    &__artist {
        margin-top: 6px;
        font-size: 13px;
        color: $mc-text-2;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    // ===== 进度条（独立全宽行） =====
    &__pbar {
        width: 100%;
        height: 18px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &-track {
            position: relative;
            width: 100%; height: 3px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 999px;
        }
        &-fill {
            position: absolute; top: 0; left: 0; bottom: 0;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 999px;
        }
        &-thumb {
            position: absolute; top: 50%;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid rgba(255, 255, 255, 0.9);
            transform: translate(-50%, -50%);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transition: opacity .12s ease;
        }
        &:hover &-thumb { opacity: 1; }
    }

    // ===== 时间 + 音量行 =====
    &__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 8px;
    }
    &__time {
        font-size: 12px;
        color: $mc-text-2;
        font-variant-numeric: tabular-nums;
    }
    &__volume {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    &__vol {
        width: 26px; height: 26px;
        border-radius: 50%;
        border: 0; background: transparent;
        color: $mc-text-2;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background .15s ease, color .15s ease;
        &:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
    }
    &__vol-slider {
        width: 56px;
        height: 12px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        outline: none;
        &::-webkit-slider-runnable-track {
            height: 3px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 999px;
        }
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid rgba(255, 255, 255, 0.9);
            margin-top: -4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
            transition: transform .1s ease;
            &:hover { transform: scale(1.2); }
        }
        &::-moz-range-track {
            height: 3px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 999px;
        }
        &::-moz-range-thumb {
            width: 10px; height: 10px;
            border-radius: 50%;
            background: #fff;
            border: 2px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
    }

    // ===== 控制按钮 =====
    &__controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 4px;
    }
    &__btn {
        border: 0;
        background: transparent;
        color: $mc-text-2;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background .18s ease, color .18s ease, transform .1s ease;
        &:active { transform: scale(0.92); }
        &--ghost {
            width: 36px; height: 36px;
            border-radius: 50%;
            &:hover { background: rgba(255, 255, 255, 0.2); color: #fff; }
        }
        &--play {
            width: 54px; height: 54px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.35);
            color: #fff;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
            &:hover { background: rgba(255, 255, 255, 0.3); }
            .mc__play-icon { margin-left: 2px; }
        }
        &--on { color: #fff; }
    }

    // ===== 播放列表浮层 =====
    // 通过 <Teleport to="body"> 挂到 body，坐标由 JS 计算后行内给出；
    // 这样不受 .header-bg 的 overflow:hidden 裁切，也不受其层叠上下文影响。
    &__list {
        position: fixed;
        z-index: 1500;
        background: rgba(255, 255, 255, 0.96);
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        backdrop-filter: blur(6px);
    }

    // ===== 歌词浮层 =====
    &__lyric {
        position: absolute;
        left: 0; right: 0;
        top: calc(100% + 8px);
        z-index: 1001;
        background: rgba(255, 255, 255, 0.96);
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        overflow: hidden;
    }

    // 歌词
    &__lyric {
        height: $LRC-LINE-HEIGHT * $LRC-VISIBLE-LINES + 16px;
        padding: 8px 0;
        // 白色背景下的深色文字
        color: #374151;
    }
    &__lyric-viewport { transition: transform .3s cubic-bezier(0.22, 1, 0.36, 1); will-change: transform; }
    &__lyric-line {
        height: $LRC-LINE-HEIGHT; line-height: $LRC-LINE-HEIGHT;
        text-align: center; padding: 0 16px;
        font-size: 12.5px; color: #6b7280;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        transition: color .2s ease, opacity .2s ease;
        opacity: 0.55;
    }
    &__lyric-line--active {
        color: #374151; font-weight: 600; font-size: 13.5px; opacity: 1;
    }
    &__lyric-line--active + &__lyric-line,
    &__lyric-line:has(+ &__lyric-line--active) { opacity: 0.78; }
    &__lyric-empty { padding: 14px; text-align: center; font-size: 12.5px; color: #6b7280; line-height: 1.7; }
    &__lyric-tip { display: block; margin-top: 4px; font-size: 11px; color: #9ca3af; }

    // 歌单
    &__list { color: #1f2937; }
    // 高度由 listMaxHeight 行内控制，超出后内部滚动
    &__list-scroll { overflow: auto; }
    &__list-item {
        display: grid;
        grid-template-columns: 24px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
        transition: background .12s ease;
        & + & { border-top: 1px solid #f2f4f7; }
        &:hover { background: rgba(0, 0, 0, 0.04); }
        &--cur {
            background: rgba(0, 0, 0, 0.06);
            .mc__list-title { color: #374151; font-weight: 600; }
        }
    }
    &__list-idx { width: 24px; text-align: center; font-size: 11px; color: #6b7280; font-variant-numeric: tabular-nums; }
    &__list-title { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #1f2937; }
    &__list-author { max-width: 34%; color: #6b7280; font-size: 11px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; justify-self: end; }
    &__list-empty { padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
}

// ===== 正常 <-> 歌词 淡入淡出过渡 =====
.mc-fade-enter-active,
.mc-fade-leave-active { transition: opacity .24s ease; }
.mc-fade-enter-from,
.mc-fade-leave-to { opacity: 0; }

// ===== 弹出浮层过渡 =====
.mc-pop-enter-active,
.mc-pop-leave-active {
    transition: all .22s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top center;
}
.mc-pop-enter-from,
.mc-pop-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}

@keyframes mc-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}
</style>
