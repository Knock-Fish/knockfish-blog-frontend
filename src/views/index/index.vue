<template>
    <div class="layout-container">
        <!-- 页面背景图 -->
        <!-- <PageBg /> -->
        <!-- 顶部导航栏 -->
        <HeaderBar />
        <!-- 封面 + 波浪：错误页不展示，否则 404 文案要滚过一整屏封面才看得到 -->
        <template v-if="showHero">
            <HeaderBg />
            <Wave />
        </template>
        <!-- 内容 -->
        <PageContainer />
        <!-- 小部件 -->
        <SakanaWidget />
        <!-- 自定义鼠标指针 -->
        <AniCursor />
        <!-- 底部 -->
        <FooterContent />
    </div>
</template>

<script setup lang='ts'>
const route = useRoute()
// 错误页（meta.code）跳过封面大图，让提示直接出现在首屏
const showHero = computed(() => !route.meta.code)
</script>

<style lang="scss" scoped>
.layout-container {
    background-color: var(--bg--color);
    position: relative;
    box-sizing: border-box;
}
</style>