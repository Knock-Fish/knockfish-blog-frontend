<template>
    <div class="archive-menu" :class="{ collapsed: isCollapsed }">
        <ElMenu :default-active="activeMenu" mode="vertical"
            class="menu-content" @select="handleMenuSelect">
            <ElMenuItem v-for="item in menuItems" :key="item.key"
                :index="item.key">
                <ElIcon>
                    <SvgIcon :icon="item.icon" />
                </ElIcon>
                <template #title>
                    <span>{{ item.label }}</span>
                </template>
            </ElMenuItem>
        </ElMenu>
        <hr />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import SvgIcon from '@comps/svg-icon/index.vue'

interface MenuItem {
    key: string
    label: string
    icon: string
}

const props = defineProps<{
    activeMenu: string
    totalCount: number
}>()

const emit = defineEmits<{
    (e: 'update:activeMenu', value: string): void
}>()

const isCollapsed = ref(false)

const menuItems: MenuItem[] = [
    { key: 'year-list', label: '文章年份列表', icon: 'mdi:calendar-clock' },
    { key: 'code-snippets', label: '代码片段', icon: 'mdi:code' },
    { key: 'archive-tags', label: '标签归档', icon: 'mdi:tag' },
]

const handleMenuSelect = (key: string) => {
    emit('update:activeMenu', key)
}
</script>

<style lang="scss" scoped>
.archive-menu {
    width: 220px;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: width 0.3s ease;

    &.collapsed {
        width: 64px;
    }
}

.collapse-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color-400);
    transition: all 0.2s ease;

    &:hover {
        background: var(--hover-bg-color-100);
        color: var(--text-color-100);
    }
}

.menu-content {
    flex-grow: 1;
    border: none;

    :deep(.el-menu-item) {
        margin: 4px 8px;
        border-radius: 8px;

        &:hover {
            background: var(--hover-bg-color-100);
        }

        &.is-active {
            background: var(--bg-color-300);
            color: var(--text-color-100);
        }
    }
}

.menu-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border-color);
}


@media screen and (max-width: 768px) {
    .archive-menu {
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 0;
        z-index: 100;
        transform: translateX(0);
        transition: transform 0.3s ease;

        &.collapsed {
            transform: translateX(-100%);
        }
    }
}
</style>