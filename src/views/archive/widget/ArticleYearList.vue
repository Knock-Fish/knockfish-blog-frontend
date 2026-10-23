<template>
    <div class="archive-timeline">
        <!-- 年份柱状图：点击可跳到对应年份 -->
        <div v-if="yearStats.length" class="chart">
            <button v-for="item in yearStats" :key="item.year" type="button"
                class="bar-wrap" :class="{ on: activeYear === item.year }"
                :title="`${item.year} 年 · ${item.count} 篇`"
                @click="scrollToYear(item.year)">
                <span class="bar-count">{{ item.count }}</span>
                <span class="bar" :style="{ height: barHeight(item.count) }"></span>
                <span class="bar-label">{{ item.year }}</span>
            </button>
        </div>

        <!-- 标签筛选：常驻面板，默认只露一行常用标签 -->
        <TagFilter v-if="!loading && tagStats.length" v-model="selectedTags"
            :tags="tagStats" :hits="filteredArticles.length" />

        <ElSkeleton v-if="loading" class="list-skeleton" :rows="6" animated />

        <div v-else-if="!groups.length" class="empty">
            <i-mdi-file-document-outline />
            <p>{{ selectedTags.length ? '没有符合筛选的文章' : '暂无文章' }}</p>
            <button v-if="selectedTags.length" type="button" class="empty-reset"
                @click="selectedTags = []">清空筛选</button>
        </div>

        <div v-else class="layout">
            <!-- 年份导航 -->
            <nav class="year-nav">
                <button v-for="group in groups" :key="group.year" type="button"
                    class="nav-item" :class="{ on: activeYear === group.year }"
                    @click="scrollToYear(group.year)">
                    {{ group.year }}<span class="n">{{ group.count }}</span>
                </button>
            </nav>

            <!-- 归档正文 -->
            <main class="year-list">
                <section v-for="group in groups" :key="group.year"
                    :id="`year-${group.year}`" :data-year="group.year"
                    class="year-section"
                    :class="{ on: activeYear === group.year, collapsed: isCollapsed(group.year) }">
                    <header class="year-head">
                        <div class="year-num">{{ group.year }}</div>
                        <div class="year-meta">
                            <b>{{ group.count }} 篇文章</b>
                            <span>{{ group.months.map(m => `${m.month} 月`).join(' · ') }}</span>
                        </div>
                        <button type="button" class="year-toggle"
                            :aria-expanded="!isCollapsed(group.year)"
                            @click="toggleYear(group.year)">
                            <i-mdi-chevron-down />
                        </button>
                    </header>

                    <div v-show="!isCollapsed(group.year)" class="year-body">
                        <div v-for="month in group.months" :key="month.month"
                            class="month">
                            <div class="month-label">{{ month.month }} 月</div>
                            <div class="posts">
                                <!-- 行内色条 / 标题 / 标签都跟随该行首个标签的配色 -->
                                <RouterLink v-for="article in month.items"
                                    :key="article.articleId" class="post"
                                    :style="{ '--tc': tagsOf(article)[0]?.color ?? DEFAULT_TAG_COLOR }"
                                    :to="`/article-detail/${article.articleId}`">
                                    <span class="post-day">{{ dayOf(article.publishTime)
                                        }}</span>
                                    <span class="post-title">{{ article.title }}</span>
                                    <span class="post-tags">
                                        <!-- 行内标签可直接点选筛选（阻止跳转） -->
                                        <span v-for="tag in tagsOf(article)"
                                            :key="tag.name" class="tag"
                                            :class="{ on: selectedTags.includes(tag.name) }"
                                            :style="{ '--tc': tag.color }"
                                            @click.stop.prevent="toggleRowTag(tag.name)">{{ tag.name }}</span>
                                    </span>
                                    <span v-if="article.views > 0" class="post-read">{{
                                        article.views }} 阅读</span>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>

        <!-- 回到顶部 -->
        <button type="button" class="totop" :class="{ show: showTop }"
            aria-label="回到顶部" @click="scrollTop">
            <i-mdi-arrow-up />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ArticleService } from '@api/articleApi'
import TagFilter from './TagFilter.vue'

type Article = Api.Article.ArticleArchiveInfo

/** 标签颜色由后端随文章返回（完整 CSS 颜色）；万一缺字段就回落到站点主色 */
const DEFAULT_TAG_COLOR = 'rgb(253, 71, 129)'

/** 后端把标签名与颜色各自用逗号拼接（tagNames / tagColors 按位对应），这里按索引配成 [{ name, color }] */
const tagsOf = (article: Article) => {
    const names = (article.tagNames || '').split(',').filter(Boolean)
    const colors = (article.tagColors || '').split(',')
    return names.map((name, index) => ({ name, color: colors[index]?.trim() || DEFAULT_TAG_COLOR }))
}

