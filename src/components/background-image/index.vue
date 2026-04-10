<template>
    <div class="background-image">
        <TransitionGroup name="fade" tag="div" class="image-container">
            <div v-for="(img, index) in imageList"
                v-show="currentIndex === index" class="image" :style="{
                    backgroundImage: `url(${img})`,
                }" :key="img">
            </div>
        </TransitionGroup>
        <slot></slot>
    </div>
</template>

<script setup lang='ts'>
interface Props {
    src?: string | string[]
    activeIndex?: number
}
const props = withDefaults(defineProps<Props>(), {
    src: () => [],
    activeIndex: 0
})

const imageList = computed(() => {
    if (typeof props.src === 'string') return [props.src]
    return props.src || []
})
const currentIndex = computed(() => props.activeIndex)
</script>

<style lang="scss" scoped>
.background-image {
    width: 100%;
    height: 100%;
    position: relative;

    .image {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
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

    // 确保离开的元素不阻挡交互
    .fade-leave-active {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}
</style>