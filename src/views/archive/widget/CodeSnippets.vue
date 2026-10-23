<template>
    <div class="code-library">
        <ElSkeleton v-if="loading" class="list-skeleton" :rows="8" animated />

        <div v-else-if="loadFailed" class="empty">
            <i-mdi-file-alert-outline />
            <p>代码片段加载失败</p>
            <button type="button" class="reset" @click="loadAll">重新加载</button>
        </div>

        <template v-else>
            <!-- 搜索 -->
            <label class="search">
                <i-mdi-magnify />
                <input ref="searchRef" v-model="keyword" type="text"
                    placeholder="搜索标题或代码内容…" />
                <button v-if="keyword" type="button" class="search-clear"
                    aria-label="清空" @click.prevent="keyword = ''">×</button>
                <span v-else class="search-kbd">/</span>
            </label>

            <!-- 已选筛选 -->
            <div v-if="activeCategory || keyword.trim()" class="active-bar">
                <span class="lbl">筛选</span>
                <button v-if="activeCategory" type="button" class="pill"
                    :style="{ '--pc': categoryColor(activeCategory.codeCategoryName) }"
                    @click="activeCategoryId = null">
                    {{ activeCategory.codeCategoryName }}<span class="x">×</span>
                </button>
                <button v-if="keyword.trim()" type="button"
                    class="pill pill-search" @click="keyword = ''">
                    搜索：{{ keyword.trim() }}<span class="x">×</span>
                </button>
                <button type="button" class="reset" @click="resetFilter">清空</button>
            </div>

            <div class="layout">
                <main class="main">
                    <!-- 工具条 -->
                    <div class="toolbar">
                        <span class="result-count">共 <b>{{ filtered.length }}</b> 个片段</span>
                        <button type="button" class="tool-btn" @click="toggleAll">
                            <i-mdi-arrow-expand-vertical />
                            {{ allOpen ? '全部收起' : '全部展开' }}
                        </button>
                        <button type="button" class="tool-btn" @click="latest = !latest">
                            <i-mdi-sort />
                            {{ latest ? '最新' : '最早' }}
                        </button>
                    </div>

                    <div v-if="!groups.length" class="empty">
                        <i-mdi-file-search-outline />
                        <p>没有找到匹配的片段</p>
                        <span class="hint">试试清空筛选，或换个关键词</span>
                        <button type="button" class="reset" @click="resetFilter">清空筛选</button>
                    </div>

                    <!-- 总览：按分类分组，行内可展开代码 -->
                    <div v-else class="overview">
                        <section v-for="group in groups" :key="group.id" class="group"
                            :style="{ '--gc': group.color }">
                            <header class="group-head">
                                <span class="group-dot"></span>
                                <span class="group-name">{{ group.name }}</span>
                                <span class="group-count">{{ group.items.length }}</span>
                                <span class="group-rule"></span>
                            </header>

                            <div class="rows">
                                <div v-for="snippet in group.items"
                                    :key="snippet.codeSnippetId" class="row"
                                    :class="{ open: isOpen(snippet.codeSnippetId) }"
                                    :style="{ '--lc': group.color }">
                                    <div class="row-main"
                                        @click="toggleRow(snippet.codeSnippetId)">
                                        <span class="row-dot"></span>
                                        <span class="row-title"
                                            v-html="highlight(snippet.title)"></span>
                                        <span class="row-lines">{{ lineCount(snippet.codeContent)
                                            }} 行</span>
                                        <span class="row-end">
                                            <span class="row-date">{{
                                                dateOf(snippet.createTime) }}</span>
                                            <button type="button" class="icon-btn"
                                                :class="{ done: copiedId === snippet.codeSnippetId }"
                                                :title="copiedId === snippet.codeSnippetId ? '已复制' : '复制代码'"
                                                @click.stop="copyCode(snippet)">
                                                <i-mdi-check
                                                    v-if="copiedId === snippet.codeSnippetId" />
                                                <i-mdi-content-copy v-else />
                                            </button>
                                        </span>
                                    </div>

                                    <div v-show="isOpen(snippet.codeSnippetId)"
                                        class="row-body">
                                        <MdPreview
                                            :id="`snippet-${snippet.codeSnippetId}`"
                                            :modelValue="snippet.codeContent"
                                            :theme="isDark ? 'dark' : 'light'"
                                            :codeTheme="isDark ? 'github' : 'atom'"
                                            :codeFoldable="false" />
                                        <p class="code-foot">
                                            {{ lineCount(snippet.codeContent) }} 行 ·
                                            {{ dateOf(snippet.createTime) }} ·
                                            {{ group.name }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <!-- 分类：放在右侧 -->
                <aside class="sidebar">
                    <button type="button" class="side-all"
                        :class="{ on: !activeCategoryId }" @click="activeCategoryId = null">
                        全部片段<span class="n">{{ snippets.length }}</span>
                    </button>

                    <div class="side-block">
                        <h3 class="side-head">分类</h3>
                        <ul class="side-list">
                            <li v-for="category in categories"
                                :key="category.codeCategoryId">
                                <button type="button" class="side-item"
                                    :class="{ on: activeCategoryId === category.codeCategoryId }"
                                    :style="{ '--lc': categoryColor(category.codeCategoryName) }"
                                    @click="selectCategory(category.codeCategoryId)">
                                    <span class="side-dot"></span>
                                    {{ category.codeCategoryName }}
                                    <span class="n">{{
                                        countOf(category.codeCategoryId) }}</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </template>

        <!-- 回到顶部 -->
        <button type="button" class="totop" :class="{ show: showTop }"
            aria-label="回到顶部" @click="scrollTop">
            <i-mdi-arrow-up />
        </button>
    </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { CodeCategoryService } from '@api/codeCategoryApi'
import { CodeSnippetService } from '@api/codeSnippetApi'

type Category = Api.CodeCategory.CodeCategoryMenuInfo
type Snippet = Api.CodeSnippet.CodeSnippetInfo

/** 分页响应的形状（api.d.ts 的 PaginatingParams 不是泛型，取不到 list 的类型） */
interface SnippetPage {
    list?: Snippet[]
}

interface Group {
    id: number
    name: string
    color: string
    items: Snippet[]
}

/** 设计稿的分类配色（GitHub linguist 色），未知分类按名称哈希取其中一色 */
const CATEGORY_COLORS: Record<string, string> = {
    Java: '176, 114, 25', JavaScript: '241, 224, 90', TypeScript: '49, 120, 198',
    CSS: '86, 61, 124', HTML: '227, 76, 38', Shell: '137, 224, 81',
    Python: '53, 114, 165', Go: '0, 173, 216', Rust: '222, 165, 132', SQL: '227, 140, 0',
    Springboot: '110, 195, 88', React: '88, 196, 221', Vue: '66, 184, 131',
    Nodejs: '83, 158, 66', Docker: '36, 150, 237', Git: '240, 80, 51',
    Vite: '189, 52, 254', Nextjs: '139, 148, 158', Tailwind: '56, 189, 248',
}
const FALLBACK_COLORS = Object.values(CATEGORY_COLORS)

/** 单分类一次拉取的上限：片段总量不大，一次拉全才能支持跨分类搜索与计数 */
const PAGE_SIZE = 100
const COPY_TIP_DURATION = 1600

const isDark = useDark()
const { y } = useWindowScroll()
const searchRef = useTemplateRef<HTMLInputElement>('searchRef')

const loading = ref<boolean>(true)
const loadFailed = ref<boolean>(false)
const categories = ref<Category[]>([])
const snippets = ref<Snippet[]>([])
const activeCategoryId = ref<number | null>(null)
const keyword = ref<string>('')
const latest = ref<boolean>(true)
const openIds = ref<number[]>([])
const allOpen = ref<boolean>(false)
const copiedId = ref<number | null>(null)

const categoryColor = (name: string) => {
    if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name]
    let hash = 0
    for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

const activeCategory = computed(() =>
    categories.value.find(category => category.codeCategoryId === activeCategoryId.value) ?? null)

const countOf = (categoryId: number) =>
    snippets.value.filter(snippet => snippet.codeCategoryId === categoryId).length

/** 抽出围栏里的代码（没有围栏就按原文），用于复制与行数统计 */
const codeOf = (content: string) => {
    const blocks = [...content.matchAll(/```[^\n]*\n([\s\S]*?)```/g)]
    return blocks.length ? blocks.map(block => block[1].trimEnd()).join('\n\n') : content.trim()
}

const lineCount = (content: string) => codeOf(content).split('\n').length

/** createTime 形如 "2026-07-05 15:41:24"，只取日期部分 */
const dateOf = (createTime?: string) => createTime?.slice(0, 10) ?? ''

const escapeHtml = (text: string) => text.replace(/[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] as string))

