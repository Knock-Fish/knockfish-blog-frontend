<template>
    <div class="archive-layout">
        <!-- 左侧菜单 -->
        <ArchiveMenu style="position: sticky; top: 60px; left: 0;" v-show="!showMobileMenu" :active-menu="activeMenu"
            :total-count="totalArticles"
            @update:active-menu="handleMenuChange" />

        <!-- 主内容区 -->
        <main class="main-content">
            <div class="content-card">
                <!-- 文章年份列表 -->
                <ArticleYearList v-if="activeMenu === 'year-list'"
                    :articles="mockArticles" :selected-year="selectedYear"
                    :active-year="activeYear"
                    @update:active-year="handleYearChange" />

                <!-- 代码片段页面 -->
                <CodeSnippets v-if="activeMenu === 'code-snippets'" />

                <!-- 标签归档页面 -->
                <TagArchive v-if="activeMenu === 'archive-tags'" />

            </div>
        </main>

        <!-- 右侧锚点导航 -->
        <AnchorNav style="position: sticky; top: 60px; left: 0;" :years="yearList" :active-year="activeYear"
            @update:active-year="handleYearChange" />
    </div>
</template>

<script setup lang="ts">
import ArchiveMenu from './widget/ArchiveMenu.vue'
import AnchorNav from './widget/AnchorNav.vue'
import ArticleYearList from './widget/ArticleYearList.vue'
import CodeSnippets from './widget/CodeSnippets.vue'
import TagArchive from './widget/TagArchive.vue'

interface ArticleTag {
    tagId: number
    tagName: string
    color: string
}

interface ArticleInfo {
    articleId: number
    title: string
    publishTime: string
    tags: ArticleTag[]
}

const showMobileMenu = ref(false)
const activeMenu = ref('year-list')
const selectedYear = ref<number | ''>('')
const activeYear = ref('2026')

