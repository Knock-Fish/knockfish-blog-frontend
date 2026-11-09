<template>
    <div class="lock-card">
        <div class="icon">🔒</div>
        <h2>{{ album.name }}</h2>
        <p class="tip">这个相册是私密的，输入密码后查看</p>

        <AlbumUnlockForm :album="album" @unlocked="(token, expiresIn) => emit('unlocked', token, expiresIn)" />
    </div>
</template>

<script setup lang="ts">
import AlbumUnlockForm from './AlbumUnlockForm.vue'
import type { GalleryAlbumVO } from '@/api/galleryApi'

defineProps<{ album: GalleryAlbumVO }>()
const emit = defineEmits<{ unlocked: [token: string, expiresIn: number] }>()
</script>

<style lang="scss" scoped>
.lock-card {
    max-width: 340px;
    margin: 8vh auto 0;
    padding: 30px 24px 26px;
    border-radius: var(--g-radius);
    border: 1px solid var(--g-line);
    background: var(--g-surface);
    box-shadow: 0 18px 40px -30px rgba(120, 90, 110, 0.55);
    text-align: center;
}

.icon {
    font-size: 26px;
    line-height: 1;
}

h2 {
    margin: 10px 0 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--g-text);
}

.tip {
    margin: 6px 0 18px;
    font-size: 12px;
    color: var(--g-dim);
}
</style>
