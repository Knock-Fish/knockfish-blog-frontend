<template>
  <!-- 骨架屏 -->
  <ElSkeleton v-if="loading" animated class="article-detail skeleton-wrap">
    <template #template>
      <ElSkeletonItem variant="h1" class="skeleton-title" />
      <div class="meta skeleton-meta">
        <ElSkeletonItem variant="text" class="skeleton-meta-item" />
        <ElSkeletonItem variant="text" class="skeleton-meta-item" />
        <ElSkeletonItem variant="text" class="skeleton-meta-item" />
      </div>
      <div class="markdown-body skeleton-content">
        <ElSkeletonItem v-for="i in 10" :key="i" variant="text" class="skeleton-line" />
      </div>
    </template>
  </ElSkeleton>

  <!-- 真实内容 -->
  <div v-else class="article-detail">
    <h1>{{ article?.title }}</h1>
    <div class="meta">
      <span class="author">作者：{{ article?.username }}</span>
      <time class="publish-time">时间：{{ article?.publishTime }}</time>
      <time class="updated-time" v-if="article?.updatedTime">最后修改时间：{{ article?.updatedTime }}</time>
    </div>
    <div class="markdown-body" v-html="processedHtml" v-enhance-code></div>
  </div>
</template>

<script setup lang='ts'>
import '@/assets/styles/markdown.scss'
import '@/assets/styles/one-dark-pro.scss'
import "prismjs/themes/prism-tomorrow.min.css"
import Prism from 'prismjs'
import { computed, watch, nextTick } from 'vue'

type Article = Api.Article.ArticleDetailInfo

interface Props {
  article?: Article
  loading?: boolean
}
const props = defineProps<Props>()

// 定义事件：向外抛出解析好的标题目录
const emit = defineEmits<{
  updateHeadings: [list: Array<{ id: string; text: string; level: number }>]
}>()

// 处理 HTML，统一给 h1~h6 追加 id（唯一 ID 生成逻辑）
const processedHtml = computed(() => {
  if (!props.article?.content) return ''
  let html = props.article.content
  const headTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  headTags.forEach(tag => {
    const reg = new RegExp(`<${tag}([^>]*)>(.*?)</${tag}>`, 'gi')
    html = html.replace(reg, (match, attrs, content) => {
      // 已有 id 直接返回
      if (/id\s*=/.test(attrs)) return match

      // 生成安全 ID
      const pureText = content.replace(/<[^>]*>/g, '')
      let id = pureText
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()

      // 空文本则生成随机ID
      if (!id) {
        id = `heading-${Math.random().toString(36).slice(2)}`
      }
      return `<${tag} id="${id}"${attrs}>${content}</${tag}>`
    })
  })
  return html
})

// 监听处理后的 HTML，解析标题并向上抛给父组件
watch(processedHtml, (html) => {
  if (!html) {
    emit('updateHeadings', [])
    return
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

  const headingList = Array.from(nodes).map(el => ({
    id: el.id,
    text: el.textContent?.trim() || '',
    level: Number(el.tagName.slice(1))
  }))

  emit('updateHeadings', headingList)
}, { immediate: true })

// 代码高亮
const highlightCode = () => {
  nextTick(() => Prism.highlightAll())
}

onMounted(highlightCode)
onUpdated(highlightCode)
</script>

<style lang="scss" scoped>
.article-detail {
  &>h1 {
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .meta {
    margin-bottom: 20px;
    .author,
    .publish-time,
    .updated-time {
      margin-right: 20px;
      color: #8a919f;
    }
  }
}

/* 骨架屏样式 */
.skeleton-wrap {
  width: 100%;
  box-sizing: border-box;

  .skeleton-title {
    width: 60%;
    height: 36px !important;
    margin: 0 auto 20px;
  }

  .skeleton-meta {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;

    .skeleton-meta-item {
      width: 130px;
      height: 18px !important;
    }
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .skeleton-line {
      width: 100%;
      height: 16px !important;
      &:nth-child(2n) {
        width: 92%;
      }
      &:nth-child(3n) {
        width: 85%;
      }
    }
  }
}
</style>