<template>
    <div class="link">
        <el-empty description="暂无数据" />
    </div>
</template>

<script setup lang='ts'>
defineOptions({ name: 'Link' })
</script>

<style lang="scss" scoped>
.link{
    width: 100%;
    height: 100%;
    @include frosted-glass;
}
</style>