/** 高亮命中的关键词（只标第一处），先转义再拼 mark */
const highlight = (text: string) => {
    const kw = keyword.value.trim()
    const index = kw ? text.toLowerCase().indexOf(kw.toLowerCase()) : -1
    if (index < 0) return escapeHtml(text)
    return escapeHtml(text.slice(0, index))
        + `<mark>${escapeHtml(text.slice(index, index + kw.length))}</mark>`
        + escapeHtml(text.slice(index + kw.length))
}

const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    const list = snippets.value.filter(snippet => {
        if (activeCategoryId.value && snippet.codeCategoryId !== activeCategoryId.value) return false
        if (!kw) return true
        return `${snippet.title} ${snippet.codeContent}`.toLowerCase().includes(kw)
    })
    return list.sort((a, b) => {
        const left = a.createTime ?? ''
        const right = b.createTime ?? ''
        return latest.value ? right.localeCompare(left) : left.localeCompare(right)
    })
})

/** 按分类分组，分组顺序跟随分类菜单顺序（筛选后为空的分类不出现） */
const groups = computed<Group[]>(() => {
    const byCategory = new Map<number, Snippet[]>()
    for (const snippet of filtered.value) {
        const items = byCategory.get(snippet.codeCategoryId) ?? []
        items.push(snippet)
        byCategory.set(snippet.codeCategoryId, items)
    }
    return categories.value
        .filter(category => byCategory.has(category.codeCategoryId))
        .map(category => ({
            id: category.codeCategoryId,
            name: category.codeCategoryName,
            color: categoryColor(category.codeCategoryName),
            items: byCategory.get(category.codeCategoryId)!,
        }))
})

