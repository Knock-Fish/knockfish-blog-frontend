<template>
    <!-- 顶部阅读进度：用 scaleX 走合成层，避免每帧改宽度触发重排 -->
    <div class="reading-progress" :style="{ transform: `scaleX(${percent / 100})` }"></div>
</template>

<script setup lang="ts">
/**
 * 这里不用 useWindowScroll：同一个 composable 在 header 里正常，但在按路由重建的组件里
 * 拿不到更新后的 scrollY（实测滚动到 500 仍是 0）。直接监听 window 的 scroll 最稳，
 * 也顺手覆盖字体加载 / 图片撑高后总高度变化的情况。
 */
const percent = ref(0)

const update = () => {
    const doc = document.documentElement
    const total = doc.scrollHeight - doc.clientHeight
    percent.value = total <= 0
        ? 0
        : Math.min(100, Math.max(0, (window.scrollY / total) * 100))
}

onMounted(() => {
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
})
</script>

<style lang="scss" scoped>
.reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    z-index: 20001;
    transform-origin: left center;
    background: linear-gradient(90deg, #ff92b5, #fd4781);
    transition: transform 0.08s linear;
    will-change: transform;
    pointer-events: none;
}
</style>