const mockArticles: ArticleInfo[] = [
    { articleId: 1, title: 'Vue3 组合式 API 深度解析', publishTime: '2024-01-15 10:30:00', tags: [{ tagId: 1, tagName: 'Vue', color: '#42b883' }, { tagId: 2, tagName: 'JavaScript', color: '#F6D45A' }] },
    { articleId: 2, title: 'TypeScript 高级类型技巧', publishTime: '2024-01-20 14:00:00', tags: [{ tagId: 3, tagName: 'TypeScript', color: '#3178C6' }] },
    { articleId: 3, title: 'React Hooks 最佳实践', publishTime: '2024-02-05 09:15:00', tags: [{ tagId: 4, tagName: 'React', color: '#61DAFB' }, { tagId: 2, tagName: 'JavaScript', color: '#F6D45A' }] },
    { articleId: 4, title: 'Node.js 性能优化指南', publishTime: '2024-02-18 16:45:00', tags: [{ tagId: 5, tagName: 'Node.js', color: '#339933' }] },
    { articleId: 5, title: 'Tailwind CSS 实战项目', publishTime: '2024-03-02 11:20:00', tags: [{ tagId: 6, tagName: 'CSS', color: '#264DE4' }, { tagId: 7, tagName: 'Tailwind', color: '#06B6D4' }] },
    { articleId: 6, title: 'Docker 容器化部署', publishTime: '2024-03-15 13:30:00', tags: [{ tagId: 8, tagName: 'Docker', color: '#2496ED' }, { tagId: 9, tagName: 'DevOps', color: '#EC4899' }] },
    { articleId: 7, title: 'Git 工作流最佳实践', publishTime: '2024-04-01 10:00:00', tags: [{ tagId: 10, tagName: 'Git', color: '#F05032' }] },
    { articleId: 8, title: 'Redis 缓存策略详解', publishTime: '2024-04-12 09:45:00', tags: [{ tagId: 11, tagName: 'Redis', color: '#DC382D' }, { tagId: 12, tagName: '数据库', color: '#47848F' }] },
    { articleId: 9, title: 'Webpack 5 配置指南', publishTime: '2025-01-08 14:20:00', tags: [{ tagId: 13, tagName: 'Webpack', color: '#8DD6F9' }, { tagId: 14, tagName: '构建工具', color: '#F59E0B' }] },
    { articleId: 10, title: 'Vite 性能优化实践', publishTime: '2025-01-22 11:00:00', tags: [{ tagId: 15, tagName: 'Vite', color: '#646CFF' }, { tagId: 14, tagName: '构建工具', color: '#F59E0B' }] },
    { articleId: 11, title: 'GraphQL API 设计', publishTime: '2025-02-10 15:30:00', tags: [{ tagId: 16, tagName: 'GraphQL', color: '#E10098' }, { tagId: 17, tagName: 'API', color: '#10B981' }] },
    { articleId: 12, title: '微服务架构入门', publishTime: '2025-02-28 09:00:00', tags: [{ tagId: 18, tagName: '微服务', color: '#8B5CF6' }, { tagId: 9, tagName: 'DevOps', color: '#EC4899' }] },
    { articleId: 13, title: 'WebRTC 实时通信', publishTime: '2025-03-15 16:00:00', tags: [{ tagId: 19, tagName: 'WebRTC', color: '#34D399' }, { tagId: 20, tagName: '实时', color: '#FBBF24' }] },
    { articleId: 14, title: 'PWA 渐进式应用', publishTime: '2025-04-05 10:30:00', tags: [{ tagId: 21, tagName: 'PWA', color: '#5C6784' }, { tagId: 22, tagName: '移动端', color: '#06B6D4' }] },
    { articleId: 15, title: 'Electron 桌面应用', publishTime: '2025-05-12 14:15:00', tags: [{ tagId: 23, tagName: 'Electron', color: '#47848F' }, { tagId: 22, tagName: '移动端', color: '#06B6D4' }] },
    { articleId: 16, title: 'Three.js 3D 可视化', publishTime: '2026-01-08 11:45:00', tags: [{ tagId: 24, tagName: 'Three.js', color: '#000000' }, { tagId: 25, tagName: '3D', color: '#8B5CF6' }] },
    { articleId: 17, title: 'WebGL 入门教程', publishTime: '2026-01-25 09:20:00', tags: [{ tagId: 26, tagName: 'WebGL', color: '#555555' }, { tagId: 25, tagName: '3D', color: '#8B5CF6' }] },
    { articleId: 18, title: 'Next.js 14 新特性', publishTime: '2026-02-10 15:00:00', tags: [{ tagId: 27, tagName: 'Next.js', color: '#000000' }, { tagId: 4, tagName: 'React', color: '#61DAFB' }] },
    { articleId: 19, title: 'Nuxt.js 全栈开发', publishTime: '2026-02-28 10:30:00', tags: [{ tagId: 28, tagName: 'Nuxt', color: '#00C58E' }, { tagId: 1, tagName: 'Vue', color: '#42b883' }] },
    { articleId: 20, title: 'Rust WebAssembly', publishTime: '2026-03-15 14:00:00', tags: [{ tagId: 29, tagName: 'Rust', color: '#DEA584' }, { tagId: 30, tagName: 'WebAssembly', color: '#654FF0' }] },
    { articleId: 21, title: 'AI 大模型应用开发', publishTime: '2026-04-08 11:00:00', tags: [{ tagId: 31, tagName: 'AI', color: '#FF6B6B' }, { tagId: 32, tagName: '机器学习', color: '#4ECDC4' }] },
    { articleId: 22, title: 'LLM 应用实践', publishTime: '2026-04-20 16:30:00', tags: [{ tagId: 31, tagName: 'AI', color: '#FF6B6B' }, { tagId: 33, tagName: 'NLP', color: '#9B59B6' }] },
    { articleId: 23, title: '向量数据库入门', publishTime: '2026-05-05 09:15:00', tags: [{ tagId: 34, tagName: '向量数据库', color: '#3498DB' }, { tagId: 12, tagName: '数据库', color: '#47848F' }] },
    { articleId: 24, title: 'LangChain 开发指南', publishTime: '2026-05-18 14:45:00', tags: [{ tagId: 35, tagName: 'LangChain', color: '#10B981' }, { tagId: 31, tagName: 'AI', color: '#FF6B6B' }] },
    { articleId: 25, title: 'Agent 智能体开发', publishTime: '2026-06-01 10:00:00', tags: [{ tagId: 36, tagName: 'Agent', color: '#F59E0B' }, { tagId: 31, tagName: 'AI', color: '#FF6B6B' }] },
]

const totalArticles = computed(() => mockArticles.length)

const yearList = computed(() => {
    const years = new Set<string>()
    mockArticles.forEach(article => {
        const year = article.publishTime.split(' ')[0].split('-')[0]
        years.add(year)
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
})


const handleMenuChange = (menuKey: string) => {
    activeMenu.value = menuKey
    showMobileMenu.value = false
}

const handleYearChange = (year: string) => {
    activeYear.value = year
}

defineOptions({ name: 'Archive' })
</script>

<style lang="scss" scoped>
.archive-layout {
    display: flex;
    min-height: calc(100vh - 60px);
}

.main-content {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
}

.content-card {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;

    :deep(.el-card__body) {
        padding: 0;

    }

    :deep(.el-card__header) {
        padding: 16px 20px;
    }
}

@media screen and (max-width: 767px) {
    .main-content {
        padding: 12px;
    }
}

@media screen and (max-width: 1024px) {
    .content-card {
        max-width: 100%;
    }
}
</style>