const isOpen = (id: number) => openIds.value.includes(id)

const toggleRow = (id: number) => {
    const index = openIds.value.indexOf(id)
    index > -1 ? openIds.value.splice(index, 1) : openIds.value.push(id)
    allOpen.value = false
}

const toggleAll = () => {
    allOpen.value = !allOpen.value
    openIds.value = allOpen.value ? filtered.value.map(snippet => snippet.codeSnippetId) : []
}

const selectCategory = (categoryId: number) => {
    activeCategoryId.value = activeCategoryId.value === categoryId ? null : categoryId
}

const resetFilter = () => {
    activeCategoryId.value = null
    keyword.value = ''
}

const copyCode = async (snippet: Snippet) => {
    await navigator.clipboard.writeText(codeOf(snippet.codeContent))
    copiedId.value = snippet.codeSnippetId
    window.setTimeout(() => {
        if (copiedId.value === snippet.codeSnippetId) copiedId.value = null
    }, COPY_TIP_DURATION)
}

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const showTop = computed(() => y.value > 500)

/** 分类与片段一起拉：分类计数与跨分类搜索都依赖全量片段 */
const loadAll = async () => {
    loading.value = true
    loadFailed.value = false
    try {
        categories.value = await CodeCategoryService.getMenuList()
        const pages: SnippetPage[] = await Promise.all(categories.value.map(category =>
            CodeSnippetService.getCodeSnippetListByCategoryId(category.codeCategoryId, {
                pageNum: 1,
                pageSize: PAGE_SIZE,
            })))
        snippets.value = pages.flatMap(page => page.list ?? [])
    } catch (error) {
        console.error('获取代码片段失败:', error)
        loadFailed.value = true
    } finally {
        loading.value = false
    }
}

