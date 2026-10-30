<template>
    <div class="article">
        <ReadingProgress />
        <div ref="contentRef" class="article-content" @click="handleContentClick">
            <h1>{{ article?.title }}</h1>
            <div class="meta">
                <span class="author">作者：{{ article?.username }}</span>
                <time class="publish-time">时间：{{ article?.publishTime
                    }}</time>
                <time class="updated-time" v-if="article?.updatedTime">最后修改时间：{{
                    article?.updatedTime }}</time>
                <SharePoster :data="posterData" :disabled="!article?.title" />
            </div>
            <MdPreview class="md-preview" :id="editorId"
                :modelValue="article?.content"
                :theme="isDark ? 'dark' : 'light'"
                :codeTheme="isDark ? 'github' : 'atom'" />
            <ArticlePager :prev="prevArticle" :next="nextArticle" />
            <RelatedArticles :list="relatedArticles" :title="relatedTitle" />
        </div>
        <div class="article-anchor">
            <MdCatalog v-if="hasCatalog" :editorId="editorId"
                :scrollElement="scrollElement" :theme="isDark ? 'dark' : 'light'" />
            <div v-else class="empty-tip">暂无目录</div>
        </div>
        <!-- 正文图片点击放大 -->
        <ElImageViewer v-if="viewerVisible" :url-list="viewerList"
            :initial-index="viewerIndex" hide-on-click-modal teleported
            @close="viewerVisible = false" />
    </div>
</template>

<script setup lang='ts'>
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { ArticleService } from "@api/articleApi"
import { UserService } from "@api/userApi"
import { setPageMeta, SITE } from "@/utils/pageMeta"
import { useUserStore } from "@/store/modules/user"
import type { PosterData } from "@/utils/sharePoster"
import { useRoute } from 'vue-router'
import ReadingProgress from "./widget/ReadingProgress.vue"
import ArticlePager from "./widget/ArticlePager.vue"
import RelatedArticles from "./widget/RelatedArticles.vue"
import SharePoster from "./widget/SharePoster.vue"

type Article = Api.Article.ArticleDetailInfo
type ArchiveItem = Api.Article.ArticleArchiveInfo
const route = useRoute()
const article = ref<Article>()
const detailLoading = ref<boolean>(true)
const isDark = useDark()
const userStore = useUserStore()

// 滚动容器
const scrollElement = document.documentElement
const editorId = 'markdown-preview'

// 判断是否存在标题（可生成目录）
const hasCatalog = computed(() => {
    if (!article.value?.content) return false
    // 匹配 1~6 级 Markdown 标题
    return /^#{1,6}\s+.+/m.test(article.value.content)
})

// 请求文章数据
const getArticleDetail = async () => {
    const data = await ArticleService.getArticleById(Number(route.params.id))
    article.value = data
    detailLoading.value = false
    // 路由只给出了「文章详情」，这里用真实标题 / 简介 / 封面覆盖分享信息
    setPageMeta({
        title: data.title,
        description: data.description,
        image: data.cover,
        type: 'article',
        publishedTime: data.publishTime,
        modifiedTime: data.updatedTime,
    })
}

/**
 * 上下篇与相关推荐都基于归档接口（一次返回全部文章，本身就在归档页用着，不额外增加接口）
 * 统一按发布时间升序排列，索引前一位是更早的文章
 */
const archiveList = ref<ArchiveItem[]>([])

/** 兼容 "2026-10-01 10:00:00" 与 ISO 两种时间串 */
const timeOf = (publishTime?: string) => {
    const ms = new Date((publishTime || '').replace(' ', 'T')).getTime()
    return Number.isNaN(ms) ? 0 : ms
}

const getArchiveList = async () => {
    try {
        const list = await ArticleService.getArticleArchiveList()
        archiveList.value = [...list].sort((a, b) => timeOf(a.publishTime) - timeOf(b.publishTime))
    } catch {
        archiveList.value = []
    }
}

const tagsOf = (item: ArchiveItem) =>
    (item.tagNames || '').split(',').map((tag) => tag.trim()).filter(Boolean)

const currentIndex = computed(() =>
    archiveList.value.findIndex((item) => item.articleId === Number(route.params.id)))
const prevArticle = computed(() =>
    currentIndex.value > 0 ? archiveList.value[currentIndex.value - 1] : null)
const nextArticle = computed(() => {
    const index = currentIndex.value
    return index >= 0 && index < archiveList.value.length - 1
        ? archiveList.value[index + 1]
        : null
})

