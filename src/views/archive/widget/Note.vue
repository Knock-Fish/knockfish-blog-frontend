<template>
    <div class="note-detail">
        <div v-if="loading" class="loading">
            <ElSkeleton :rows="5" animated />
        </div>
        <template v-else-if="note">
            <div class="note-content">
                <MdPreview class="md-preview" :modelValue="note.noteContent"
                    :id="editorId" :theme="isDark ? 'dark' : 'light'"
                    :codeTheme="isDark ? 'github' : 'atom'" />
            </div>
            <div class="note-anchor">
                <MdCatalog v-if="hasCatalog" :editorId="editorId"
                    :scrollElement="scrollElement" :theme="isDark ? 'dark' : 'light'" />
                <div v-else class="empty-tip">暂无目录</div>
            </div>
        </template>
        <div v-else class="empty">
            笔记不存在
        </div>
    </div>
</template>

<script setup lang="ts">
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { NoteService } from '@/api/noteApi'
import { setPageMeta } from '@/utils/pageMeta'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const isDark = useDark()

const props = defineProps<{
    id?: string
}>()

const editorId = `note-preview-${props.id || route.params.id}`
const scrollElement = document.documentElement

const loading = ref(true)
const note = ref<Api.Note.NoteDetailInfo | null>(null)

const hasCatalog = computed(() => {
    if (!note.value?.noteContent) return false
    return /^#{1,6}\s+.+/m.test(note.value.noteContent)
})

/** 从 Markdown 正文里取一段纯文本，作为分享卡片的描述 */
const toExcerpt = (content: string, title: string): string => {
    let text = content
        .replace(/```[\s\S]*?```/g, ' ')          // 代码块
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')    // 图片
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')  // 链接只留文字
        .replace(/<[^>]+>/g, ' ')                 // 行内 HTML
        .replace(/[#>@*`_~]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    // 正文常以一级标题开头，和笔记标题重复，去掉这一段
    if (title && text.startsWith(title)) text = text.slice(title.length).trim()
    return text.slice(0, 80)
}

/**
 * 跳 404 页
 * 隐藏/已删除笔记由后端统一返回「笔记不存在」，前端不再停在详情页空态。
 * 用 replace 而不是 push：避免用户点返回时又被送回这个无效链接。
 * /404 由路由的兜底规则（/:pathMatch(.*)*，meta.code=404）命中，渲染统一错误页。
 */
const toNotFound = () => {
    if (route.name === 'NotFound') return
    router.replace('/404').catch(() => {
        // 导航被后续操作打断时忽略，不影响页面
    })
}

const getNote = async () => {
    const noteId = props.id || route.params.id
    if (!noteId) return

    loading.value = true
    note.value = null
    try {
        const data = await NoteService.getNoteById(Number(noteId))
        note.value = data
        setPageMeta({
            title: data.noteTitle,
            description: toExcerpt(data.noteContent, data.noteTitle),
            type: 'article',
        })
    } catch (error) {
        // 隐藏笔记、已删除笔记、非法 id 都走 404，避免暴露笔记是否存在
        console.warn('笔记不可用:', error)
        toNotFound()
    } finally {
        loading.value = false
    }
}

watch(() => route.params.id, () => {
    getNote()
})

onMounted(() => {
    getNote()
})

defineOptions({ name: 'Note' })
</script>

<style lang="scss" scoped>
.note-detail {
    display: flex;
    gap: 50px;
    position: relative;
    justify-content: flex-end;
    width: 100%;
    box-sizing: border-box;

    .loading {
        padding: 20px;
    }

    .empty {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-color-400);
        font-size: 14px;
    }

    .note-content {
        width: 100%;
        max-width: 850px;
        .md-preview {
            background-color: transparent;

            :deep(.md-editor-preview-wrapper) {
                overflow-x: auto;
            }
        }
    }

    .note-anchor {
        box-sizing: border-box;
        width: 200px;
        flex-shrink: 0;
        // 目录高度跟随内容：条目少时不撑开，条目多时铺满右栏 —— 否则右栏下方会空出一大片
        // 底部只留 24px 呼吸位（sticky + align-self 是项目统一的写法）
        // 注意：sticky 的边界是父容器底边，滚到文档最底部时目录会随内容轻微上移，这是常规行为；
        // 若更在意这点，把 24px 调大即可 —— 下方留白与上移距离此消彼长
        align-self: flex-start;
        position: sticky;
        top: 105px;
        height: auto;
        max-height: calc(100vh - 105px - 24px);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    /* 暂无目录样式 */
    .empty-tip {
        color: #999;
        font-size: 14px;
    }
}

@media screen and (max-width: 1450px) {
    .note-anchor {
        display: none;
    }
}
</style>
