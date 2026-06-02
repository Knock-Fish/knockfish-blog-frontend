<template>
    <div class="about">
        <el-empty description="暂无数据" />
    </div>
</template>

<script setup lang='ts'>
defineOptions({ name: 'About' })
</script>

<style lang="scss" scoped>
.about {
    width: 100%;
    height: 100%;
    @include frosted-glass;
}
</style>