/** 相关文章：按标签重合数排序，重合相同再按时间倒序 */
const taggedArticles = computed<ArchiveItem[]>(() => {
    const current = archiveList.value[currentIndex.value]
    if (!current) return []
    const currentTags = new Set(tagsOf(current))
    return archiveList.value
        .filter((item) => item.articleId !== current.articleId)
        .map((item) => ({
            item,
            score: tagsOf(item).filter((tag) => currentTags.has(tag)).length,
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || timeOf(b.item.publishTime) - timeOf(a.item.publishTime))
        .slice(0, 3)
        .map(({ item }) => item)
})
/** 没有同标签文章时退回最新三篇，避免这一栏直接消失 */
const latestArticles = computed<ArchiveItem[]>(() =>
    archiveList.value
        .filter((item) => item.articleId !== Number(route.params.id))
        .slice(-3)
        .reverse())
const relatedArticles = computed(() =>
    taggedArticles.value.length ? taggedArticles.value : latestArticles.value)
const relatedTitle = computed(() => (taggedArticles.value.length ? '相关文章' : '推荐阅读'))

/** 海报数据：只组装，真正的绘制在分享海报组件里点开时进行 */
const posterData = computed<PosterData>(() => ({
    title: article.value?.title || '未命名文章',
    description: article.value?.description,
    cover: article.value?.cover,
    publishTime: article.value?.publishTime,
    author: article.value?.username || userStore.user.nickname,
    avatar: userStore.user.avatar,
    siteName: SITE.name,
    // 封面加载失败时用站点默认图兜底；写成相对路径，和页面同源，不牵扯跨域
    fallbackCover: '/og-share.webp',
    // 二维码固定指向正式域名，本地预览时扫出来也是线上地址
    url: `${SITE.url}/article-detail/${route.params.id}`,
}))
/** 作者头像：store 里没有就补拉一次（首页卡片与海报共用这份数据） */
const ensureAuthor = async () => {
    if (userStore.user.avatar || !article.value?.userId) return
    try {
        const info = await UserService.getUserInfo(article.value.userId)
        userStore.setUser(info)
    } catch {
        // 拿不到头像就用名字首字兜底，不影响海报生成
    }
}

// 正文图片点击放大
const contentRef = useTemplateRef<HTMLElement>('contentRef')
const viewerVisible = ref(false)
const viewerList = ref<string[]>([])
const viewerIndex = ref(0)
const handleContentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.tagName !== 'IMG' || !contentRef.value) return
    const images = Array.from(contentRef.value.querySelectorAll('img'))
    viewerList.value = images.map((img) => img.src)
    viewerIndex.value = Math.max(0, images.indexOf(target as HTMLImageElement))
    viewerVisible.value = true
}

onMounted(async () => {
    await Promise.all([getArticleDetail(), getArchiveList()])
    ensureAuthor()
})

// 从相关文章 / 上下篇跳到另一篇时命中同一个路由记录，组件不会重建，需要手动重载
watch(() => route.params.id, async (id) => {
    if (!id) return
    await getArticleDetail()
    ensureAuthor()
    window.scrollTo({ top: 0, behavior: 'auto' })
})
</script>

<style lang="scss" scoped>
.article {
    display: flex;
    gap: 50px;
    position: relative;
    justify-content: flex-end;
    width: 100%;
    box-sizing: border-box;

    .article-content {
        box-sizing: border-box;
        max-width: 900px;
        width: 100%;
        transition: all 0.3s ease;
        flex: none;
        overflow-x: hidden;

        &>h1 {
            font-weight: bold;
            margin-bottom: 20px;
        }

        .meta {
            display: flex;
            margin-bottom: 20px;
            gap: 5px;

            .author,
            .publish-time,
            .updated-time {
                margin-right: 20px;
                color: #8a919f;
            }

            @media screen and (max-width: $screen-medium) {
                flex-direction: column;
            }
        }

        .md-preview {
            background-color: transparent;

            :deep(.md-editor-preview-wrapper) {
                overflow-x: auto;
            }

            // 正文图片可点击放大
            :deep(.md-editor-preview img) {
                cursor: zoom-in;
            }
        }
    }

    .article-anchor {
        box-sizing: border-box;
        width: 200px;
        flex-shrink: 0;
        position: sticky;
        top: 105px;
        height: calc(100vh - 150px);
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    /* 暂无目录样式 */
    .empty-tip {
        color: #999;
        font-size: 14px;
    }

    @media screen and (max-width: $screen-larger) {
        .article-content {
            max-width: 100%;
        }

        .article-anchor {
            display: none;
        }
    }
}
</style>