interface MonthGroup {
    month: number
    items: Article[]
}

interface YearGroup {
    year: number
    count: number
    months: MonthGroup[]
}

const loading = ref<boolean>(true)
const articles = ref<Article[]>([])
const collapsedYears = ref<number[]>([])
const activeYear = ref<number | null>(null)
const selectedTags = ref<string[]>([])

const { y } = useWindowScroll()
const prefersReduced = usePreferredReducedMotion()

/** 日期只取 "YYYY-MM-DD" 前 10 位，避免各浏览器 new Date 解析差异 */
const dateOf = (publishTime: string) => publishTime.slice(0, 10).split('-')
const dayOf = (publishTime: string) => dateOf(publishTime)[2]

/** 从归档数据聚合标签与篇数（按篇数倒序），颜色取后端返回的那份 */
const tagStats = computed(() => {
    const counter = new Map<string, { count: number, color: string }>()
    for (const article of articles.value) {
        for (const tag of tagsOf(article)) {
            const prev = counter.get(tag.name)
            counter.set(tag.name, { count: (prev?.count ?? 0) + 1, color: tag.color })
        }
    }
    return [...counter]
        .map(([name, { count, color }]) => ({ name, count, color }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

/** 多选标签按「满足任一」过滤；未选标签时就是全部文章 */
const filteredArticles = computed(() => {
    if (!selectedTags.value.length) return articles.value
    return articles.value.filter(article =>
        tagsOf(article).some(tag => selectedTags.value.includes(tag.name)))
})

// 列表行里的标签也可点选，和面板是同一份选中状态
const toggleRowTag = (tag: string) => {
    const list = selectedTags.value
    selectedTags.value = list.includes(tag)
        ? list.filter(item => item !== tag)
        : [...list, tag]
}

/** 按年 → 月分组，年份与月份均倒序 */
const groups = computed<YearGroup[]>(() => {
    const yearMap = new Map<number, Map<number, Article[]>>()

    for (const article of filteredArticles.value) {
        const [year, month] = dateOf(article.publishTime).map(Number)
        const monthMap = yearMap.get(year) ?? new Map<number, Article[]>()
        const items = monthMap.get(month)
        items ? items.push(article) : monthMap.set(month, [article])
        yearMap.set(year, monthMap)
    }

    return [...yearMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([year, monthMap]) => {
            const months = [...monthMap.entries()]
                .sort((a, b) => b[0] - a[0])
                .map(([month, items]) => ({ month, items }))
            return { year, months, count: months.reduce((sum, item) => sum + item.items.length, 0) }
        })
})

/** 柱状图：年份正序，柱高按当年文章数占比（跟随筛选结果） */
const yearStats = computed(() => [...groups.value].reverse()
    .map(group => ({ year: group.year, count: group.count })))

const maxCount = computed(() => Math.max(1, ...groups.value.map(group => group.count)))

const barHeight = (count: number) => `${Math.max(Math.round(count / maxCount.value * 100), 5)}%`

const isCollapsed = (year: number) => collapsedYears.value.includes(year)

const toggleYear = (year: number) => {
    const index = collapsedYears.value.indexOf(year)
    index > -1 ? collapsedYears.value.splice(index, 1) : collapsedYears.value.push(year)
}

const scrollBehavior = (): ScrollBehavior => (prefersReduced.value === 'reduce' ? 'auto' : 'smooth')

const scrollToYear = (year: number) => {
    document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: scrollBehavior() })

const showTop = computed(() => y.value > 700)

/** 滚动高亮：取顶部越过 150px 的最后一个年份区块 */
const syncActiveYear = () => {
    let current = groups.value[0]?.year ?? null
    for (const section of document.querySelectorAll<HTMLElement>('.year-section')) {
        if (section.getBoundingClientRect().top <= 150) current = Number(section.dataset.year)
    }
    activeYear.value = current
}

const fetchArticles = async () => {
    loading.value = true
    try {
        articles.value = await ArticleService.getArticleArchiveList()
    } catch (error) {
        console.error('获取归档文章失败:', error)
        articles.value = []
    } finally {
        loading.value = false
    }
}

// 数据到位与滚动时同步高亮；flush: post 保证在 DOM 更新后测量
watch([y, groups], syncActiveYear, { flush: 'post' })

onMounted(() => {
    fetchArticles()
})

defineOptions({ name: 'ArticleYearList' })
</script>

<style lang="scss" scoped>
.archive-timeline {
    // 明暗两套 token（主色跟随站点 #fd4781）
    --accent: 253, 71, 129;
    --t-text: #17181c;
    --t-dim: #5f6470;
    --t-faint: #9aa0ac;
    --t-surface: #ffffff;
    --t-line: rgba(0, 0, 0, 0.08);
    --t-hover: rgba(0, 0, 0, 0.032);
    --t-stroke: rgba(0, 0, 0, 0.18);

    box-sizing: border-box;
    width: 100%;
    padding: 20px 20px 60px;
}

html.dark .archive-timeline {
    --t-text: #e7eaf3;
    --t-dim: #8a93a8;
    --t-faint: #5c6478;
    --t-surface: #171a24;
    --t-line: rgba(255, 255, 255, 0.09);
    --t-hover: rgba(255, 255, 255, 0.04);
    --t-stroke: rgba(255, 255, 255, 0.24);
}

/* ---------- 年份柱状图 ---------- */
.chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 76px;
    margin-bottom: 20px;
    padding-bottom: 22px;
}

.bar-wrap {
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;

    &:hover,
    &.on {
        .bar {
            background: linear-gradient(to top, rgba(var(--accent), 0.45), rgba(var(--accent), 0.95));
            box-shadow: 0 0 18px -2px rgba(var(--accent), 0.55);
        }

        .bar-label {
            color: rgb(var(--accent));
        }

        .bar-count {
            opacity: 1;
            top: -16px;
            color: var(--t-text);
        }
    }

    &:focus-visible {
        outline: 2px solid rgb(var(--accent));
        outline-offset: 2px;
    }
}

.bar {
    width: 100%;
    max-width: 46px;
    min-height: 4px;
    border-radius: 5px 5px 3px 3px;
    background: linear-gradient(to top, rgba(var(--accent), 0.16), rgba(var(--accent), 0.42));
    transition: 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bar-label {
    position: absolute;
    bottom: -22px;
    font-size: 11px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    transition: color 0.25s;
}

.bar-count {
    position: absolute;
    top: -6px;
    font-size: 10.5px;
    color: var(--t-dim);
    font-variant-numeric: tabular-nums;
    opacity: 0;
    transition: 0.25s;
}

.list-skeleton {
    padding: 24px 4px;
}

.empty {
    padding: 80px 20px;
    text-align: center;
    color: var(--t-dim);
    font-size: 14px;

    .svg-icon {
        display: block;
        margin: 0 auto 12px;
        font-size: 34px;
        opacity: 0.45;
    }

    .empty-reset {
        margin-top: 14px;
        padding: 6px 14px;
        border: 1px solid var(--t-line);
        border-radius: 8px;
        background: none;
        color: var(--t-dim);
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            color: rgb(var(--accent));
            border-color: rgba(var(--accent), 0.45);
        }
    }
}

/* ---------- 布局 ---------- */
.layout {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    gap: 40px;
    padding-top: 30px;
    align-items: start;
}

/* ---------- 年份导航 ---------- */
.year-nav {
    position: sticky;
    top: 90px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 14px;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 1px;
        background: var(--t-line);
    }
}

.nav-item {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 7px;
    padding: 7px 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
    text-align: left;
    cursor: pointer;
    transition: color 0.25s, transform 0.25s;

    .n {
        font-size: 10.5px;
        font-weight: 500;
        opacity: 0.6;
    }

    &::before {
        content: '';
        position: absolute;
        left: -14px;
        top: 50%;
        width: 1px;
        height: 0;
        background: rgb(var(--accent));
        box-shadow: 0 0 10px rgba(var(--accent), 0.8);
        transform: translateY(-50%);
        transition: height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    &:hover {
        color: var(--t-text);
    }

    &.on {
        color: rgb(var(--accent));
        transform: translateX(3px);

        &::before {
            height: 22px;
        }
    }

    &:focus-visible {
        outline: 2px solid rgb(var(--accent));
        outline-offset: 2px;
    }
}

/* ---------- 年份区块 ---------- */
.year-section {
    margin-bottom: 56px;
    scroll-margin-top: 96px;

    &.collapsed .year-toggle .svg-icon {
        transform: rotate(-90deg);
    }
}

.year-head {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 26px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--t-line);
}

.year-num {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.045em;
    line-height: 1;
    color: transparent;
    -webkit-text-stroke: 1.2px var(--t-stroke);
    font-variant-numeric: tabular-nums;
    user-select: none;
    transition: color 0.45s, -webkit-text-stroke 0.45s, text-shadow 0.45s;

    .year-section.on & {
        color: rgb(var(--accent));
        -webkit-text-stroke: 1.2px transparent;
        text-shadow: 0 0 34px rgba(var(--accent), 0.45);
    }
}

.year-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 4px;

    b {
        font-size: 13px;
        font-weight: 600;
        color: var(--t-text);
    }

    span {
        font-size: 11.5px;
        color: var(--t-faint);
        font-variant-numeric: tabular-nums;
    }
}

