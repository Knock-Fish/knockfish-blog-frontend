<template>
    <template v-for="item in props.menuData" :key="item.id">
        <!-- 无子菜单的情况 -->
        <ElMenuItem v-if="!item.children || item.children.length === 0"
            :index="item.path">
            <ElIcon v-if="item.icon">
                <SvgIcon :icon="item.icon" />
            </ElIcon>
            <span>{{ item.name }}</span>
        </ElMenuItem>

        <!-- 有子菜单的情况 -->
        <ElSubMenu v-else :index="item.path">
            <template #title>
                <ElIcon v-if="item.icon">
                    <SvgIcon :icon="item.icon" />
                </ElIcon>
                <span>{{ item.name }}</span>
            </template>
            <!-- 递归调用 TreeMenu -->
            <TreeMenu :menu-data="item.children" />
        </ElSubMenu>
    </template>
</template>

<script setup>
import TreeMenu from './TreeMenu.vue'

const props = defineProps({
    menuData: {
        type: Array,
        required: true,
        default: () => [],
    },
})
</script>
<style lang="scss" scoped>
.el-icon {
    font-size: 30px;
}

.el-menu-item {
    font-weight: bold;
    font-size: 18px;
    color: var(--text-color-200);

    &:hover{
        color: rgb(249, 81, 115) !important;
    }
    &.is-active{
        color: #fff;
    }

    @media screen and (max-width: $screen-medium) {
        font-size: 13px;
        height: 37px;
        color: #000;
    }
}
</style>