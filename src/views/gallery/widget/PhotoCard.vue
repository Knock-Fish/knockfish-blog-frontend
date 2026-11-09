<template>
    <article class="slot" :style="slotStyle">
        <button type="button" class="card" :class="{ masked: photo.nsfw }" :style="cardStyle"
            :aria-label="photo.title" @click="emit('select')">
            <LazyImage :src="photo.src" :alt="photo.title"
                @natural-size="(width, height) => emit('naturalSize', photo.id, width, height)" />
            <span class="overlay">
                <span class="title">{{ photo.title }}</span>
                <span class="meta">{{ sizeTextOf(photo) }}</span>
            </span>
        </button>
    </article>
</template>

<script setup lang="ts">
import LazyImage from './LazyImage.vue'
import type { MasonryBox } from '../composables/useMasonry'
import type { Photo } from '../types'
import { sizeTextOf } from '../utils'

defineOptions({ name: 'PhotoCard' })

const props = defineProps<{
    photo: Photo
    box?: MasonryBox
    index: number
}>()

const emit = defineEmits<{
    select: []
    naturalSize: [id: string, width: number, height: number]
}>()

// 位置与尺寸全部由 useMasonry 算好，这里只负责贴上去
const slotStyle = computed(() => props.box
    ? {
        transform: `translate3d(${props.box.x}px, ${props.box.y}px, 0)`,
        width: `${props.box.width}px`,
        height: `${props.box.height}px`,
    }
    // 首帧还没量到容器宽度，先不可见，避免卡片全叠在左上角闪一下
    : { visibility: 'hidden' as const })

// 入场依次错开，最多延迟 480ms
const cardStyle = computed(() => ({ '--delay': `${Math.min(props.index * 40, 480)}ms` }))
</script>

<style lang="scss" scoped>
.slot {
    position: absolute;
    top: 0;
    left: 0;
    transition:
        transform 0.55s var(--g-ease),
        width 0.55s var(--g-ease),
        height 0.55s var(--g-ease);
    will-change: transform;
}

.card.masked {
    // 只糊缩略图本身；大图在灯箱里正常显示
    :deep(.lazy img) {
        filter: blur(18px);
        transform: scale(1.08);
        transition: filter 0.2s ease;
    }
}

.card {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 1px solid var(--g-line);
    border-radius: var(--g-radius);
    overflow: hidden;
    background: var(--g-surface);
    cursor: zoom-in;
    animation: card-in 0.55s var(--g-ease) both;
    animation-delay: var(--delay, 0ms);
    transition: box-shadow 0.3s ease, transform 0.4s var(--g-ease), border-color 0.3s ease;

    &:hover,
    &:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, rgb(var(--g-accent)) 45%, transparent);
        box-shadow: 0 12px 28px -14px rgba(120, 90, 110, 0.55);
        transform: translateY(-2px);

        .overlay {
            opacity: 1;
            transform: translateY(0);
        }

        :deep(.lazy img) {
            transform: scale(1.04);
        }
    }
}

.overlay {
    position: absolute;
    inset: auto 0 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 28px 14px 12px;
    text-align: left;
    background: linear-gradient(to top,
            color-mix(in srgb, var(--g-surface) 96%, transparent),
            color-mix(in srgb, var(--g-surface) 0%, transparent));
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
}

.title {
    font-size: 13px;
    font-weight: 600;
    color: var(--g-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.meta {
    flex: none;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--g-dim);
}

@keyframes card-in {
    from {
        opacity: 0;
        transform: translateY(18px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {

    .slot,
    .card {
        animation: none;
        transition: none;
    }
}
</style>
