<template>
    <div class="page-container">
        <div class="bg"></div>
        <div class="page-container-view">
            <RouterView v-slot="{ Component }">
                <Transition  mode="out-in" appear>
                    <KeepAlive :max="5" :include="keepAliveInclude">
                        <component :is="Component" />
                    </KeepAlive>
                </Transition>
            </RouterView>
        </div>
    </div>
</template>

<script setup lang='ts'>
const route = useRoute()
const keepAliveInclude = ref<string[]>([])
// 动态添加需要缓存的组件
watch(() => route.path, () => {
    // 如果路由 meta 标记需要缓存，且不在缓存列表中
    if (route.meta?.keepAlive) {
        const componentName = route.name as string
        if (!keepAliveInclude.value.includes(componentName)) {
            keepAliveInclude.value.push(componentName)
        }
    }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.page-container {
    width: 100%;
    min-height: 100vh;
    position: relative;

    .bg {
        width: 100%;
        height: 40vh;
        z-index: -1;
        background-color: var(--bg-color-100-rgb);
        position: absolute;
        top: 0;
        left: 0;
        mask-image: linear-gradient(to top, transparent 0%, rgba(255, 244, 244, 0.5) 40%, #000 100%);
    }

    .page-container-view {
        // padding-top: 40px;
        padding: 40px 15px 15px;
        max-width: 1300px;
        margin: 0 auto;
    }
}
</style>