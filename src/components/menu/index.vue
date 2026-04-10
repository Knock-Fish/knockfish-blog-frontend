<template>
    <div class="menu">
        <ElScrollbar>
            <ElMenu :default-active="activeMenu"  :collapse-transition="true"
                :mode="menuMode" :ellipsis="false" :router="true">
                <TreeMenu :menuData="menuItem" />
            </ElMenu>
        </ElScrollbar>
    </div>
</template>

<script setup lang='ts'>
interface MenuItem {
    id: number
    name: string
    icon?: string
    children?: MenuItem[]
}
const route = useRoute()
const props = withDefaults(defineProps<{
    menuItem: MenuItem[]
    menuMode?: "horizontal" | "vertical"
}>(), {
    menuMode: "horizontal"
})
// 计算当前激活的菜单项
const activeMenu = computed(() => {
    return route.path
})
</script>
<style lang="scss" scoped></style>