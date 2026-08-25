<template>
    <!-- 循环生成多条骨架，和每页数量一致 -->
    <ElSkeleton v-if="loading" v-for="index in page.pageSize" :key="index"
        animated>
        <template #template>
            <ElCard>
                <div class="container">
                    <!-- 左侧内容骨架 -->
                    <div class="left-container">
                        <ElSkeletonItem variant="h3" />
                        <!-- 日期行骨架 -->
                        <div class="text-block">
                            <ElSkeletonItem variant="rect"
                                style="width: 32px;height: 32px;" />
                            <ElSkeletonItem variant="text"
                                style="margin-left: 10px; height: 32px" />
                        </div>
                        <!-- 描述骨架 -->
                        <ElSkeletonItem variant="text"
                            style="margin-top: 15px;height: 40px;" />
                        <!-- 标签骨架 -->
                        <div class="tags">
                            <ElSkeletonItem v-for="tagIdx in 3" :key="tagIdx"
                                variant="rect"
                                style="width: 50px;height: 20px;" />
                        </div>
                    </div>
                    <!-- 右侧图片骨架 -->
                    <div class="right-container">
                        <ElSkeletonItem variant="image" class="el-image" />
                    </div>
                </div>
            </ElCard>
        </template>
    </ElSkeleton>
    <template v-else>
        <!-- 暂无文章 -->
        <ElEmpty v-if="articleList.length === 0" description="暂无文章"
            :image-size="120">
            <template #image>
                <SvgIcon icon="mdi:file-document-outline"
                    style="font-size: 80px; color: var(--text-color-200);" />
            </template>
        </ElEmpty>
        <template v-else>
            <!-- 使用 TransitionGroup 包裹文章列表 -->
            <TransitionGroup name="article-list" tag="div" appear>
                <ElCard v-for="article in articleList" :key="article.articleId"
                    @click="handleArticleDetail(article.articleId)">
                    <div class="container">
                        <div class="left-container">
                            <span class="title">{{ article.title }}</span>
                            <div class="text-block">
                                <div class="text">
                                    <div class="icon">
                                        <SvgIcon icon="mdi:date-range"
                                            color="#FD4781" />
                                    </div>
                                    <div class="date">{{ article.publishTime }}
                                    </div>
                                </div>
                            </div>
                            <div class="description">
                                {{ article.description }}
                            </div>
                            <div class="tags">
                                <ElTag v-for="tag in article.tags"
                                    :color="tag.color" effect="light"
                                    :key="tag.tagId" size="small">
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
            </TransitionGroup>
            <div ref="paginationRef" class="pagination">
                <ElPagination :size="paginationSize" background
                    layout="prev, pager, next" :total="page.total"
                    v-model:page-size="page.pageSize"
                    v-model:current-page="page.pageNum"
                    @update:current-page="handleCurrentPageChange"
                    @update:page-size="handlePageSizeChange" />
            </div>
        </template>
    </template>
</template>

<script setup lang='ts'>
import { ArticleService } from "@api/articleApi"
type ArticleDetail = Api.Article.ArticleDetailInfo
const errorUrl = new URL("@imgs/error.webp", import.meta.url).href
const router = useRouter()
const loading = ref<boolean>(true)
const keyword = reactive<Record<string, any>>({})
const paginationSize = ref<'large' | 'default' | 'small'>('large')
const paginationRef = ref<Element | null>(null)
const articleList = ref<ArticleDetail[]>([])
const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
})
/** 获取文章列表 */
const getArticleData = async () => {
    loading.value = true // 请求开始前显示骨架屏
    const data = await ArticleService.getAllArticleWithTags({
        ...keyword,
        pageNum: page.pageNum,  // 当前页码
        pageSize: page.pageSize,    // 每页条数
    })
    // 处理文章列表，为每篇文章添加 tags 属性
    articleList.value = data.list.map((article: ArticleDetail) => {
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
    loading.value = false // 请求结束，隐藏骨架屏
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
onMounted(async () => {
    await getArticleData()
    await nextTick()
    if (paginationRef.value) {
        // 开始监听
        resizeObserver.observe(paginationRef.value as Element)
    }
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
    overflow: hidden;

    @media screen and (max-width: $screen-medium) {
        :deep(.el-card__body) {
            padding: 0 !important;
        }
    }

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
            // height: 150px;

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
                        width: 22px;
                        height: 22px;
                        box-sizing: border-box;
                        font-size: 15px;
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
                font-size: 14px;
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
                margin-top: 25px;
                display: flex;
                overflow-x: auto; // 超出横向滚动
                gap: 8px;

                .el-tag {
                    flex-shrink: 0; // 防止标签被压缩
                }
            }
        }

        .right-container {
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
            // flex-direction: column;
            // gap: 0px;
            position: relative;
            min-height: 250px;

            .right-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%; // 铺满卡片
                z-index: 0; // 背景层
                overflow: hidden;
                border-radius: inherit;

                &::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    z-index: 1;
                    pointer-events: none;
                }

                .el-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 0;

                    :deep(.el-image__inner) {
                        object-fit: cover;
                        object-position: center;
                        // mask-image: linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.5) 30%, #000 100%);
                    }
                }
            }

            .left-container {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 1;
                padding: 10px;
                color: #fff;
                box-sizing: border-box;

                .title {
                    font-size: 16px;
                    color: #fff;
                    border-left: none;
                    padding-left: 0;
                }

                .text-block {
                    .date {
                        font-size: 13px;
                        color: rgba(255, 255, 255, 0.9) !important;
                    }
                }


                .description {
                    margin-top: 5px;
                    font-size: 13px;
                    flex: none;
                    color: rgba(255, 255, 255, 0.90) !important;
                    -webkit-line-clamp: 1;
                }

                .tags {
                    margin-top: 5px;
                    // position: absolute;
                    // bottom: 10px;
                    opacity: 0.9;
                }
            }
        }
    }
}

.el-pagination {
    justify-content: center;
    margin-bottom: 20px;
}

/* 暂无文章样式 */
:deep(.el-empty) {
    padding: 60px 0;

    .el-empty__description {
        margin-top: 20px;
        font-size: 16px;
        color: var(--text-color-200);
    }
}

/* ======================== 文章列表动画 ======================== */
.article-list-move,
.article-list-enter-active,
.article-list-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-list-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.article-list-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}

/* 确保离开的卡片不占用空间，让后续卡片平滑上移 */
.article-list-leave-active {
    position: absolute;
    width: 100%;
}

/* 为卡片容器添加相对定位，用于绝对定位的离开动画 */
.article-list {
    position: relative;
}

/* 卡片入场延迟，实现瀑布流效果 */
.article-list-enter-active:nth-child(1) {
    transition-delay: 0.05s;
}

.article-list-enter-active:nth-child(2) {
    transition-delay: 0.10s;
}

.article-list-enter-active:nth-child(3) {
    transition-delay: 0.15s;
}

.article-list-enter-active:nth-child(4) {
    transition-delay: 0.20s;
}

.article-list-enter-active:nth-child(5) {
    transition-delay: 0.25s;
}

.article-list-enter-active:nth-child(6) {
    transition-delay: 0.30s;
}

.article-list-enter-active:nth-child(7) {
    transition-delay: 0.35s;
}

.article-list-enter-active:nth-child(8) {
    transition-delay: 0.40s;
}

.article-list-enter-active:nth-child(9) {
    transition-delay: 0.45s;
}

.article-list-enter-active:nth-child(10) {
    transition-delay: 0.50s;
}
</style>