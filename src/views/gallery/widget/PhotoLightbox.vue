<template>
    <Transition name="lb-fade">
        <div v-if="current" class="lightbox" @click.self="close">
            <button type="button" class="lb-btn close" aria-label="关闭" @click="close">
                <i-mdi-close />
            </button>
            <button type="button" class="lb-btn prev" aria-label="上一张" :disabled="photos.length < 2"
                @click="step(-1)">
                <i-mdi-chevron-left />
            </button>

            <figure class="figure">
                <div class="stage">
                    <span v-if="!loaded" class="spinner" />
                    <img :key="current.id" class="photo" :class="{ loaded }" :src="current.preview || current.src" :alt="current.title"
                        @load="loaded = true" />
                </div>
                <figcaption class="caption">
                    <strong>{{ current.title }}</strong>
                    <span>{{ (index ?? 0) + 1 }} / {{ photos.length }}</span>
                    <span>{{ sizeTextOf(current) }}</span>
                </figcaption>
            </figure>

            <button type="button" class="lb-btn next" aria-label="下一张" :disabled="photos.length < 2"
                @click="step(1)">
                <i-mdi-chevron-right />
            </button>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import type { Photo } from '../types'
import { sizeTextOf } from '../utils'

defineOptions({ name: 'PhotoLightbox' })

const props = defineProps<{ photos: Photo[] }>()

/** null 表示关闭 */
const index = defineModel<number | null>({ default: null })

const loaded = ref(false)

const current = computed(() => (index.value === null ? null : props.photos[index.value] ?? null))

/** 提前把左右两张拉进缓存，翻页不白屏 */
const preloadNeighbors = () => {
    if (index.value === null) return
    const total = props.photos.length
    for (const offset of [-1, 1]) {
        const photo = props.photos[(index.value + offset + total) % total]
        if (photo) new Image().src = photo.preview || photo.src
    }
}

watch(current, (photo) => {
    loaded.value = false
    if (photo) preloadNeighbors()
})

const step = (delta: number) => {
    const total = props.photos.length
    if (!total || index.value === null) return
    index.value = (index.value + delta + total) % total
}

const close = () => {
    index.value = null
}

const onKeydown = (event: KeyboardEvent) => {
    if (!current.value) return
    if (event.key === 'Escape') close()
    else if (event.key === 'ArrowLeft') step(-1)
    else if (event.key === 'ArrowRight') step(1)
    else return
    event.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style lang="scss" scoped>
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 21000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5vh 6vw;
    background: var(--g-overlay);
    backdrop-filter: blur(18px);
}

.figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin: 0;
    max-width: 100%;
    max-height: 100%;
}

.stage {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 120px;
}

.spinner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 2px solid color-mix(in srgb, rgb(var(--g-accent)) 25%, transparent);
    border-top-color: rgb(var(--g-accent));
    border-radius: 50%;
    animation: lb-spin 0.8s linear infinite;
}

.photo {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 14px;
    box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.45);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.loaded {
        opacity: 1;
    }
}

.caption {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12.5px;
    font-variant-numeric: tabular-nums;
    color: var(--g-dim);

    strong {
        font-size: 15px;
        color: var(--g-text);
    }
}

.lb-btn {
    position: absolute;
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    padding: 0;
    border: 1px solid var(--g-line);
    border-radius: 50%;
    background: var(--g-surface);
    color: var(--g-text-2);
    font-size: 22px;
    box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.35);
    transition: color 0.2s, border-color 0.2s, transform 0.2s;

    &:hover:not(:disabled) {
        color: rgb(var(--g-accent));
        border-color: rgb(var(--g-accent));
        transform: scale(1.06);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.close {
    top: 22px;
    right: 22px;
    font-size: 18px;
}

.prev {
    left: 22px;
    top: 50%;
    margin-top: -23px;
}

.next {
    right: 22px;
    top: 50%;
    margin-top: -23px;
}

.lb-fade-enter-active,
.lb-fade-leave-active {
    transition: opacity 0.25s ease;
}

.lb-fade-enter-from,
.lb-fade-leave-to {
    opacity: 0;
}

@keyframes lb-spin {
    to {
        transform: rotate(360deg);
    }
}

@media screen and (max-width: $screen-medium) {
    .lightbox {
        padding: 8vh 4vw;
    }

    .lb-btn {
        width: 38px;
        height: 38px;
        font-size: 18px;
    }

    .prev {
        left: 8px;
        margin-top: -19px;
    }

    .next {
        right: 8px;
        margin-top: -19px;
    }

    .close {
        top: 12px;
        right: 12px;
    }

    .caption {
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
    }

    .photo {
        max-height: 74vh;
    }
}
</style>
