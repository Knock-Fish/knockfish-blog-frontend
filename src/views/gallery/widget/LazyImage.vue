<template>
    <span ref="host" class="lazy" :class="{ loaded }">
        <img v-if="src" :src="src" :alt="alt" loading="lazy" decoding="async" @load="onLoad" />
    </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'LazyImage' })

const props = withDefaults(defineProps<{
    src: string
    alt: string
    /** 提前多少像素开始加载 */
    rootMargin?: string
}>(), {
    rootMargin: '400px 0px',
})

const emit = defineEmits<{ naturalSize: [width: number, height: number] }>()

const host = useTemplateRef<HTMLElement>('host')
const src = ref('')
const loaded = ref(false)

let observer: IntersectionObserver | null = null

const reveal = () => {
    if (src.value) return
    src.value = props.src
    observer?.disconnect()
    observer = null
}

onMounted(() => {
    // 老浏览器没有 IntersectionObserver 就直接加载
    if (typeof IntersectionObserver === 'undefined') {
        reveal()
        return
    }

    observer = new IntersectionObserver(
        entries => {
            if (entries.some(entry => entry.isIntersecting)) reveal()
        },
        { rootMargin: props.rootMargin },
    )

    if (host.value) observer.observe(host.value)
})

onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
})

const onLoad = (event: Event) => {
    const image = event.target as HTMLImageElement
    loaded.value = true
    emit('naturalSize', image.naturalWidth, image.naturalHeight)
}
</script>

<style lang="scss" scoped>
.lazy {
    position: absolute;
    inset: 0;
    display: block;
    overflow: hidden;
    background: linear-gradient(120deg, var(--g-skeleton) 25%, var(--g-skeleton-2) 50%, var(--g-skeleton) 75%);
    background-size: 200% 100%;
    animation: lazy-shimmer 1.6s linear infinite;

    &.loaded {
        animation: none;
        background: var(--g-skeleton);
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.45s var(--g-ease), transform 0.6s var(--g-ease);
        will-change: opacity, transform;
    }

    &.loaded img {
        opacity: 1;
    }
}

@keyframes lazy-shimmer {
    from {
        background-position: 200% 0;
    }

    to {
        background-position: -200% 0;
    }
}
</style>
