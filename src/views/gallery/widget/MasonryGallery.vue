<template>
    <div ref="container" class="gallery" :style="{ height: `${layout.height}px` }">
        <PhotoCard v-for="(photo, index) in photos" :key="photo.id" :photo="photo" :box="layout.boxes[photo.id]"
            :index="index" @select="emit('select', index)"
            @natural-size="(id, width, height) => emit('naturalSize', id, width, height)" />
    </div>
</template>

<script setup lang="ts">
import PhotoCard from './PhotoCard.vue'
import { useMasonry } from '../composables/useMasonry'
import type { Photo } from '../types'
import { ratioOf } from '../utils'

defineOptions({ name: 'MasonryGallery' })

const props = defineProps<{ photos: Photo[] }>()

const emit = defineEmits<{
    /** 点击某张图，回传它在当前列表里的下标 */
    select: [index: number]
    /** 图片实际尺寸与登记不一致时上报，用于校正布局 */
    naturalSize: [id: string, width: number, height: number]
}>()

const container = useTemplateRef<HTMLElement>('container')

const layout = useMasonry(container, () =>
    props.photos.map(photo => ({ id: photo.id, ratio: ratioOf(photo) })),
    {
        // 窄屏（手机）固定两列：min 取小值，让 320px 这种窄屏也能塞下两列
        minColumnWidth: (width) => (width < 640 ? 120 : 240),
        maxColumns: (width) => (width < 640 ? 2 : 4),
        gap: 16,
    },
)
</script>

<style lang="scss" scoped>
.gallery {
    position: relative;
    width: 100%;
    min-height: 120px;
    // 切换筛选后列表整体重排，高度过渡一下，不要突然跳
    transition: height 0.45s var(--g-ease);
}
</style>
