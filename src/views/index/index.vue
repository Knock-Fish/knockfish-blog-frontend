<template>
    <div class="layout-container">
        <!-- 页面背景图 -->
        <!-- <PageBg /> -->
        <!-- 顶部导航栏 -->
        <HeaderBar />
        <!-- 背景图 -->
        <HeaderBg />
        <!-- 波浪 -->
        <Wave />
        <!-- 内容 -->
        <PageContainer />
        <!-- 底部 -->
        <FooterContent />
    </div>
</template>

<script setup lang='ts'>

</script>

<style lang="scss" scoped>
.layout-container {
    background-color: var(--bg--color);
    position: relative;
    box-sizing: border-box;
}
</style>