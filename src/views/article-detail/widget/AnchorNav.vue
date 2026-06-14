<template>
    <div class="anchor-nav">
        <ElAnchor>
            <ElAnchorLink 
                v-for="heading in headings" 
                :key="heading.id"
                :href="`#${heading.id}`"
            >
                <div :style="{ marginLeft: `${(heading.level - 1) * 15}px` }">
                    {{ heading.text }}
                </div>
            </ElAnchorLink>
        </ElAnchor>
        <div v-if="!headings.length" class="empty-tip">
            暂无目录
        </div>
    </div>
</template>

<script setup lang='ts'>
interface Props {
    headings: Array<{
        id: string
        text: string
        level: number
    }>
}
const props = defineProps<Props>()
</script>

<style lang="scss" scoped>
.anchor-nav {
    height: 440px;
    color: var(--text-color-200);
    overflow-y: auto; /* 目录过长可滚动 */
}
.empty-tip {
    padding: 10px;
    color: #999;
    text-align: center;
}
</style>