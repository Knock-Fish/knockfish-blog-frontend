<template>
    <div class="search-view">
        <div class="search-result">
            <!-- 头部区域 -->
            <div class="search-header">
                <div class="header-left">
                    <el-icon class="search-icon"><Search /></el-icon>
                    <h3>"{{ keyword }}"搜索结果</h3>
                    <span class="result-count">共 {{ page.total }} 篇相关文章</span>
                </div>
            </div>

            <!-- 文章列表 -->
            <div class="article-list">
                <div 
                    v-for="(item, index) in articleList" 
                    :key="index"
                    class="article-card"
                    shadow="hover"
                    @click="handleArticleClick(item)"
                >
                    <div class="article-content">
                        <div class="article-title">
                            <span class="title-index">{{ index + 1 }}</span>
                            {{ item.title }}
                        </div>
                        <div class="article-description">
                            <el-icon><Document /></el-icon>
                            {{ item.description || '暂无描述' }}
                        </div>
                        <div class="article-meta">
                            <span class="meta-item">
                                <el-icon><Clock /></el-icon>
                                <time>{{ formatTime(item.publishTime) }}</time>
                            </span>
                            <span v-if="item.tags && item.tags.length" class="meta-item tags">
                                <el-icon><PriceTag /></el-icon>
                                <span v-for="(tag, idx) in item.tags.slice(0, 3)" :key="idx" class="tag">
                                    {{ tag }}
                                </span>
                                <span v-if="item.tags.length > 3" class="tag-more">+{{ item.tags.length - 3 }}</span>
                            </span>
                        </div>
                    </div>
                    <div class="article-arrow">
                        <el-icon><ArrowRight /></el-icon>
                    </div>
                </div>

                <!-- 空状态 -->
                <el-empty 
                    v-if="!articleList.length && !loading" 
                    description="暂无相关文章"
                    :image-size="120"
                />
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="page.total > page.pageSize">
                <el-pagination
                    v-model:current-page="page.pageNum"
                    v-model:page-size="page.pageSize"
                    :page-sizes="[10, 20, 30, 50]"
                    :total="page.total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ArticleService } from "@api/articleApi"
import { Search, Document, Clock, PriceTag, ArrowRight } from '@element-plus/icons-vue'

type Article = Api.Article.ArticleInfo

const route = useRoute()
const keyword = ref<string>('')
const articleList = ref<Article[]>([])
const loading = ref(false)

const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
})

/** 获取文章列表 */
const getArticleData = async () => {
    loading.value = true
    try {
        const data = await ArticleService.getAllArticleWithTags({
            title: keyword.value,
            pageNum: page.pageNum,
            pageSize: page.pageSize,
        })
        articleList.value = data.list
        page.total = data.total
    } finally {
        loading.value = false
    }
}

