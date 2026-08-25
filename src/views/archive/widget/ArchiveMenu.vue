<template>
    <div class="archive-menu" :class="{ collapsed: isCollapsed }">
        <ElMenu :default-active="activeMenuIndex" mode="vertical"
            class="menu-content" @select="handleMenuSelect">
            <ElMenuItem v-for="item in menuItems" :key="item.key"
                :index="item.key">
                <template #title>
                    <span>{{ item.label }}</span>
                </template>
            </ElMenuItem>
            <ElMenuItem v-for="item in noteList" :key="`note-${item.noteId}`"
                :index="`/archive/note/${item.noteId}`">
                <template #title>
                    <span>{{ item.noteTitle }}</span>
                </template>
            </ElMenuItem>
        </ElMenu>
    </div>
</template>

<script setup lang="ts">
import { NoteService } from "@/api/noteApi"
import { useRoute } from 'vue-router'

type Note = Api.Note.NoteInfo

const route = useRoute()

const getNoteMenu = async () => {
    const res = await NoteService.getNoteMenuList()
    noteList.value = res
}

const noteList = ref<Note[]>([])

interface MenuItem {
    key: string
    label: string
}

const emit = defineEmits<{
    (e: 'menu-select', value: string): void
}>()

const isCollapsed = ref(false)

const menuItems: MenuItem[] = [
    { key: '/archive/article', label: '文章年份列表' },
    { key: '/archive/code-snippets', label: '代码片段' },
    { key: '/archive/tags', label: '标签归档' },
]

const activeMenuIndex = computed(() => {
    const path = route.path
    if (path.includes('/archive/note')) {
        return path
    }
    if (path.includes('/archive/code-snippets')) return '/archive/code-snippets'
    if (path.includes('/archive/tags')) return '/archive/tags'
    return '/archive/article'
})

const handleMenuSelect = (key: string) => {
    emit('menu-select', key)
}

onMounted(async () => {
    await getNoteMenu()
})
</script>

<style lang="scss" scoped>
.archive-menu {
    width: 220px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 90px);
    max-height: calc(100vh - 90px);
    transition: width 0.3s ease;

    &.collapsed {
        width: 64px;
    }
}

.menu-content {
    flex-grow: 1;
    min-height: 0;
    overflow-y: auto;
    border: none;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 3px;
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
    min-height: 0;
    overflow-y: auto;
    border: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
    }

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