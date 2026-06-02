<template>
    <ElCard v-for="article in articleList" :key="article.articleId"
        @click="handleArticleDetail(article.articleId)">
        <div class="container">
            <div class="left-container">
                <span class="title">{{ article.title }}</span>
                <div class="text-block">
                    <div class="text">
                        <div class="icon">
                            <ElIcon>
                                <SvgIcon icon="mdi:date-range"
                                    color="#FD4781" />
                            </ElIcon>
                        </div>
                        <div class="date">{{ article.publishTime }}</div>
                    </div>
                </div>
                <div class="description">
                    {{ article.description }}
                </div>
                <div class="tags">
                    <ElTag v-for="tag in article.tags" :color="tag.color"
                        effect="light" :key="tag.tagId">
                        {{ tag.tagName }}
                    </ElTag>
                </div>
            </div>
            <div class="right-container">
                <ElImage :src="article.cover" fit="cover" lazy>
                    <template #error>
                        <ElImage :src="errorUrl" />
                    </template>
                </ElImage>
            </div>
        </div>
    </ElCard>
    <div ref="paginationRef" class="pagination">
        <ElPagination :size="paginationSize" background
            layout="prev, pager, next" :total="page.total"
            v-model:page-size="page.pageSize"
            v-model:current-page="page.pageNum"
            @update:current-page="handleCurrentPageChange"
            @update:page-size="handlePageSizeChange" />
    </div>
</template>

<script setup lang='ts'>
import { ArticleService } from "@api/articleApi"
const errorUrl = new URL("@imgs/error.webp", import.meta.url).href
const router = useRouter()
type ArticleDetail = Api.Article.ArticleDetailInfo
type Tag = Api.Tag.TagInfo
const paginationSize = ref<'large' | 'default' | 'small'>('large')
const paginationRef = ref<Element | null>(null)
const articleList = ref<ArticleDetail[]>([])
const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
})
const keyword = {}
/** 获取文章列表 */
const getArticleData = () => {
    ArticleService.getAllArticleWithTags({
        ...keyword,
        pageNum: page.pageNum,  // 当前页码
        pageSize: page.pageSize,    // 每页条数
    }).then((data) => {
        // 处理文章列表，为每篇文章添加 tags 属性
        articleList.value = data.list.map(article => {
            if (article.tagIds && article.tagNames) {
                const tagIdArr = article.tagIds.split(',')
                const tagNameArr = article.tagNames.split(',')
                const tagColorArr = article.tagColors.split(',')

                const tags = tagIdArr.map((tid, i) => ({
                    tagId: Number(tid),
                    tagName: tagNameArr[i] || '',
                    color: tagColorArr[i] || ''
                }))

                return {
                    ...article,
                    tags
                }
            }
            return {
                ...article,
                tags: []
            }
        })
        page.total = data.total
    })
}
const handleArticleDetail = (articleId: number) => {
    router.push({
        name: 'ArticleDetail',
        params: {
            id: articleId
        }
    })
}
/** 更新当前页面 */
const handleCurrentPageChange = (newPage: number): void => {
    window.scrollTo({
        top: 500,
        behavior: 'smooth'
    })
    page.pageNum = newPage
    getArticleData()
}
/** 更新当前页条数 */
const handlePageSizeChange = (newSize: number): void => {
    page.pageSize = newSize
    page.pageNum = 1
    getArticleData()
}
onMounted(() => {
    getArticleData()
    // 开始监听
    resizeObserver.observe(paginationRef.value as Element)
})
onBeforeUnmount(() => {
    // 移除监听
    resizeObserver.disconnect()
})
// 监听元素尺寸变化，根据窗口设置分页组件大小
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        if (entry.contentRect.width < 400) {
            paginationSize.value = "small"
        } else {
            paginationSize.value = "large"
        }
    }
})



</script>

<style lang="scss" scoped>
.el-card {
    min-height: 180px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    cursor: pointer;
    background-color: var(--bg-color-100);
    // @include frosted-glass;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .container {
        display: flex;
        justify-content: space-between;
        gap: 40px;

        .left-container {
            display: flex;
            flex-direction: column;
            flex: 2;
            height: 150px;

            .title {
                font-size: 18px;
                font-weight: bold;
                border-left: 5px solid #FF92B5;
                padding-left: 10px;
            }

            .text-block {
                display: flex;
                margin-top: 15px;

                .text {
                    display: flex;

                    .icon {
                        width: 28px;
                        height: 28px;
                        box-sizing: border-box;
                        font-size: 20px;
                        padding: 4px;
                        border-radius: 5px;
                        background-color: rgb(255, 215, 222);
                    }

                    .date {
                        color: var(--text-color-200);
                        margin: auto 10px;
                    }
                }
            }

            .description {
                display: -webkit-box;
                flex: 2;
                font-size: 16px;
                color: var(--text-color-200);
                margin-top: 10px;
                line-clamp: 2;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                word-break: break-word;
                line-height: 1.5;
            }

            .tags {
                margin-top: 10px;
                display: flex;
                overflow-x: auto; // 超出横向滚动
                gap: 8px;

                .el-tag {
                    flex-shrink: 0; // 防止标签被压缩
                }
            }
        }

        .right-container {
            // flex: 1;
            width: 240px;
            height: 160px;

            .el-image {
                width: 100%;
                height: 100%;
                border-radius: 15px;
            }

            @media screen and (min-width: $screen-medium) and (max-width: $screen-desktop) {
                display: none;
            }
        }

        @media screen and (max-width: $screen-medium) {
            flex-direction: column-reverse;
            gap: 0px;

            .right-container {

                .el-image {
                    display: none;
                    height: 150px;

                    :deep(.el-image__inner) {
                        object-position: center top;
                        mask-image: linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.5) 30%, #000 100%);
                    }
                }
            }
        }
    }
}

.el-pagination {
    justify-content: center;
    margin-bottom: 20px;
}
</style>