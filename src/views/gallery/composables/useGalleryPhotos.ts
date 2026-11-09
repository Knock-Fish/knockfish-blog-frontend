import { computed, ref, watch } from 'vue'
import { GalleryService, type GalleryPhotoVO } from '@/api/galleryApi'
import type { OrientationFilter, Photo } from '../types'

/** 每页数量 */
const PAGE_SIZE = 24

/** 后端 createTime 可能是 'yyyy-MM-ddTHH:mm:ss' 或带空格，兼容解析 */
function parseTime(value?: string): number {
    if (!value) return 0
    const normalized = value.includes('T') ? value : value.replace(' ', 'T')
    const time = Date.parse(normalized)
    return Number.isNaN(time) ? 0 : time
}

function toPhoto(vo: GalleryPhotoVO): Photo {
    return {
        id: String(vo.photoId),
        src: vo.thumbUrl,
        preview: vo.previewUrl || vo.thumbUrl,
        original: vo.originalUrl,
        title: vo.title || vo.fileName,
        nsfw: vo.nsfw === 1,
        width: vo.width ?? 0,
        height: vo.height ?? 0,
        takenAt: parseTime(vo.createTime),
    }
}

/**
 * 前台图库数据源：分页 + 按画幅筛选（筛选交给后端），滚动到底自动加载下一页。
 * 顶部标签数字来自 /stats，不受已加载页数影响。
 */
export interface GalleryPhotosOptions {
    /** 相册页传入固定 albumId；图库首页不传，表示全部 */
    albumId?: number
    /** 取当前相册令牌（私密相册） */
    getToken?: () => string | null
    /** 令牌失效或缺失时回调，页面据此弹回密码框 */
    onLocked?: () => void
}

export function useGalleryPhotos(options: GalleryPhotosOptions = {}) {
    const fixedAlbumId = options.albumId
    const photos = ref<Photo[]>([])
    const loading = ref(false)
    const filter = ref<OrientationFilter>('all')
    const total = ref(0)
    const stats = ref({
        allCount: 0,
        landscape: 0,
        portrait: 0,
        square: 0,
    })

    let pageNum = 0
    /** 请求序号：快速切筛选时丢弃过期响应 */
    let requestSeq = 0

    const hasMore = computed(() => photos.value.length < total.value)

    const counts = computed<Record<OrientationFilter, number>>(() => ({
        all: Number(stats.value.allCount ?? 0),
        landscape: Number(stats.value.landscape ?? 0),
        portrait: Number(stats.value.portrait ?? 0),
        square: Number(stats.value.square ?? 0),
    }))

    async function loadStats() {
        try {
            // 相册页只统计本相册，否则标签上的数字是全站总数，和列表对不上
            stats.value = await GalleryService.getStats(fixedAlbumId, options.getToken?.() ?? undefined)
        } catch {
            // 统计失败不影响列表
        }
    }

    async function fetchPage(reset: boolean) {
        const seq = ++requestSeq
        loading.value = true
        try {
            const nextPage = reset ? 1 : pageNum + 1
            const data = await GalleryService.getPhotoPage({
                pageNum: nextPage,
                pageSize: PAGE_SIZE,
                orientation: filter.value === 'all' ? undefined : filter.value,
                albumId: fixedAlbumId,
            }, options.getToken?.() ?? undefined)
            if (seq !== requestSeq) return

            const list = (data.list ?? []).map(toPhoto)
            photos.value = reset ? list : [...photos.value, ...list]
            total.value = Number(data.total ?? 0)
            pageNum = nextPage
        } catch (e) {
            // 私密相册未解锁 / 令牌过期：交给页面清令牌并弹密码框
            const code = (e as { code?: number })?.code
            if (code === 40101) {
                options.onLocked?.()
            }
            if (reset) {
                photos.value = []
                total.value = 0
            }
        } finally {
            if (seq === requestSeq) loading.value = false
        }
    }

    async function refresh() {
        pageNum = 0
        await Promise.all([fetchPage(true), loadStats()])
    }

    async function loadMore() {
        if (loading.value || !hasMore.value) return
        await fetchPage(false)
    }

    /** 图片实际尺寸与登记值不一致时校正瀑布流比例 */
    function applyNaturalSize(id: string, width: number, height: number) {
        if (!width || !height) return
        const photo = photos.value.find(item => item.id === id)
        if (!photo || (photo.width === width && photo.height === height)) return
        photo.width = width
        photo.height = height
    }

    watch(filter, () => {
        pageNum = 0
        void fetchPage(true)
    })

    return {
        photos,
        loading,
        filter,
        total,
        hasMore,
        counts,
        refresh,
        loadMore,
        applyNaturalSize,
    }
}
