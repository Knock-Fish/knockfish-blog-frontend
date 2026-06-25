<template>
    <div class="code-snippets-wrapper">
        <div class="code-snippets">
            <div class="snippets-grid">
                <div class="snippets">
                    <div class="category-tabs">
                        <div v-for="category in categoryList"
                            :key="category.codeCategoryId" class="category-tab"
                            :class="{ active: selectedCategoryId === category.codeCategoryId }"
                            @click="handleCategoryChange(category.codeCategoryId)">
                            <span>{{ category.codeCategoryName }}</span>
                        </div>
                    </div>
                    <!-- 为每个卡片添加 id，用于锚点定位 -->
                    <div v-for="snippet in snippetList"
                         :key="snippet.codeSnippetId"
                         :id="`snippet-${snippet.codeSnippetId}`"
                         class="snippet-wrapper">
                        <CodeSnippetCard :snippet="snippet" />
                    </div>
                </div>
                
                <!-- 锚点目录 -->
                <div class="snippet-anchor">
                    <div v-for="snippet in snippetList" 
                         :key="snippet.codeSnippetId"
                         class="anchor-item"
                         @click="scrollToSnippet(snippet.codeSnippetId)">
                        {{ snippet.title }}
                    </div>
                </div>
            </div>

            <div v-if="snippetList.length === 0" class="empty-tip">
                暂无代码片段
            </div>
        </div>

        <div v-if="!loading && page.total > page.pageSize" class="pagination">
            <ElPagination background layout="prev, pager, next" :total="page.total"
                v-model:page-size="page.pageSize"
                v-model:current-page="page.pageNum"
                @update:current-page="handleCurrentPageChange"
                @update:page-size="handlePageSizeChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { CodeCategoryService } from "@api/codeCategoryApi"
import { CodeSnippetService } from "@api/codeSnippetApi"
import CodeSnippetCard from './CodeSnippetCard.vue'

const loading = ref<boolean>(true)
const categoryList = ref<Api.CodeCategory.CodeCategoryMenuInfo[]>([])
const selectedCategoryId = ref<number | null>(null)
const snippetList = ref<Api.CodeSnippet.CodeSnippetInfo[]>([])

const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
})

const getCategoryList = async () => {
    const data = await CodeCategoryService.getMenuList()
    categoryList.value = data
    if (data.length > 0) {
        selectedCategoryId.value = data[0].codeCategoryId
    }
}

const getSnippetList = async () => {
    if (!selectedCategoryId.value) return
    loading.value = true
    try {
        const data = await CodeSnippetService.getCodeSnippetListByCategoryId(selectedCategoryId.value, {
            pageNum: page.pageNum,
            pageSize: page.pageSize,
        })
        snippetList.value = data.list || []
        page.total = data.total || 0
    } finally {
        loading.value = false
    }
}

// 滚动到指定的代码片段
const scrollToSnippet = (snippetId: number) => {
    const element = document.getElementById(`snippet-${snippetId}`)
    if (element) {
        // 考虑固定头部偏移，如果有固定导航栏，调整这个值
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })
    }
}

const handleCategoryChange = (categoryId: number) => {
    selectedCategoryId.value = categoryId
    page.pageNum = 1
    getSnippetList().then(() => {
        // 切换分类后滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

const handleCurrentPageChange = (newPage: number) => {
    page.pageNum = newPage
    getSnippetList().then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

const handlePageSizeChange = (newSize: number) => {
    page.pageSize = newSize
    page.pageNum = 1
    getSnippetList().then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

onMounted(async () => {
    await getCategoryList()
    await getSnippetList()
})
</script>

<style lang="scss" scoped>
.code-snippets-wrapper {
    width: 100%;

    .code-snippets {
        width: 100%;
        padding: 20px;
        box-sizing: border-box;

        .snippets-grid {
            width: 100%;
            display: flex;
            gap: 20px;
            box-sizing: border-box;
            align-items: flex-start;

            @media screen and (max-width: 1450px) {
                .snippet-anchor {
                    display: none;
                }
            }

            .snippets {
                box-sizing: border-box;
                width: 100%;
                max-width: 850px;
                transition: all 0.3s ease;
                flex: none;
                overflow-x: hidden;

                .snippet-wrapper {
                    scroll-margin-top: 80px;
                }

                .category-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);

                    .category-tab {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 10px 20px;
                        background: var(--bg-color-200);
                        border: 1px solid var(--border-color);
                        border-radius: 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--text-color-200);

                        &:hover {
                            background: var(--bg-color-300);
                            border-color: var(--primary-color, #3498db);
                            transform: translateY(-2px);
                        }

                        &.active {
                            background: var(--primary-color, #3498db);
                            color: #fff;
                            border-color: var(--primary-color, #3498db);
                            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
                        }
                    }
                }
            }

            .snippet-anchor {
                position: sticky;
                top: 90px;
                flex-shrink: 0;
                align-self: flex-start;
                width: 200px;
                overflow-y: auto;
                overflow-x: hidden;
                scrollbar-width: none;
                max-height: calc(100vh - 120px);

                .anchor-item {
                    padding: 10px 12px;
                    font-size: 14px;
                    color: #4b5563;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;

                    &:hover {
                        background: var(--bg-color-200);
                        color: var(--primary-color, #3498db);
                    }

                    &:active {
                        transform: scale(0.98);
                    }
                }
            }
        }

        .empty-tip {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: var(--text-color-400);
            font-size: 14px;
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 24px;
    }
}
</style>