<template>
    <div class="site-nav">
        <!-- 骨架屏：结构与真实分组一致 -->
        <ElSkeleton v-if="loading" animated>
            <div v-for="group in 2" :key="group" class="sk-group">
                <ElSkeletonItem variant="text" class="sk-title" />
                <div class="grid">
                    <ElSkeletonItem v-for="item in 8" :key="item" variant="rect" class="sk-card" />
                </div>
            </div>
        </ElSkeleton>

        <!-- 空状态 -->
        <ElEmpty v-else-if="!groups.length" class="empty" description="这里还没有收录站点" />

        <!-- 主体：左侧目录（锚点）+ 右侧内容 -->
        <div v-else class="layout">
            <nav class="toc">
                <!-- 窄屏横滑条两端的箭头；桌面端竖排目录不显示 -->
                <button type="button" class="toc-arrow left" :disabled="!canScrollLeft"
                    aria-label="左侧还有更多分类" @click="scrollMenu(-1)">
                    <i-mdi-chevron-left />
                </button>

                <ElMenu :default-active="menuActive" class="toc-menu"
                    :class="{ 'fade-left': canScrollLeft, 'fade-right': canScrollRight }"
                    @select="scrollToCategory" @scroll="syncMenuFade">
                    <ElMenuItem v-for="group in groups" :key="group.categoryId"
                        :index="String(group.categoryId)">{{ group.categoryName }}</ElMenuItem>
                </ElMenu>

                <button type="button" class="toc-arrow right" :disabled="!canScrollRight"
                    aria-label="右侧还有更多分类" @click="scrollMenu(1)">
                    <i-mdi-chevron-right />
                </button>
            </nav>

            <main class="content">
                <section v-for="group in groups" :key="group.categoryId"
                    :id="anchorOf(group.categoryId)" class="section">
                    <h2 class="section-title">{{ group.categoryName }}</h2>
                    <div class="grid">
                        <SiteCard v-for="site in group.sites" :key="site.siteId" :site="site" />
                    </div>
                </section>
            </main>
        </div>

        <ElBacktop :right="26" :bottom="26" :visibility-height="400" />
    </div>
</template>

<script setup lang="ts">
import SiteCard from './widget/SiteCard.vue'
import { CategoryService } from '@api/categoryApi'

defineOptions({ name: 'Navigation' })

type Category = Api.Category.CategoryInfo
type Site = Api.Site.SiteInfo

interface Group {
    categoryId: number
    categoryName: string
    sites: Site[]
}

const loading = ref(true)
const categories = ref<Category[]>([])
/** 滚动联动定位到的分类 id，用于目录高亮 */
const spyCat = ref('')

const { y } = useWindowScroll()
const prefersReduced = usePreferredReducedMotion()

const scrollBehavior = (): ScrollBehavior => (prefersReduced.value === 'reduce' ? 'auto' : 'smooth')

const anchorOf = (categoryId: number) => `cat-${categoryId}`

/** 只保留有站点的分类；左侧目录与右侧内容共用这一份数据 */
const groups = computed<Group[]>(() => categories.value
    .filter(item => item.sites?.length)
    .map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        sites: item.sites ?? [],
    })))

/** 目录高亮跟随滚动位置（还没滚到任何分组时不点亮任何项） */
const menuActive = computed(() => spyCat.value)

/** 窄屏时目录是一行横向滚动条：记录两侧是否还有被挡住的项，用于渐隐提示 */
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const tocMenu = () => document.querySelector<HTMLElement>('.toc-menu')

const syncMenuFade = () => {
    const menu = tocMenu()
    if (!menu) return
    canScrollLeft.value = menu.scrollLeft > 1
    canScrollRight.value = menu.scrollLeft < menu.scrollWidth - menu.clientWidth - 1
}

/** 窄屏横滑条两端的箭头：点一下滚动约一屏 */
const scrollMenu = (direction: 1 | -1) => {
    const menu = tocMenu()
    if (!menu) return
    menu.scrollBy({ left: direction * menu.clientWidth * 0.8, behavior: 'smooth' })
}

