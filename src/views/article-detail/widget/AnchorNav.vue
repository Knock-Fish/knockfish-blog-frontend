<template>
    <div class="anchor-nav">
        <ElAnchor>
            <ElAnchorLink v-for="heading in headings" :key="heading.id"
                :href="`#${heading.text}`">
                <div :style="{ marginLeft: `${(heading.level - 1) * 15}px` }">
                    {{ heading.text }}
                </div>
            </ElAnchorLink>
        </ElAnchor>
        <div v-if="!headings.length">
            暂无目录
        </div>
    </div>
</template>

<script setup lang='ts'>
interface Props {
    headings: Array<{
        id: string,
        text: string,
        level: number
    }>
}
const props = defineProps<Props>()   
</script>

<style lang="scss" scoped>
.anchor-nav {
    color: var(--text-color-200);
}
</style>