/** 「/」聚焦搜索框 */
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault()
        searchRef.value?.focus()
    }
}

onMounted(() => {
    loadAll()
    document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
})

defineOptions({ name: 'CodeSnippets' })
</script>

<style lang="scss" scoped>
.code-library {
    // 明暗两套 token（主色跟随站点 #fd4781，分类色见 CATEGORY_COLORS）
    --accent: 253, 71, 129;
    --t-text: #17181c;
    --t-dim: #5f6470;
    --t-faint: #9aa0ac;
    --t-surface: #ffffff;
    --t-line: rgba(0, 0, 0, 0.08);
    --t-hover: rgba(0, 0, 0, 0.032);
    // 分类色在浅底上需要压暗才够对比；暗色下用原色
    --ink-mix: #0b0d12;
    --ink-shade: 62%;

    box-sizing: border-box;
    width: 100%;
    padding: 20px 20px 60px;
}

html.dark .code-library {
    --t-text: #e7eaf3;
    --t-dim: #8a93a8;
    --t-faint: #5c6478;
    --t-surface: #171a24;
    --t-line: rgba(255, 255, 255, 0.09);
    --t-hover: rgba(255, 255, 255, 0.04);
    --ink-mix: #ffffff;
    --ink-shade: 100%;
}

/* ---------- 搜索 ---------- */
.search {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 520px;
    margin-bottom: 16px;

    >.svg-icon {
        position: absolute;
        left: 14px;
        font-size: 15px;
        color: var(--t-dim);
        pointer-events: none;
    }

    input {
        width: 100%;
        padding: 10px 78px 10px 42px;
        border: 1px solid var(--t-line);
        border-radius: 10px;
        background: var(--t-hover);
        color: var(--t-text);
        font-family: inherit;
        font-size: 14px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;

        &::placeholder {
            color: var(--t-faint);
        }

        &:focus {
            border-color: rgba(var(--accent), 0.5);
            box-shadow: 0 0 0 3px rgba(var(--accent), 0.12);
        }
    }
}

.search-clear {
    position: absolute;
    right: 44px;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--t-line);
    color: var(--t-dim);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;

    &:hover {
        color: var(--t-text);
    }
}

.search-kbd {
    position: absolute;
    right: 12px;
    padding: 2px 7px;
    border: 1px solid var(--t-line);
    border-radius: 5px;
    background: var(--t-surface);
    color: var(--t-faint);
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 10.5px;
    pointer-events: none;
}

/* ---------- 已选筛选 ---------- */
.active-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 10px 14px;
    border: 1px solid var(--t-line);
    border-radius: 10px;
    background: var(--t-hover);
    font-size: 12px;
    color: var(--t-dim);

    .lbl {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--t-faint);
    }

    .reset {
        margin-left: auto;
        padding: 4px 10px;
        border: 1px solid var(--t-line);
        border-radius: 6px;
        background: transparent;
        color: var(--t-dim);
        font-family: inherit;
        font-size: 11.5px;
        cursor: pointer;
        transition: 0.15s;

        &:hover {
            color: rgb(var(--accent));
            border-color: rgba(var(--accent), 0.45);
        }
    }
}

.pill {
    --pc: 139, 148, 158;

    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border: 1px solid rgba(var(--pc), 0.4);
    border-radius: 99px;
    background: rgba(var(--pc), 0.14);
    color: color-mix(in srgb, rgb(var(--pc)) var(--ink-shade), var(--ink-mix));
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s;

    &:hover {
        background: rgba(var(--pc), 0.26);
    }

    .x {
        font-size: 13px;
        line-height: 1;
        opacity: 0.65;
    }
}

