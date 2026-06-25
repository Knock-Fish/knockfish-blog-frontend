<template>
  <div class="article-list">
    <div v-for="yearData in groupedArticles" :key="yearData.year"
      class="year-group">
      <div class="year-header" @click="toggleYear(yearData.year)">
        <el-icon class="year-arrow"
          :class="{ expanded: expandedYears.includes(yearData.year) }">
          <ArrowRight />
        </el-icon>
        <span class="year-title">{{ yearData.year }} 年</span>
        <span class="year-count">({{ yearData.articles.length }} 篇)</span>
      </div>

      <ElCollapseTransition>
        <div v-show="expandedYears.includes(yearData.year)"
          class="year-content">
          <div v-for="monthData in yearData.months" :key="monthData.month"
            class="month-group">
            <div class="month-header">
              <span class="month-title">{{ monthData.month }} 月</span>
              <div class="month-line"></div>
            </div>

            <div class="month-articles">
              <div v-for="article in monthData.articles" :key="article.id"
                class="article-card" shadow="hover"
                @click="goToArticle(article.id)">
                <div class="article-content">
                  <div class="article-date">
                    <span class="date-day">{{ formatDay(article.date) }}</span>
                    <span class="date-month">{{ formatMonth(article.date)
                      }}</span>
                  </div>

                  <div class="article-info">
                    <h3 class="article-title">{{ article.title }}</h3>
                    <p class="article-desc">{{ article.desc }}</p>

                    <div class="article-meta">
                      <el-tag size="small" type="primary" class="article-tag"
                        @click.stop="handleTagClick(article.category)">
                        {{ article.category }}
                      </el-tag>

                      <span class="article-views">
                        <el-icon>
                          <View />
                        </el-icon>
                        {{ article.views }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElCollapseTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { View, ArrowRight } from '@element-plus/icons-vue'

interface BlogArticle {
  id: number
  title: string
  desc: string
  date: string
  category: string
  views: number
}

interface MonthGroup {
  month: number
  articles: BlogArticle[]
}

interface YearGroup {
  year: number
  articles: BlogArticle[]
  months: MonthGroup[]
}

const emit = defineEmits<{
  (e: 'tag-click', category: string): void
}>()

const router = useRouter()
const expandedYears = ref<number[]>([])

const mockArticles: BlogArticle[] = [
  { id: 1, title: 'Vue3 Composition API 深入浅出', desc: '详解Vue3组合式API的使用方法和最佳实践，包括ref、reactive、computed等核心API。', date: '2024-03-15', category: '前端', views: 1256 },
  { id: 2, title: 'TypeScript 高级类型技巧', desc: '探索TypeScript中的条件类型、映射类型、模板字面量类型等高级特性。', date: '2024-03-20', category: '前端', views: 892 },
  { id: 3, title: 'Node.js 性能优化实战', desc: '从内存管理、缓存策略、集群部署等方面全面提升Node.js应用性能。', date: '2024-02-10', category: '后端', views: 1534 },
  { id: 4, title: 'Docker 容器化部署指南', desc: '详细讲解Dockerfile编写、镜像构建、私有仓库搭建和容器编排。', date: '2024-02-28', category: 'DevOps', views: 2103 },
  { id: 5, title: 'React 18 新特性解析', desc: '深入理解Concurrent Mode、Suspense、Server Components等新特性。', date: '2024-01-18', category: '前端', views: 967 },
  { id: 6, title: 'GraphQL 与 REST 深度对比', desc: '从设计理念、性能、安全性等维度分析两种API风格的优劣。', date: '2024-01-25', category: '后端', views: 756 },
  { id: 7, title: 'CSS Grid 布局精通指南', desc: '网格布局系统的核心概念、语法和实际项目应用技巧。', date: '2023-12-05', category: '前端', views: 1823 },
  { id: 8, title: '微服务架构设计模式', desc: '介绍微服务拆分策略、服务通信机制、熔断降级等设计模式。', date: '2023-11-20', category: '架构', views: 2341 },
  { id: 9, title: 'PostgreSQL 高级查询优化', desc: '索引设计、查询计划分析、CTE递归查询等高级用法。', date: '2023-11-15', category: '数据库', views: 1456 },
  { id: 10, title: 'Git 工作流最佳实践', desc: 'GitFlow、trunk-based development等工作流的选择与落地。', date: '2023-10-12', category: '工具', views: 987 },
  { id: 11, title: 'Webpack5 模块联邦详解', desc: '实现多项目代码共享、运行时依赖加载的终极解决方案。', date: '2023-10-28', category: '前端', views: 1567 },
  { id: 12, title: 'Redis 缓存策略深度剖析', desc: '缓存失效策略、内存淘汰机制、分布式锁实现。', date: '2023-09-18', category: '后端', views: 1987 },
  { id: 13, title: 'Vite 3.0 构建原理探究', desc: '基于ESM的极速构建工具核心原理和插件机制。', date: '2023-09-05', category: '前端', views: 1234 },
  { id: 14, title: 'Linux 内核性能调优', desc: '系统参数优化、CPU/内存/IO性能分析工具使用。', date: '2023-08-22', category: '运维', views: 1654 },
  { id: 15, title: 'WebSocket 实时通信实战', desc: '从聊天室到实时协作系统，构建高性能实时应用。', date: '2023-08-10', category: '前端', views: 2134 },
]

const yearList = computed(() => {
  const years = new Set(mockArticles.map(a => new Date(a.date).getFullYear()))
  return Array.from(years).sort((a, b) => b - a)
})

const groupedArticles = computed<YearGroup[]>(() => {
  const yearMap = new Map<number, Map<number, BlogArticle[]>>()

  mockArticles.forEach(article => {
    const date = new Date(article.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map())
    }
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) {
      monthMap.set(month, [])
    }
    monthMap.get(month)!.push(article)
  })

  return Array.from(yearMap.entries())
    .map(([year, monthMap]) => ({
      year,
      articles: Array.from(monthMap.values()).flat(),
      months: Array.from(monthMap.entries())
        .map(([month, articles]) => ({
          month,
          articles: articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }))
        .sort((a, b) => b.month - a.month)
    }))
    .sort((a, b) => b.year - a.year)
})

