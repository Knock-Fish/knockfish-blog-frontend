<template>
    <div class="background-image">
        <!-- 图片背景 -->
        <TransitionGroup name="fade" tag="div" class="image-container" v-if="!isVideo">
            <div v-for="(img, index) in imageList"
                v-show="currentIndex === index" class="image" :style="{
                    backgroundImage: `url(${img})`,
                }" :key="img">
            </div>
        </TransitionGroup>

        <!-- 视频背景 -->
        <video v-else ref="videoRef"
            class="video-background"
            :src="videoSrc"
            autoplay
            loop
            muted
            playsinline
            @loadeddata="onVideoLoaded"
            @error="onVideoError">
        </video>

        <slot></slot>
    </div>
</template>

<script setup lang='ts'>
interface Props {
    src?: string | string[]   // 图片背景
    videoSrc?: string          // 视频背景（优先级高于 src）
    activeIndex?: number
    isVideo?: boolean          // 是否启用视频模式
}

const props = withDefaults(defineProps<Props>(), {
    src: () => [],
    videoSrc: '',
    activeIndex: 0,
    isVideo: false
})

const imageList = computed(() => {
    if (typeof props.src === 'string') return [props.src]
    return props.src || []
})
const currentIndex = computed(() => props.activeIndex)

const videoRef = ref<HTMLVideoElement | null>(null)

const onVideoLoaded = () => {
    // 视频加载完成后的回调
}

const onVideoError = (e: Event) => {
    console.warn('视频加载失败:', e)
}

// 暴露视频控制方法（可选）
defineExpose({
    videoRef,
    play: () => videoRef.value?.play(),
    pause: () => videoRef.value?.pause()
})
</script>

<style lang="scss" scoped>
.background-image {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    .image {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
    }

    .video-background {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        top: 0;
        left: 0;
    }

    // 淡入淡出过渡效果
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 500ms ease-in-out;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .fade-leave-active {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}
</style>