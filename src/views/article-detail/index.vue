<template>
    <div class="article">
        <div class="article-content">
            <MdPreview 
                class="md-preview" 
                :id="editorId"
                :modelValue="article?.content"
                :theme="isDark ? 'dark' : 'light'"
                :codeTheme="isDark ? 'github' : 'atom'" 
            />
        </div>
        <div class="article-anchor">
            <MdCatalog 
                v-if="hasCatalog" 
                :editorId="editorId" 
                :scrollElement="scrollElement" 
            />
            <div v-else class="empty-tip">暂无目录</div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { ArticleService } from "@api/articleApi"
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { useDark } from '@vueuse/core'

type Article = Api.Article.ArticleDetailInfo
const route = useRoute()
const article = ref<Article>()
const detailLoading = ref<boolean>(true)
const isDark = useDark()

// 滚动容器
const scrollElement = document.documentElement
const editorId = 'markdown-preview'

// 判断是否存在标题（可生成目录）
const hasCatalog = computed(() => {
  if (!article.value?.content) return false
  // 匹配 1~6 级 Markdown 标题
  return /^#{1,6}\s+.+/m.test(article.value.content)
})

// 请求文章数据
ArticleService.getArticleById(Number(route.params.id)).then((data) => {
    article.value = data
    detailLoading.value = false
})
</script>

<style lang="scss" scoped>
.article {
    display: flex;
    gap: 20px;
    z-index: 10000;
    position: relative;
    justify-content: center;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;

    .article-content {
        box-sizing: border-box;
        max-width: 800px;
        width: 100%;
        flex: none;
        overflow-x: hidden;

        .md-preview {
            background-color: transparent;
            :deep(.md-editor-preview-wrapper) {
                overflow-x: auto;
            }
        }
    }

    .article-anchor {
        box-sizing: border-box;
        width: 220px;
        flex-shrink: 0;
        position: sticky;
        top: 105px;
        height: calc(100vh - 100px);
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* 暂无目录样式 */
    .empty-tip {
        color: #999;
        font-size: 14px;
    }

    @media screen and (max-width: $screen-larger) {
        .article-content {
            max-width: 100%;
        }
        .article-anchor {
            display: none;
        }
    }
}
</style>