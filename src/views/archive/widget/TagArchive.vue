<template>
    <div class="tag-archive">
        <div class="tag-cloud">
            <ElTag 
                v-for="tag in tags" 
                :key="tag.tagId"
                :color="tag.color"
                @click="selectTag(tag)"
                :class="{ active: selectedTag?.tagId === tag.tagId }"
            >
                {{ tag.tagName }}({{tag.articleCount}})
            </ElTag>
        </div>
        
        <div v-if="selectedTag" class="tag-articles">
            <div class="section-header">
                <h3 class="section-title">{{ selectedTag.tagName }} 相关文章</h3>
                <button class="clear-btn" @click="selectedTag = null">
                    <ElIcon>
                        <SvgIcon icon="mdi:close" />
                    </ElIcon>
                </button>
            </div>
            
            <div class="article-list">
                <ElCard 
                    v-for="article in filteredArticles" 
                    :key="article.id"
                    class="article-card"
                    hover
                    @click="viewArticle(article)"
                >
                    <div class="article-title">{{ article.title }}</div>
                    <div class="article-meta">
                        <span class="article-date">{{ article.date }}</span>
                    </div>
                </ElCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TagService } from "@/api/tagApi"
type Tag = Api.Tag.TagInfo

interface Article {
    id: number
    title: string
    date: string
    tags: number[]
}

const selectedTag = ref<Tag | null>(null)

const tags = ref<Tag[]>([])
const getTags = async () => {
    const data = await TagService.getTagInfo({
        pageSize: 50,
        pageNum: 1
    })
    tags.value = data.list
}
const articles: Article[] = [
    { id: 1, title: 'Vue3 组合式 API 深度解析', date: '2024-01-15', tags: [1, 4] },
    { id: 2, title: 'TypeScript 高级类型技巧', date: '2024-01-20', tags: [3] },
    { id: 3, title: 'React Hooks 最佳实践', date: '2024-02-05', tags: [2, 4] },
    { id: 4, title: 'Node.js 性能优化指南', date: '2024-02-18', tags: [5] },
    { id: 5, title: 'Tailwind CSS 实战项目', date: '2024-03-02', tags: [6] },
    { id: 6, title: 'Docker 容器化部署', date: '2024-03-15', tags: [7, 8] },
    { id: 7, title: 'Git 工作流最佳实践', date: '2024-04-01', tags: [9] },
    { id: 8, title: 'Redis 缓存策略详解', date: '2024-04-12', tags: [10, 11] },
    { id: 9, title: 'Webpack 5 配置指南', date: '2025-01-08', tags: [12] },
    { id: 10, title: 'Vite 性能优化实践', date: '2025-01-22', tags: [13] },
    { id: 11, title: 'GraphQL API 设计', date: '2025-02-10', tags: [14] },
    { id: 12, title: '微服务架构入门', date: '2025-02-28', tags: [15, 8] },
    { id: 13, title: 'AI 大模型应用开发', date: '2026-04-08', tags: [16, 17] },
    { id: 14, title: 'Python 数据处理实战', date: '2026-05-05', tags: [18] },
]

const filteredArticles = computed(() => {
    if (!selectedTag.value) return []
    return articles.filter(article => article.tags.includes(selectedTag.value!.tagId))
})

const selectTag = (tag: Tag) => {
    selectedTag.value = tag
}

const viewArticle = (article: Article) => {
    console.log('View article:', article)
}
onMounted(async () => {
    await getTags()
})

defineOptions({ name: 'TagArchive' })
</script>

<style lang="scss" scoped>
.tag-archive {
    padding: 20px;
}

.tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
}

:deep(.el-tag) {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &.active {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
}

.tag-count {
    margin-left: 4px;
    opacity: 0.7;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color-100);
}

.clear-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color-400);
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--hover-bg-color-100);
        color: var(--text-color-100);
    }
}

.article-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.article-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateX(4px);
    }
    
    :deep(.el-card__body) {
        padding: 14px 16px;
    }
}

.article-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-color-100);
    margin-bottom: 6px;
}

.article-meta {
    display: flex;
    align-items: center;
}

.article-date {
    font-size: 12px;
    color: var(--text-color-400);
}
</style>