/** 把当前分类带进视野：窄屏横滑条自动滑到它，长目录（桌面端）也会跟着滚 */
const revealActive = () => {
    const menu = tocMenu()
    if (!menu) return
    const active = menu.querySelector<HTMLElement>('.el-menu-item.is-active')
    if (active) {
        active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
        return
    }
    // 还没滚到任何分组（页面在顶部）：横滑条回到起点
    menu.scrollTo({ left: 0, behavior: 'smooth' })
}

/** 目录点击 = 锚点跳转，只滚动定位，不筛选 */
const scrollToCategory = (index: string) => {
    // 先点亮，避免等滚动到位才响应
    spyCat.value = index
    document.getElementById(anchorOf(Number(index)))
        ?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

/** 滚动联动：取顶部越过 130px 的最后一个分类区块 */
const syncActiveCat = () => {
    let current = ''
    for (const section of document.querySelectorAll<HTMLElement>('.section')) {
        if (section.getBoundingClientRect().top <= 130) current = section.id.replace('cat-', '')
    }
    spyCat.value = current
}

watch([y, groups], () => {
    syncActiveCat()
    syncMenuFade()
}, { flush: 'post' })

// 高亮项变了（DOM 已更新）再把它带进视野
watch(spyCat, () => nextTick(revealActive))

onMounted(async () => {
    try {
        categories.value = await CategoryService.getAllCategoryWithSites()
    } catch (error) {
        console.error('获取站点导航失败:', error)
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
.site-nav {
    // 明暗两套 token（主色跟随站点 #fd4781）；子组件 SiteCard 通过继承消费
    --accent: 253, 71, 129;
    --t-text: #17181c;
    --t-text-2: #454a55;
    --t-dim: #6b7280;
    --t-surface: #ffffff;
    --t-line: rgba(0, 0, 0, 0.08);

    box-sizing: border-box;
    width: 100%;
    padding: 20px 20px 60px;
}

html.dark .site-nav {
    --t-text: #e7eaf3;
    --t-text-2: #c3c9d6;
    --t-dim: #8a93a8;
    --t-surface: #171a24;
    --t-line: rgba(255, 255, 255, 0.09);
}

/* ---------- 布局 ---------- */
.layout {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 56px;
    padding-top: 8px;
}

/* 左侧目录：纯文字，尽量"消失"在页面里 */
.toc {
    position: sticky;
    top: 76px;
    // sticky 三件套：auto 高度才是内容高度，max-height 预留页脚，否则滚到文档末尾会被顶出视口
    align-self: start;
    // 窄屏时目录会变成横向滑动的胶囊条，不加这条会被内容撑宽、撑出横向滚动条
    min-width: 0;
    height: auto;
    max-height: calc(100vh - 340px);
    overflow-y: auto;
    scrollbar-width: none;
    padding-top: 4px;

    &::-webkit-scrollbar {
        display: none;
    }
}

.toc-menu {
    --el-menu-bg-color: transparent;
    --el-menu-hover-bg-color: transparent;
    --el-menu-text-color: var(--t-dim);
    --el-menu-active-color: var(--t-text);
    --el-menu-item-height: 32px;
    --el-menu-item-font-size: 13.5px;
    --el-menu-base-level-padding: 10px;

    border-right: none;

    :deep(.el-menu-item) {
        position: relative;
        border-radius: 6px;
        border-bottom: none;
        transition: color 0.18s, padding 0.25s ease;

        // 改基础内边距即实现 hover 右移，无需 !important 覆盖内联样式
        &:hover {
            --el-menu-base-level-padding: 13px;
        }

        // 唯一的装饰：激活项左侧的小圆点（常驻占位，仅缩放切换，才有过渡动画）
        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: rgb(var(--accent));
            transform: translateY(-50%) scale(0);
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        &.is-active {
            font-weight: 700;

            &::before {
                transform: translateY(-50%) scale(1);
            }
        }
    }
}

/* 窄屏横滑条两端的箭头：桌面端竖排目录用不到，默认隐藏 */
.toc-arrow {
    display: none;
}

/* ---------- 右侧内容 ---------- */
.content {
    min-width: 0;
}

.section {
    scroll-margin-top: 90px;

    & + .section {
        margin-top: 46px;
    }
}

.section-title {
    margin-bottom: 18px;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--t-text);
}

// 最大窗口（1300px 容器）一行 5 个；grid-auto-rows 让每一行等高，
// 配合卡片自身 height: 100% + 描述固定两行，所有站点项尺寸完全一致
.grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-auto-rows: 1fr;
    gap: 12px;

    // 窗口变窄时逐级降列，保证卡片仍有足够宽度容纳站点名
    @media screen and (max-width: $screen-larger) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media screen and (max-width: $screen-desktop) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media screen and (max-width: 560px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media screen and (max-width: $screen-small) {
        grid-template-columns: 1fr;
    }
}

/* ---------- 骨架屏 ---------- */
.sk-group + .sk-group {
    margin-top: 46px;
}

.sk-title {
    width: 110px;
    height: 20px !important;
    margin-bottom: 18px;
}

.sk-card {
    // 与真实卡片等高（13×2 内边距 + 标题 + 两行描述 + 上下描边）
    height: 82px !important;
    border-radius: 12px;
}

/* ---------- 空状态 ---------- */
.empty {
    padding: 40px 0 20px;

    :deep(.el-empty__description p) {
        color: var(--t-dim);
        font-size: 14px;
    }
}

/* ---------- 回顶 ---------- */
:deep(.el-backtop) {
    --el-backtop-bg-color: var(--t-surface);
    --el-backtop-text-color: var(--t-dim);
    --el-backtop-hover-bg-color: var(--t-surface);

    border: 1px solid var(--t-line);
    box-shadow: 0 4px 14px -6px rgba(120, 90, 110, 0.25);
    transition: color 0.2s, border-color 0.2s;

    &:hover {
        color: rgb(var(--accent));
        border-color: rgb(var(--accent));
    }
}

/* ---------- 响应式 ---------- */
@media screen and (max-width: $screen-desktop) {
    .layout {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    // 目录变成吸顶横向胶囊条，横跨整屏
    .toc {
        position: sticky;
        top: 60px;
        z-index: 40;
        max-height: none;
        overflow: visible;
        margin: 0 -35px;
        padding: 10px 35px;
        background: color-mix(in srgb, var(--t-surface) 94%, transparent);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--t-line);
    }

    .toc-menu {
        --el-menu-base-level-padding: 0;

        display: flex;
        gap: 18px;
        overflow-x: auto;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }

        // 两侧渐隐：只在对应方向确实还有被挡住的项时出现，暗示这行可以横滑
        &.fade-right {
            mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);
        }

        &.fade-left:not(.fade-right) {
            mask-image: linear-gradient(to right, transparent, #000 24px);
        }

        &.fade-left.fade-right {
            mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent);
        }

        :deep(.el-menu-item) {
            flex-shrink: 0;

            &:hover,
            &.is-active {
                --el-menu-base-level-padding: 0;
            }

            // 横滑条上不放圆点，避免与相邻项挤在一起
            &.is-active::before {
                display: none;
            }
        }
    }

    // 两端的左右箭头：常驻占位（不可用时透明），避免显隐导致横滑条宽度跳动
    // 尺寸与定位按「刚好落在 .toc 的横向内边距里」来配，免得压住标题文字
    .toc-arrow {
        position: absolute;
        top: 50%;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        transform: translateY(-50%);
        border: 1px solid var(--t-line);
        border-radius: 50%;
        background: var(--t-surface);
        color: var(--t-dim);
        font-size: 16px;
        cursor: pointer;
        transition: color 0.2s, border-color 0.2s, opacity 0.2s;

        &.left {
            left: 4px;
        }

        &.right {
            right: 4px;
        }

        &:disabled {
            opacity: 0;
            pointer-events: none;
        }

        &:hover:not(:disabled) {
            color: rgb(var(--accent));
            border-color: rgb(var(--accent));
        }
    }
}

@media screen and (max-width: $screen-medium) {
    .site-nav {
        padding: 12px 15px 48px;
    }

    .toc {
        margin: 0 -30px;
        padding: 10px 30px;
    }

    .grid {
        gap: 10px;
    }

    .section + .section {
        margin-top: 34px;
    }

    .section-title {
        font-size: 16px;
    }
}
</style>