.pill-search {
    --pc: var(--accent);
}

/* ---------- 布局：正文在左、分类在右 ---------- */
.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 40px;
    align-items: start;
}

.main {
    min-width: 0;
}

/* ---------- 工具条 ---------- */
.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 0;
    border-top: 1px solid var(--t-line);
    border-bottom: 1px solid var(--t-line);
}

.result-count {
    font-size: 12.5px;
    color: var(--t-dim);

    b {
        font-weight: 650;
        color: var(--t-text);
    }
}

.tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px;
    border: 1px solid var(--t-line);
    border-radius: 8px;
    background: var(--t-surface);
    color: var(--t-dim);
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: 0.15s;

    .svg-icon {
        font-size: 14px;
    }

    &:hover {
        color: var(--t-text);
        border-color: rgba(var(--accent), 0.4);
    }

    &:last-child {
        margin-left: auto;
    }
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

    .hint {
        display: block;
        margin-top: 4px;
        font-size: 12.5px;
        color: var(--t-faint);
    }

    .reset {
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

/* ---------- 总览 ---------- */
.overview {
    display: flex;
    flex-direction: column;
    gap: 26px;
}

.group {
    --gc: 139, 148, 158;

    display: flex;
    flex-direction: column;
    gap: 1px;
}

.group-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px 10px;
}

.group-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(var(--gc));
    box-shadow: 0 0 10px rgba(var(--gc), 0.7);
}

.group-name {
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    color: color-mix(in srgb, rgb(var(--gc)) var(--ink-shade), var(--ink-mix));
}

.group-count {
    padding: 1px 7px;
    border: 1px solid rgba(var(--gc), 0.2);
    border-radius: 99px;
    background: rgba(var(--gc), 0.1);
    color: var(--t-faint);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
}

.group-rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(var(--gc), 0.32), rgba(var(--gc), 0.02));
}

.rows {
    display: flex;
    flex-direction: column;
}

.row {
    --lc: 139, 148, 158;

    position: relative;
    border-radius: 8px;
    transition: background 0.15s;

    &:hover,
    &.open {
        background: var(--t-hover);
    }
}

.row-main {
    display: grid;
    grid-template-columns: 14px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 14px;
    padding: 9px 14px 9px 16px;
    cursor: pointer;
    user-select: none;
}

.row-dot {
    justify-self: center;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgb(var(--lc));
}

.row-title {
    overflow: hidden;
    font-size: 13.5px;
    font-weight: 550;
    line-height: 1.45;
    color: var(--t-text);
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s;

    :deep(mark) {
        padding: 0 2px;
        border-radius: 2px;
        background: rgba(var(--accent), 0.18);
        color: color-mix(in srgb, rgb(var(--accent)) var(--ink-shade), var(--ink-mix));
    }
}

.row:hover .row-title {
    color: color-mix(in srgb, rgb(var(--lc)) var(--ink-shade), var(--ink-mix));
}

.row-lines {
    flex-shrink: 0;
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: color-mix(in srgb, rgb(var(--lc)) var(--ink-shade), var(--ink-mix));
}

