<template>
    <ElAffix :offset="80">
        <ElAnchor @change="handleAnchorChange">
            <ElAnchorLink v-for="item in categoryAnchor"
                :key="item.categoryId" :href="`#${item.categoryName}`">
                {{ item.categoryName }}
            </ElAnchorLink>
        </ElAnchor>
    </ElAffix>
</template>

<script setup lang='ts'>
interface CategoryAnchor {
    categoryId: number
    categoryName: string
}
interface Props {
    categoryAnchor: CategoryAnchor[]
}
const props = defineProps<Props>()

// 监听锚点变化
const handleAnchorChange = (href: string) => {
    console.log('当前激活的锚点:', href)
    // 可以在这里做其他操作，比如更新路由、发送统计等
}
</script>

<style lang="scss" scoped>
.el-anchor {
    width: 100px;
    @include frosted-glass;
}
</style>