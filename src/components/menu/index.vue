<template>
    <div class="menu">
        <ElScrollbar>
            <ElMenu
                :default-active="activeMenu"
                :collapse-transition="true"
                :mode="menuMode"
                :ellipsis="false"
                :router="true"
                @select="handleSelect"
            >
                <TreeMenu :menuData="menuItem" />
            </ElMenu>
        </ElScrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface MenuItem {
    id: number
    name: string
    path: string
    // 图标以组件形式传入（unplugin-icons 编译期按需），由 <component :is> 渲染
    icon?: Component
    children?: MenuItem[]
}

const route = useRoute()
const emit = defineEmits<{
    (e: 'select', key: string, keyPath: string[]): void
}>()
// 扩展 props，增加 onSelect 回调
const props = withDefaults(defineProps<{
    menuItem: MenuItem[]
    menuMode?: "horizontal" | "vertical"
}>(), {
    menuMode: "horizontal"
})

const menuItem = computed(() => props.menuItem)
const menuMode = computed(() => props.menuMode)

// 当前激活菜单路径
const activeMenu = computed(() => route.path)

const handleSelect = (key: string, keyPath: string[]) => {
    emit('select', key, keyPath)
}
</script>

<style lang="scss" scoped></style>