/** 格式化时间 */
const formatTime = (time: string) => {
    if (!time) return '未知时间'
    const date = new Date(time)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

/** 点击文章 */
const handleArticleClick = (item: Article) => {
    // 跳转到文章详情
    console.log(item)
}

/** 页码变化 */
const handleCurrentChange = (val: number) => {
    page.pageNum = val
    getArticleData()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** 每页条数变化 */
const handleSizeChange = (val: number) => {
    page.pageSize = val
    page.pageNum = 1
    getArticleData()
}

watch(() => route.query.keyword,
    (newKeyword) => {
        keyword.value = (newKeyword as string) || ''
        page.pageNum = 1
        getArticleData()
    },
    { immediate: true }
)

onMounted(async () => {
    keyword.value = (route.query.keyword as string) || ''
    await getArticleData()
})
</script>

<style lang="scss" scoped>
.search-view {
    box-sizing: border-box;
    min-height: calc(100vh - 120px);
    padding: 40px 20px;
    display: flex;
    align-items: flex-start;
    justify-content: center;

    .search-result {
        width: 90%;
        max-width: 1000px;
        padding: 30px 35px;

        // 头部样式
        .search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            margin-bottom: 28px;
            border-bottom: 2px solid rgba(0, 0, 0, 0.05);

            .header-left {
                display: flex;
                align-items: center;
                gap: 12px;

                .search-icon {
                    font-size: 28px;
                    color: #667eea;
                }

                h3 {
                    font-size: 22px;
                    font-weight: 600;
                    color: #2d3748;
                    margin: 0;
                }

                .result-count {
                    font-size: 14px;
                    color: #a0aec0;
                    margin-left: 8px;
                    font-weight: 400;
                }
            }

        }

        // 文章列表
        .article-list {
            min-height: 300px;

            .article-card {
                margin-bottom: 16px;
                border-radius: 12px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;

                .article-content {
                    flex: 1;
                    min-width: 0;

                    .article-title {
                        font-size: 17px;
                        font-weight: 500;
                        color: #2d3748;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        line-height: 1.5;

                        .title-index {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            min-width: 24px;
                            height: 24px;
                            background: rgba(102, 126, 234, 0.1);
                            color: #667eea;
                            border-radius: 6px;
                            font-size: 12px;
                            font-weight: 600;
                            flex-shrink: 0;
                        }
                    }

                    .article-description {
                        font-size: 14px;
                        color: #718096;
                        margin-bottom: 12px;
                        display: flex;
                        align-items: flex-start;
                        gap: 6px;
                        line-height: 1.6;

                        .el-icon {
                            margin-top: 2px;
                            flex-shrink: 0;
                            font-size: 16px;
                            color: #a0aec0;
                        }
                    }

                    .article-meta {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 20px;
                        font-size: 13px;
                        color: #a0aec0;

                        .meta-item {
                            display: flex;
                            align-items: center;
                            gap: 4px;

                            .el-icon {
                                font-size: 14px;
                            }

                            &.tags {
                                gap: 4px;
                                flex-wrap: wrap;

                                .tag {
                                    padding: 2px 10px;
                                    background: rgba(102, 126, 234, 0.08);
                                    color: #667eea;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    font-weight: 500;
                                }

                                .tag-more {
                                    font-size: 12px;
                                    color: #a0aec0;
                                }
                            }
                        }
                    }
                }

                .article-arrow {
                    margin-left: 16px;
                    flex-shrink: 0;
                    color: #cbd5e0;
                    font-size: 20px;
                    transition: all 0.3s ease;
                }
            }
        }

        // 分页
        .pagination-wrapper {
            display: flex;
            justify-content: center;
            padding-top: 24px;
            margin-top: 20px;
            border-top: 1px solid rgba(0, 0, 0, 0.04);

            :deep(.el-pagination) {
                .el-pager li {
                    border-radius: 6px;
                    margin: 0 2px;

                    &.is-active {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                }

                .btn-prev,
                .btn-next {
                    border-radius: 6px;
                }

                .el-select .el-input__wrapper {
                    border-radius: 6px;
                }
            }
        }
    }
}

// 响应式适配
@media (max-width: 768px) {
    .search-view {
        padding: 20px 12px;

        .search-result {
            padding: 20px 16px;

            .search-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;

                .header-left {
                    flex-wrap: wrap;

                    h3 {
                        font-size: 18px;
                    }

                    .result-count {
                        font-size: 12px;
                    }
                }

                .header-right {
                    .keyword-tag {
                        font-size: 12px;
                        padding: 4px 12px;
                    }
                }
            }

            .article-list {
                .article-card {
                    :deep(.el-card__body) {
                        padding: 16px;
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .article-content {
                        .article-title {
                            font-size: 15px;
                        }

                        .article-description {
                            font-size: 13px;
                        }

                        .article-meta {
                            font-size: 12px;
                            gap: 12px;
                        }
                    }

                    .article-arrow {
                        display: none;
                    }
                }
            }

            .pagination-wrapper {
                :deep(.el-pagination) {
                    flex-wrap: wrap;
                    justify-content: center;
                    
                    .el-pager {
                        li {
                            min-width: 28px;
                            height: 28px;
                            line-height: 28px;
                        }
                    }
                }
            }
        }
    }
}

// 暗色模式适配（如果需要）
@media (prefers-color-scheme: dark) {
    .search-view {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);

        .search-result {
            background: rgba(26, 32, 44, 0.9);
            border-color: rgba(255, 255, 255, 0.05);

            .search-header {
                border-bottom-color: rgba(255, 255, 255, 0.05);

                .header-left {
                    h3 {
                        color: #e2e8f0;
                    }

                    .result-count {
                        color: #718096;
                    }
                }
            }

            .article-list {
                .article-card {
                    background: rgba(45, 55, 72, 0.6);
                    border-color: rgba(255, 255, 255, 0.04);

                    .article-content {
                        .article-title {
                            color: #e2e8f0;
                        }

                        .article-description {
                            color: #a0aec0;
                        }

                        .article-meta {
                            color: #718096;
                        }
                    }
                }
            }
        }
    }
}
</style>