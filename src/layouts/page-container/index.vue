<template>
    <div class="page-container">
        <!-- 顶部色块原本压在封面下方看不到；错误页没有封面，留着会在半屏处露出一条硬边 -->
        <div v-if="!isErrorPage" class="bg"></div>
        <div class="page-container-view">
            <RouterView v-slot="{ Component }">
                <Transition name="page-fade" appear>
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
// 错误页（meta.code）不铺顶部色块
const isErrorPage = computed(() => Boolean(route.meta?.code))
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
    background-color: var(--bg--color);

    .bg {
        width: 100%;
        height: 40vh;
        z-index: -1;
        background-color: rgb(var(--bg-color-100-rgb));
        position: absolute;
        top: 0;
        left: 0;
        mask-image: linear-gradient(to top, transparent 0%, rgba(255, 244, 244, 0.5) 40%, #000 100%);
    }

    .page-container-view {
        padding: 40px 15px 15px;
        max-width: 1300px;
        margin: 0 auto;
    }
}

.page-fade-enter-active,
.page-fade-leave-active {
    transition: opacity 0.2s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
    opacity: 0;
}
</style>