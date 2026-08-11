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
              <div
                v-for="article in monthData.articles"
                :key="article.articleId"
                class="article-card"
                @click="goToArticle(article.articleId)">
                <div class="article-content">
                  <div class="article-date">
                    <span class="date-day">{{ formatDay(article.publishTime) }}</span>
                    <span class="date-month">{{ formatMonth(article.publishTime)
                      }}</span>
                  </div>

                  <div class="article-info">
                    <h3 class="article-title">{{ article.title }}</h3>
                    <p class="article-desc">{{ article.description }}</p>

                    <div class="article-meta">
                      <el-tag size="small" type="primary" class="article-tag"
                        v-for="tag in parseTags(article.tagNames)"
                        :key="tag"
                        @click.stop="handleTagClick(tag)">
                        {{ tag }}
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
import { ArticleService } from '@/api/articleApi'

interface BlogArticle {
  articleId: number
  title: string
  description: string
  publishTime: string
  tagNames: string
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
const articles = ref<BlogArticle[]>([])

const yearList = computed(() => {
  const years = new Set(articles.value.map(a => new Date(a.publishTime).getFullYear()))
  return Array.from(years).sort((a, b) => b - a)
})

const groupedArticles = computed<YearGroup[]>(() => {
  const yearMap = new Map<number, Map<number, BlogArticle[]>>()

  articles.value.forEach(article => {
    const date = new Date(article.publishTime)
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
        .map(([month, monthArticles]) => ({
          month,
          articles: monthArticles.sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
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

const handleTagClick = (tag: string) => {
  emit('tag-click', tag)
}

const goToArticle = (id: number) => {
  router.push(`/article-detail/${id}`)
}

const formatDay = (dateStr: string): string => {
  return new Date(dateStr).getDate().toString().padStart(2, '0')
}

const formatMonth = (dateStr: string): string => {
  return `${new Date(dateStr).getMonth() + 1}月`
}

const parseTags = (tagNames: string): string[] => {
  if (!tagNames) return []
  return tagNames.split(',').filter(tag => tag.trim())
}

const initExpandedYears = () => {
  const currentYear = new Date().getFullYear()
  const years = yearList.value
  if (years.length > 0) {
    expandedYears.value = years.includes(currentYear) ? [currentYear] : [years[0]]
  }
}

const fetchArticles = async () => {
  try {
    const data = await ArticleService.getArticleArchiveList()
    articles.value = data
  } catch (error) {
    console.error('获取归档文章失败:', error)
    articles.value = []
  } finally {
    initExpandedYears()
  }
}

onMounted(() => {
  fetchArticles()
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
  border-radius: 8px;

  &:hover {
    transform: translateX(4px);
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