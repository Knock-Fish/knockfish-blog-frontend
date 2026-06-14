<template>
    <ElAffix :offset="80">
        <div class="anchor">
            <ElAnchor @change="handleAnchorChange">
                <ElAnchorLink 
                    v-for="item in categoryAnchor"
                    :key="item.categoryId" 
                    :href="`#${item.categoryName}`"
                >
                    {{ item.categoryName }}
                </ElAnchorLink>
            </ElAnchor>
        </div>
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

const handleAnchorChange = (href: string) => {
    if (!href) return
    const anchorName = href.replace('#', '')
    console.log('当前激活:', anchorName)
}
</script>

<style lang="scss" scoped>
.anchor {
    width: 110px;
    border-radius: 8px;
    padding: 8px 0;
    
    :deep(.el-anchor) {
        .el-anchor__item {
            .el-anchor__link {
                padding: 6px 12px;
                font-size: 13px;
                color: var(--text-color-200);
                transition: all 0.2s;
                
                &:hover {
                    color: var(--primary-color);
                    background: var(--bg-color-50);
                }
                
                &.is-active {
                    color: var(--primary-color);
                    font-weight: 500;
                    background: var(--bg-color-50);
                }
            }
        }
    }
}
</style>