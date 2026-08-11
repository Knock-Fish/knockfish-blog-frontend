<template>
    <div class="code-snippet-card">
        <h2><strong>{{ snippet.title }}</strong></h2>
        <MdPreview style="background: transparent;" :id="editorId"
            :modelValue="snippet.codeContent" :theme="isDark ? 'dark' : 'light'"
            :codeTheme="isDark ? 'github' : 'atom'" />
    </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const isDark = useDark()
interface Props {
    snippet: Api.CodeSnippet.CodeSnippetInfo
}

const props = defineProps<Props>()

const editorId = `snippet-preview-${props.snippet.codeSnippetId}`

</script>

<style lang="scss" scoped>
.code-snippets {
    width: 100%;
    display: flex;
    gap: 20px;
    box-sizing: border-box;
    position: relative;

    .snippet-card {
        box-sizing: border-box;
        width: 100%;
        max-width: 850px;
        transition: all 0.3s ease;
        flex: none;
        overflow-x: hidden;

        .md-preview {
            background-color: transparent;

            :deep(.md-editor-preview-wrapper) {
                overflow-x: auto;
            }
        }
    }

    .snippet-anchor {
        position: sticky;
        width: 200px;
        top: 105px;
        flex-shrink: 0;
        height: calc(100vh - 150px);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    @media screen and (max-width: 1450px) {
        .snippet-anchor {
            display: none;
        }
    }
}
</style>
