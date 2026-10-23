<template>
    <div class="note-list">
        <!-- 搜索：数据已在前端，本地过滤，输入即时生效 -->
        <ElInput v-model="keyword" class="search-input" placeholder="搜索笔记标题" clearable>
            <template #prefix>
                <i-mdi-search />
            </template>
        </ElInput>

        <ElSkeleton v-if="loading" class="note-skeleton" :rows="6" animated />

        <ElEmpty v-else-if="loadFailed" description="笔记加载失败" :image-size="120">
            <ElButton type="primary" @click="fetchNotes">重新加载</ElButton>
        </ElEmpty>

        <ElEmpty v-else-if="filteredNotes.length === 0" :image-size="120"
            :description="keyword ? '没有匹配的笔记' : '暂无笔记'">
            <template #image>
                <i-mdi-notebook-outline class="empty-icon" />
            </template>
        </ElEmpty>

        <div v-else class="note-rows">
            <RouterLink v-for="note in filteredNotes" :key="note.noteId"
                class="note-row" :to="noteRoute(note.noteId)">
                <span class="row-date">{{ formatDate(note.createTime) }}</span>
                <span class="row-title">{{ note.noteTitle }}</span>
                <i-mdi-arrow-right class="row-arrow" />
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NoteService } from '@api/noteApi'

type Note = Api.Note.NoteInfo

/** 笔记为轻量目录型数据，一次拉全，避免翻页带来的多次请求 */
const FETCH_SIZE = 100

const loading = ref<boolean>(true)
const loadFailed = ref<boolean>(false)
const noteList = ref<Note[]>([])
const keyword = ref<string>('')

// 数据已在前端，直接本地过滤，输入即时生效
const filteredNotes = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    if (!kw) return noteList.value
    return noteList.value.filter(note => note.noteTitle.toLowerCase().includes(kw))
})

const pad = (value: number) => String(value).padStart(2, '0')

const parseDate = (time?: string) => {
    if (!time) return null
    const date = new Date(time)
    return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (time?: string) => {
    const date = parseDate(time)
    if (!date) return '未标注时间'
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const noteRoute = (noteId: number) => ({ name: 'ArchiveNote', params: { id: noteId } })

const fetchNotes = async () => {
    loading.value = true
    loadFailed.value = false
    try {
        const data = await NoteService.getNoteList({ pageNum: 1, pageSize: FETCH_SIZE })
        noteList.value = data.list ?? []
    } catch (error) {
        console.error('获取笔记列表失败:', error)
        loadFailed.value = true
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchNotes()
})

defineOptions({ name: 'NoteList' })
</script>

<style lang="scss" scoped>
.note-list {
    // 与归档页其它页面同一套 token（主色跟随站点 #fd4781）
    --accent: 253, 71, 129;
    --t-text: #17181c;
    --t-dim: #5f6470;
    --t-faint: #9aa0ac;
    --t-line: rgba(0, 0, 0, 0.08);
    --t-hover: rgba(0, 0, 0, 0.032);

    box-sizing: border-box;
    width: 100%;
    padding: 20px;
}

html.dark .note-list {
    --t-text: #e7eaf3;
    --t-dim: #8a93a8;
    --t-faint: #5c6478;
    --t-line: rgba(255, 255, 255, 0.09);
    --t-hover: rgba(255, 255, 255, 0.04);
}

/* ---------- 搜索 ---------- */
.search-input {
    width: min(320px, 100%);

    :deep(.el-input__wrapper) {
        padding: 0 12px;
        border-radius: 10px;
        background: var(--t-hover);
        box-shadow: none;
        transition: box-shadow 0.2s ease;
    }

    :deep(.el-input__wrapper.is-focus) {
        box-shadow: 0 0 0 1px rgb(var(--accent));
    }

    :deep(.el-input__inner) {
        height: 38px;
        font-size: 14px;
        color: var(--t-text);
    }

    :deep(.svg-icon) {
        font-size: 16px;
        color: var(--t-faint);
    }
}

.note-skeleton {
    padding: 4px;
}

.empty-icon {
    font-size: 80px;
    color: var(--t-faint);
}

/* ---------- 列表 ---------- */
.note-rows {
    display: flex;
    flex-direction: column;
}

.note-row {
    position: relative;
    display: grid;
    grid-template-columns: 96px 1fr 20px;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--t-line);
    border-radius: 8px;
    color: var(--t-text);
    transition: background 0.2s ease;

    // 左移入的高亮条，替代整行变色带来的突兀感
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 4px;
        bottom: 4px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: rgb(var(--accent));
        transform: scaleY(0);
        transform-origin: center;
        transition: transform 0.25s ease;
    }

    &:last-child {
        border-bottom: none;
    }

    &:hover,
    &:focus-visible {
        background: var(--t-hover);

        &::before {
            transform: scaleY(1);
        }

        .row-title {
            color: rgb(var(--accent));
        }

        .row-arrow {
            opacity: 1;
            transform: translateX(4px);
        }
    }

    &:focus-visible {
        outline: 2px solid rgb(var(--accent));
        outline-offset: -2px;
    }
}

.row-date {
    font-size: 13px;
    color: var(--t-dim);
    font-variant-numeric: tabular-nums;
}

.row-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--t-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;
}

.row-arrow {
    justify-self: end;
    font-size: 16px;
    color: rgb(var(--accent));
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
}

/* ---------- 移动端 ---------- */
@media screen and (max-width: $screen-medium) {
    .note-list {
        padding: 12px;
    }

    .search-input {
        width: 100%;

        :deep(.el-input__inner) {
            height: 44px;
        }
    }

    // 列表转为上下结构，触摸目标不小于 44px
    .note-row {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        min-height: 60px;
        padding: 14px 12px;

        .row-title {
            white-space: normal;
        }

        .row-arrow {
            display: none;
        }
    }
}

// 尊重系统的「减弱动效」设置
@media (prefers-reduced-motion: reduce) {
    .note-row,
    .row-arrow {
        transition: none;
    }
}
</style>