const toggleYear = (year: number) => {
  const index = expandedYears.value.indexOf(year)
  if (index > -1) {
    expandedYears.value.splice(index, 1)
  } else {
    expandedYears.value.push(year)
  }
}

const handleTagClick = (category: string) => {
  emit('tag-click', category)
}

const goToArticle = (id: number) => {
  router.push(`/blog/${id}`)
}

const formatDay = (dateStr: string): string => {
  return new Date(dateStr).getDate().toString().padStart(2, '0')
}

const formatMonth = (dateStr: string): string => {
  return `${new Date(dateStr).getMonth() + 1}月`
}

const initExpandedYears = () => {
  const currentYear = new Date().getFullYear()
  const years = yearList.value
  if (years.length > 0) {
    expandedYears.value = years.includes(currentYear) ? [currentYear] : [years[0]]
  }
}

onMounted(() => {
  initExpandedYears()
})

defineOptions({ name: 'ArticleYearList' })
</script>

<style scoped lang="scss">
$primary-color: #1677ff;
$text-primary: #303133;
$text-secondary: #606266;
$text-placeholder: #c0c4cc;
$border-color: #ebeef5;
$dark-card-bg: #2d2d2d;

.article-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: transparent;
}

.year-group {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: none;
  transition: box-shadow 0.3s;


  .dark-mode & {
    background: transparent;
  }
}

.year-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;

}

.year-arrow {
  font-size: 14px;
  color: $text-secondary;
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(90deg);
  }
}

.year-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
}

.year-count {
  font-size: 14px;
  color: $text-secondary;
}

.year-content {
  padding: 0 14px 14px;
}

.month-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.month-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.month-title {
  font-size: 15px;
  font-weight: 500;
  color: $primary-color;
  white-space: nowrap;
}

.month-line {
  flex: 1;
  height: 1px;
  background-color: $border-color;
}

.month-articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  // border: 1px solid $border-color;
  border-radius: 8px;
  // backdrop-filter: blur(10px);
  // box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateX(4px);
    // box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.article-content {
  display: flex;
  gap: 20px;
  box-sizing: border-box;


  @media (max-width: 576px) {
    flex-direction: column;
    gap: 12px;
  }
}

.article-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 8px;
  background: linear-gradient(135deg, #ffa4a4, rgb(255, 172, 172));
  border-radius: 8px;
  color: #fff;
}

.date-day {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.9;
}

.article-info {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;

  .article-card:hover & {
    color: $primary-color;
  }
}

.article-desc {
  font-size: 14px;
  color: $text-secondary;
  margin: 0 0 12px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.article-tag {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.article-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: $text-placeholder;

  .el-icon {
    font-size: 14px;
  }
}

// 暗色模式适配
.dark-mode {
  .article-card {
    background: rgba(45, 45, 45, 0.6) !important;
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
  }

  .month-line {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .year-header:hover {
    background-color: rgba($primary-color, 0.1);
  }

  .article-title {
    color: #e5e7eb;
  }

  .article-desc {
    color: #9ca3af;
  }
}
</style>