<template>
    <div class="gallery-page">
        <div v-if="loading" class="empty">
            <p>加载中…</p>
        </div>

        <div v-else-if="!albums.length" class="empty">
            <i-mdi-image-off-outline />
            <p>还没有相册</p>
        </div>

        <div v-else class="grid">
            <button v-for="album in albums" :key="album.albumId" type="button" class="card" @click="open(album)">
                <div class="cover" :class="{ locked: album.locked }">
                    <img v-if="album.coverUrl" :src="album.coverUrl" :alt="album.name" loading="lazy" />
                    <i-mdi-lock-outline v-else-if="album.locked" class="lock-icon" />
                    <span v-else class="ph" aria-hidden="true"></span>

                    <!-- 只有真封面才叠「N 张」：无封面和私密相册的封面上不放任何文字 -->
                    <span v-if="album.coverUrl" class="badge">{{ album.photoCount ?? 0 }} 张</span>
                </div>
                <span class="name">{{ album.name }}</span>
            </button>
        </div>

        <!-- 加密相册先在这里验密码，通过了才跳转；已解锁且令牌未过期则直接进 -->
        <AlbumUnlockDialog :album="pendingAlbum" @close="pendingAlbum = null" @unlocked="onUnlocked" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AlbumUnlockDialog from './widget/AlbumUnlockDialog.vue'
import { readAlbumToken, saveAlbumToken } from './utils'
import { GalleryService, type GalleryAlbumVO } from '@/api/galleryApi'

defineOptions({ name: 'Gallery' })

const router = useRouter()
const albums = ref<GalleryAlbumVO[]>([])
const loading = ref(true)
const pendingAlbum = ref<GalleryAlbumVO | null>(null)

function open(album: GalleryAlbumVO) {
    if (album.locked && !readAlbumToken(album.albumId)) {
        pendingAlbum.value = album
        return
    }
    void router.push(`/gallery/album/${album.albumId}`)
}

function onUnlocked(token: string, expiresIn: number) {
    const album = pendingAlbum.value
    if (!album) return
    // 令牌落到 sessionStorage，相册页读到就跳过密码卡片
    saveAlbumToken(album.albumId, token, expiresIn)
    pendingAlbum.value = null
    void router.push(`/gallery/album/${album.albumId}`)
}

onMounted(async () => {
    try {
        albums.value = await GalleryService.getAlbums()
    } catch {
        albums.value = []
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
@use './style/tokens' as *;

.gallery-page {
    @include gallery-tokens;

    box-sizing: border-box;
    width: 100%;
    padding-bottom: 30px;
}

html.dark .gallery-page {
    @include gallery-tokens-dark;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;

    @media screen and (max-width: 640px) {
        // 手机上固定两列，和相册内瀑布流一致
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }
}

.card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
}

.cover {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--g-radius);
    background: linear-gradient(135deg, var(--g-skeleton), var(--g-skeleton-2));
    transition: transform 0.25s var(--g-ease), box-shadow 0.25s var(--g-ease);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s var(--g-ease);
    }
}

/* 私密相册：没有封面可露，做成一块毛玻璃盖住，不摆任何文字 */
.cover.locked {
    /* 用 background 简写，顺带清掉 .cover 上那条不透明的骨架渐变，毛玻璃才透得出来 */
    background: color-mix(in srgb, var(--g-surface) 38%, transparent);
    backdrop-filter: blur(18px) saturate(160%);

    &::before {
        content: '';
        position: absolute;
        inset: -30%;
        background:
            radial-gradient(circle at 30% 28%, rgba(var(--g-accent), 0.34), transparent 56%),
            radial-gradient(circle at 74% 72%, rgba(120, 148, 255, 0.3), transparent 52%);
        filter: blur(26px);
    }
}

.lock-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 15px;
    color: color-mix(in srgb, var(--g-text) 45%, transparent);
}

.card:hover .cover {
    transform: translateY(-3px);
    box-shadow: 0 12px 26px -16px rgba(120, 90, 110, 0.6);

    img {
        transform: scale(1.03);
    }
}

/* 公开相册但没设封面：画两张斜叠的照片，不放任何文字（相册名在卡片下方） */
.ph {
    position: absolute;
    inset: 0;

    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 30%;
        aspect-ratio: 4 / 3;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.62);
        box-shadow: 0 10px 22px -14px rgba(120, 90, 160, 0.55);
        transition: transform 0.28s var(--g-ease);
    }

    &::before {
        transform: translate(-58%, -54%) rotate(-9deg);
        background: rgba(255, 255, 255, 0.4);
    }

    &::after {
        transform: translate(-42%, -46%) rotate(7deg);
    }
}

/* hover 时两张“照片”再散开一点，给一点活气 */
.card:hover .ph::before {
    transform: translate(-63%, -57%) rotate(-12deg);
}

.card:hover .ph::after {
    transform: translate(-37%, -43%) rotate(10deg);
}

/* 暗色下白卡片太抢眼，换成低透明度的高光 */
html.dark .ph::before {
    background: rgba(255, 255, 255, 0.06);
}

html.dark .ph::after {
    background: rgba(255, 255, 255, 0.12);
}

.badge {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    color: #fff;
    background: rgba(20, 20, 26, 0.55);
    backdrop-filter: blur(6px);
}

.name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 2px;
    font-size: 14px;
    font-weight: 500;
    color: var(--g-text);
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
</style>