.year-toggle {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    margin-left: auto;
    border: 1px solid var(--t-line);
    border-radius: 8px;
    background: var(--t-surface);
    color: var(--t-dim);
    cursor: pointer;
    transition: 0.22s;

    .svg-icon {
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    &:hover {
        color: var(--t-text);
        border-color: rgba(var(--accent), 0.45);
    }
}

/* ---------- 月份与文章行 ---------- */
.month {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 14px;
    margin-bottom: 24px;

    &:last-child {
        margin-bottom: 0;
    }
}

.month-label {
    position: sticky;
    top: 90px;
    align-self: start;
    padding-top: 12px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
}

.posts {
    display: flex;
    flex-direction: column;
}

.post {
    position: relative;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 14px;
    padding: 11px 14px 11px 12px;
    border-radius: 10px;
    color: inherit;
    transition: background 0.2s;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 2px;
        height: 62%;
        border-radius: 2px;
        background: var(--tc);
        transform: translateY(-50%) scaleY(0);
        transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    &:hover,
    &:focus-visible {
        background: var(--t-hover);

        &::before {
            transform: translateY(-50%) scaleY(1);
        }

        .post-day,
        .post-title {
            color: var(--tc);
        }
    }

    &:focus-visible {
        outline: 2px solid var(--tc);
        outline-offset: -2px;
    }
}

.post-day {
    font-size: 13px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
}

.post-title {
    font-size: 14.5px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--t-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;
}

.post-tags {
    display: flex;
    gap: 5px;
}

.tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 99px;
    border: 1px solid color-mix(in srgb, var(--tc) 18%, transparent);
    background: color-mix(in srgb, var(--tc) 9%, transparent);
    font-size: 10.5px;
    color: var(--tc);
    white-space: nowrap;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
        border-color: color-mix(in srgb, var(--tc) 45%, transparent);
    }

    // 与筛选面板共用同一份选中状态
    &.on {
        border-color: color-mix(in srgb, var(--tc) 50%, transparent);
        background: color-mix(in srgb, var(--tc) 20%, transparent);
    }
}