.row-end {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.row-date {
    font-size: 11.5px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.icon-btn {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 5px;
    background: transparent;
    color: var(--t-faint);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;

    .svg-icon {
        font-size: 13px;
    }

    &:hover {
        background: var(--t-line);
        color: var(--t-text);
    }

    &.done {
        opacity: 1;
        color: #3fb950;
    }
}

.row:hover .icon-btn,
.row.open .icon-btn {
    opacity: 1;
}

/* 展开后的代码区 */
.row-body {
    padding: 0 14px 12px 44px;
    animation: rowBodyIn 0.25s ease both;

    :deep(.md-editor-preview-wrapper) {
        padding: 0;
    }

    // md-editor 预览根自带底色（亮色 #fff / 暗色 #000，来自 --md-bk-color），
    // 会在页面底色上浮出一块多余的矩形；预览区本身不需要自己的底
    :deep(.md-editor) {
        background-color: transparent;
    }

    :deep(.md-editor-code) {
        margin: 0;
    }

    // 长代码块限高并内部滚动，避免一行展开就把整页拉得很长
    :deep(.md-editor-code pre) {
        max-height: 420px;
        overflow: auto;
    }
}

@keyframes rowBodyIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.code-foot {
    margin-top: 8px;
    font-size: 11px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
}

/* ---------- 分类侧栏（右侧） ---------- */
.sidebar {
    position: sticky;
    top: 90px;
    align-self: start;
    max-height: calc(100vh - 115px);
    overflow-y: auto;
    scrollbar-width: thin;
    padding-right: 6px;
}

.side-all {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-bottom: 18px;
    padding: 8px 10px;
    border: 1px solid var(--t-line);
    border-radius: 8px;
    background: var(--t-surface);
    color: var(--t-text);
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: 0.15s;

    .n {
        margin-left: auto;
        font-size: 11px;
        color: var(--t-faint);
        font-variant-numeric: tabular-nums;
    }

    &:hover {
        border-color: rgba(var(--accent), 0.45);
    }

    &.on {
        border-color: rgba(var(--accent), 0.5);
        background: rgba(var(--accent), 0.1);

        .n {
            color: rgb(var(--accent));
        }
    }
}

.side-block {
    margin-bottom: 22px;
}

.side-head {
    padding: 0 10px 8px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--t-faint);
}

.side-list {
    list-style: none;
}

.side-item {
    --lc: 139, 148, 158;

    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--t-dim);
    font-family: inherit;
    font-size: 12.5px;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: 0.15s;

    .n {
        margin-left: auto;
        font-size: 10.5px;
        color: var(--t-faint);
        font-variant-numeric: tabular-nums;
    }

    &:hover {
        background: var(--t-hover);
        color: var(--t-text);
    }

    &.on {
        background: rgba(var(--lc), 0.14);
        color: var(--t-text);

        .side-dot {
            box-shadow: 0 0 0 3px rgba(var(--lc), 0.25);
        }

        .n {
            color: color-mix(in srgb, rgb(var(--lc)) var(--ink-shade), var(--ink-mix));
        }
    }
}

.side-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgb(var(--lc));
    transition: box-shadow 0.2s;
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
@media screen and (max-width: 960px) {
    .code-library {
        padding: 16px 14px 40px;
    }

    .layout {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    // 分类改为横滑胶囊，排在列表上方（桌面端它在右侧）
    .sidebar {
        order: -1;
        position: static;
        max-height: none;
        padding-right: 0;
    }

    .side-all {
        width: auto;
        margin-bottom: 12px;
    }

    .side-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .side-item {
        width: auto;
        gap: 7px;
        padding: 5px 11px;
        border: 1px solid var(--t-line);
        border-radius: 99px;
        background: var(--t-surface);
    }
}

@media screen and (max-width: 720px) {
    .row-main {
        grid-template-columns: 14px minmax(0, 1fr) auto;
        gap: 10px;
    }

    .row-lines {
        display: none;
    }

    .row-body {
        padding-left: 30px;
        padding-right: 10px;
    }

    .icon-btn {
        opacity: 1;
    }
}

@media screen and (max-width: 640px) {
    .search {
        max-width: none;
    }

    .group-head {
        gap: 8px;
        padding: 0 8px 8px;
    }

    .row-main {
        padding: 8px 10px;
    }

    .totop {
        right: 16px;
        bottom: 16px;
    }
}

// 尊重系统的「减弱动效」设置
@media (prefers-reduced-motion: reduce) {

    .row,
    .icon-btn,
    .tool-btn,
    .side-item,
    .totop {
        transition: none;
    }

    .row-body {
        animation: none;
    }
}
</style>
