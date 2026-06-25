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
                    :scrollElement="scrollElement" />
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
import { useRoute } from 'vue-router'

const route = useRoute()
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

const getNote = async () => {
    const noteId = props.id || route.params.id
    if (!noteId) return

    loading.value = true
    try {
        const data = await NoteService.getNoteById(Number(noteId))
        note.value = data
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
        position: sticky;
        top: 105px;
        height: calc(100vh - 150px);
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
