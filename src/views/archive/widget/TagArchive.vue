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
                <button class="clear-btn" @click="selectedTag = null; filteredArticles = []">
                    <ElIcon>
                        <SvgIcon icon="mdi:close" />
                    </ElIcon>
                </button>
            </div>
            
            <div class="article-list">
                <div 
                    v-for="article in filteredArticles" 
                    :key="article.articleId"
                    class="article-item"
                    @click="viewArticle(article)"
                >
                    <div class="article-title">{{ article.title }}</div>
                    <div class="article-description">{{ article.description }}</div>
                    <div class="article-meta">
                        <span class="article-date">{{ article.publishTime }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TagService } from "@/api/tagApi"
type Tag = Api.Tag.TagInfo
type TagArticle = Api.Tag.TagArticleInfo
const router = useRouter()
const selectedTag = ref<Tag | null>(null)
const tags = ref<Tag[]>([])
const filteredArticles = ref<TagArticle[]>([])

const getTags = async () => {
    const data = await TagService.getTagInfo({
        pageSize: 50,
        pageNum: 1
    })
    tags.value = data.list
}

const selectTag = async (tag: Tag) => {
    selectedTag.value = tag
    const data = await TagService.getArticlesByTag(tag.tagId)
    filteredArticles.value = data
}

const viewArticle = (article: TagArticle) => {
    router.push({
        name: 'ArticleDetail',
        params: {
            id: article.articleId
        }
    })
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
    gap: 16px;
}

.article-item {
    cursor: pointer;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color-100);
    transition: all 0.3s ease;
    
    &:hover {
        padding-left: 8px;
        border-color: var(--border-color-200);
    }
    
    &:last-child {
        border-bottom: none;
    }
}

.article-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-color-100);
    margin-bottom: 6px;
}

.article-description {
    font-size: 13px;
    color: var(--text-color-400);
    line-height: 1.6;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-meta {
    display: flex;
    align-items: center;
}

.article-date {
    font-size: 12px;
    color: var(--text-color-300);
}
</style>
