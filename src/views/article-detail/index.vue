<template>
    <div class="article">
        <div class="article-content">
            <Detail :article="article" />
        </div>
        <div class="article-anchor">
            <ElAffix :offset="80">
                <ElCard>
                    <template #header>
                        <div>
                            文章目录
                        </div>
                    </template>
                    <AnchorNav :headings="headings" />
                </ElCard>
            </ElAffix>
        </div>
    </div>
</template>

<script setup lang='ts'>
import Detail from './widget/Detail.vue'
import AnchorNav from './widget/AnchorNav.vue'
type Article = Api.Article.ArticleInfo
import { ArticleService } from "@api/articleApi"
const route = useRoute()
const article = ref<Article>()
const headings = ref<Array<{ id: string, text: string, level: number }>>([])
ArticleService.getArticleById(Number(route.params.id)).then(async (data) => {
    article.value = data
    if (data.content) {
        headings.value = extractHeadingsFromHtml(data.content)
    }
})
// 提取标题的通用函数
const extractHeadingsFromHtml = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

    return Array.from(elements).map((el, index) => ({
        id: el.id || `heading-${index}`,
        text: el.textContent || '',
        level: parseInt(el.tagName.substring(1))
    }))
}
</script>

<style lang="scss" scoped>
.article {
    display: flex;
    gap: 10px;
    z-index: 10000;

    .article-content {
        box-sizing: border-box;
        width: 80%;
        padding: 20px;
        border-radius: 7px;
        background-color: rgba(var(--bg-color-100-rgb), 1);
        // @include frosted-glass;
    }

    .article-anchor {
        width: 20%;

        .el-card {
            min-height: 150px;
            background-color: rgba(var(--bg-color-100-rgb), 1);
        }
    }

    @media screen and (max-width: $screen-larger) {
        .article-content{
            width: 100%;
        }
        .article-anchor {
            display: none;
        }
    }
}
</style>