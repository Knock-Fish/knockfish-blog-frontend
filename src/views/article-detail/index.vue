<template>
    <div class="article">
        <div class="article-content">
            <h1>{{ article?.title }}</h1>
            <div class="meta">
                <span class="author">作者：{{ article?.username }}</span>
                <time class="publish-time">时间：{{ article?.publishTime
                    }}</time>
                <time class="updated-time" v-if="article?.updatedTime">最后修改时间：{{
                    article?.updatedTime }}</time>
            </div>
            <MdPreview class="md-preview" :id="editorId"
                :modelValue="article?.content"
                :theme="isDark ? 'dark' : 'light'"
                :codeTheme="isDark ? 'github' : 'atom'" />
        </div>
        <div class="article-anchor">
            <MdCatalog v-if="hasCatalog" :editorId="editorId"
                :scrollElement="scrollElement" />
            <div v-else class="empty-tip">暂无目录</div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { ArticleService } from "@api/articleApi"
import { useRoute } from 'vue-router'

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
const getArticleDetail = async () => {
    const data = await ArticleService.getArticleById(Number(route.params.id))
    article.value = data
    detailLoading.value = false
}
onMounted(async () => {
    await getArticleDetail()
})
</script>

<style lang="scss" scoped>
.article {
    display: flex;
    gap: 50px;
    position: relative;
    justify-content: flex-end;
    width: 100%;
    box-sizing: border-box;

    .article-content {
        box-sizing: border-box;
        max-width: 900px;
        width: 100%;
        transition: all 0.3s ease;
        flex: none;
        overflow-x: hidden;

        &>h1 {
            font-weight: bold;
            margin-bottom: 20px;
        }

        .meta {
            display: flex;
            margin-bottom: 20px;
            gap: 5px;

            .author,
            .publish-time,
            .updated-time {
                margin-right: 20px;
                color: #8a919f;
            }

            @media screen and (max-width: $screen-medium) {
                flex-direction: column;
            }
        }

        .md-preview {
            background-color: transparent;

            :deep(.md-editor-preview-wrapper) {
                overflow-x: auto;
            }
        }
    }

    .article-anchor {
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