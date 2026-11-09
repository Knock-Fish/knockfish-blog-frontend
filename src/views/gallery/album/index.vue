<template>
    <div class="gallery-page album-page">
        <div class="album-head">
            <button type="button" class="back" @click="goBack">
                <svg class="arrow" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M9.6 3.4 5 8l4.6 4.6" />
                </svg>
                <span>图库</span>
            </button>
            <div class="title">
                <h1>
                    {{ album?.name ?? '相册' }}
                    <span v-if="album?.locked" class="lock">🔒</span>
                </h1>
                <p v-if="album?.description" class="desc">{{ album.description }}</p>
            </div>

            <!-- 画幅筛选靠右：数字按本相册统计，切到没图的分类时也不会消失 -->
            <FilterTabs v-if="counts.all" v-model="filter" :counts="counts" class="album-filter" />
        </div>

        <!-- 私密相册：没令牌就只显示密码表单，一个照片请求都不发 -->
        <AlbumLock v-if="needUnlock && album" :album="album" @unlocked="onUnlocked" />

        <template v-else>
            <MasonryGallery v-if="photos.length" :photos="photos" @select="lightboxIndex = $event"
                @natural-size="applyNaturalSize" />

            <div v-else-if="loading" class="empty">
                <p>加载中…</p>
            </div>

            <div v-else class="empty">
                <i-mdi-image-off-outline />
                <p>{{ filter === 'all' ? '这个相册还没有图片' : '这个画幅下还没有图片' }}</p>
            </div>

            <p v-if="photos.length" class="foot">
                {{ hasMore ? (loading ? '正在加载…' : '点击图片查看大图，继续下滑加载更多') : `已全部加载 · 共 ${total} 张` }}
            </p>

            <div ref="sentinel" class="sentinel"></div>
        </template>

        <!-- 右下角悬浮层：与鼠标样式开关（40px，right 16 / bottom 16）上下对齐，不要压在一起 -->
        <ElBacktop :right="16" :bottom="66" :visibility-height="600" />

        <PhotoLightbox v-model="lightboxIndex" :photos="photos" />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MasonryGallery from '../widget/MasonryGallery.vue'
import PhotoLightbox from '../widget/PhotoLightbox.vue'
import AlbumLock from '../widget/AlbumLock.vue'
import FilterTabs from '../widget/FilterTabs.vue'
import { useGalleryPhotos } from '../composables/useGalleryPhotos'
import { clearAlbumToken, readAlbumToken, saveAlbumToken } from '../utils'
import { GalleryService, type GalleryAlbumVO } from '@/api/galleryApi'

defineOptions({ name: 'GalleryAlbum' })

const route = useRoute()
const router = useRouter()
const albumId = Number(route.params.id) || 0

const album = ref<GalleryAlbumVO | null>(null)
const token = ref<string | null>(readAlbumToken(albumId))
const lightboxIndex = ref<number | null>(null)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const needUnlock = computed(() => Boolean(album.value?.locked) && !token.value)

const { photos, loading, total, hasMore, filter, counts, refresh, loadMore, applyNaturalSize } = useGalleryPhotos({
    albumId,
    getToken: () => token.value,
    onLocked: () => {
        // 令牌过期或密码被改：退回密码框
        token.value = null
        clearAlbumToken(albumId)
    },
})

function startObserve() {
    if (!sentinel.value || observer) return
    observer = new IntersectionObserver(entries => {
        if (entries[0]?.isIntersecting) void loadMore()
    }, { rootMargin: '300px' })
    observer.observe(sentinel.value)
}

function stopObserve() {
    observer?.disconnect()
    observer = null
}

function onUnlocked(newToken: string, expiresIn: number) {
    token.value = newToken
    saveAlbumToken(albumId, newToken, expiresIn)
    void refresh()
}

// 解锁后列表才渲染出哨兵，这里再挂观察者；重新上锁则摘掉
watch(needUnlock, locked => {
    if (locked) stopObserve()
    else requestAnimationFrame(startObserve)
})

function goBack() {
    if (window.history.length > 1) router.back()
    else void router.push('/gallery')
}

onMounted(async () => {
    try {
        album.value = await GalleryService.getAlbum(albumId)
    } catch {
        // 相册信息拿不到时保持空态，不阻塞后续流程
    }
    if (!needUnlock.value) {
        await refresh()
        startObserve()
    }
})

onBeforeUnmount(() => stopObserve())
</script>

<style lang="scss" scoped>
@use '../style/tokens' as *;

.gallery-page {
    @include gallery-tokens;

    box-sizing: border-box;
    width: 100%;
    padding-bottom: 30px;
}

html.dark .gallery-page {
    @include gallery-tokens-dark;
}

.album-head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
    flex-wrap: wrap;
}

/* 筛选条贴到标题右侧；与 h1 首行大致齐平 */
.album-filter {
    margin-left: auto;
    margin-top: 2px;
}

@media (max-width: 720px) {
    .album-filter {
        margin-left: 0;
    }
}

.back {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    padding: 6px 13px 6px 9px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--g-dim);
    font-size: 12px;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition:
        color 0.22s var(--g-ease),
        background-color 0.22s var(--g-ease),
        transform 0.22s var(--g-ease);

    &:hover {
        color: rgb(var(--g-accent));
        background: rgba(var(--g-accent), 0.08);
    }

    &:active {
        transform: scale(0.97);
    }

    /* 字符箭头在不同设备上粗细不一致，换成等宽描边的 SVG */
    .arrow {
        flex: none;
        width: 14px;
        height: 14px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 0.22s var(--g-ease);
    }

    &:hover .arrow {
        transform: translateX(-3px);
    }
}

.title {
    min-width: 0;

    h1 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--g-text);
    }

    .lock {
        font-size: 14px;
    }

    .desc {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.7;
        color: var(--g-dim);
    }
}

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 90px 20px;
    color: var(--g-dim);

    .svg-icon {
        font-size: 34px;
        opacity: 0.7;
    }

    p {
        font-size: 13px;
    }
}

.foot {
    margin-top: 26px;
    text-align: center;
    font-size: 12px;
    color: var(--g-dim);
}

.sentinel {
    height: 1px;
}

:deep(.el-backtop) {
    --el-backtop-bg-color: var(--g-surface);
    --el-backtop-text-color: var(--g-dim);
    --el-backtop-hover-bg-color: var(--g-surface);

    border: 1px solid var(--g-line);
    box-shadow: 0 4px 14px -6px rgba(120, 90, 110, 0.25);
}
</style>