.post-read {
    font-size: 11px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

/* ---------- 回到顶部 ---------- */
.totop {
    position: fixed;
    right: 26px;
    bottom: 26px;
    z-index: 70;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border: 1px solid var(--t-line);
    border-radius: 12px;
    background: color-mix(in srgb, var(--t-surface) 90%, transparent);
    backdrop-filter: blur(10px);
    color: var(--t-dim);
    cursor: pointer;
    opacity: 0;
    transform: translateY(14px);
    pointer-events: none;
    transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

    &.show {
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }

    &:hover {
        color: rgb(var(--accent));
        border-color: rgba(var(--accent), 0.5);
        box-shadow: 0 0 24px -6px rgba(var(--accent), 0.6);
    }
}

/* ---------- 响应式 ---------- */
@media screen and (max-width: 900px) {
    .archive-timeline {
        padding: 16px 14px 40px;
    }

    .layout {
        grid-template-columns: 1fr;
        gap: 18px;
        padding-top: 22px;
    }

    // 年份导航转为吸顶横滑的胶囊条
    .year-nav {
        position: sticky;
        top: 60px;
        z-index: 40;
        flex-direction: row;
        gap: 6px;
        margin: 0 -14px;
        padding: 10px 14px;
        overflow-x: auto;
        background: color-mix(in srgb, var(--t-surface) 92%, transparent);
        backdrop-filter: blur(12px);
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }

        &::before {
            display: none;
        }
    }

    .nav-item {
        flex-shrink: 0;
        padding: 6px 11px;
        border: 1px solid var(--t-line);
        border-radius: 8px;
        background: var(--t-surface);
        font-size: 12.5px;

        &::before {
            display: none;
        }

        &.on {
            background: rgba(var(--accent), 0.12);
            border-color: rgba(var(--accent), 0.45);
            transform: none;
        }
    }
}

@media screen and (max-width: 640px) {
    .chart {
        gap: 5px;
        height: 64px;
    }

    .bar-label {
        font-size: 10px;
    }

    .year-num {
        font-size: 34px;
    }

    .year-head {
        gap: 12px;
        margin-bottom: 20px;
    }

    .month {
        grid-template-columns: 1fr;
        gap: 0;
        margin-bottom: 16px;
    }

    .month-label {
        position: static;
        padding: 0 0 8px 12px;
        font-size: 11px;
    }

    // 窄屏隐去标签，保证标题有足够的横向空间
    .post {
        grid-template-columns: 30px minmax(0, 1fr) auto;
        gap: 10px;
        padding: 10px 8px;
    }

    .post-tags {
        display: none;
    }

    .totop {
        right: 16px;
        bottom: 16px;
    }
}

// 尊重系统的「减弱动效」设置
@media (prefers-reduced-motion: reduce) {

    .post,
    .nav-item,
    .bar,
    .totop,
    .year-toggle .svg-icon {
        transition: none;
    }
}
</style>
