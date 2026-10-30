<template>
    <!-- 上一篇 / 下一篇：按发布时间排序，左侧更早、右侧更新 -->
    <nav v-if="prev || next" class="article-pager">
        <RouterLink v-if="prev" class="pager-item" :to="linkOf(prev)">
            <span class="pager-label">
                <i-mdi-chevron-left />
                上一篇
            </span>
            <span class="pager-title">{{ prev.title }}</span>
            <time class="pager-time">{{ dayOf(prev.publishTime) }}</time>
        </RouterLink>
        <div v-else class="pager-item is-empty">
            <span class="pager-label">上一篇</span>
            <span class="pager-title">已经是最早的文章了</span>
        </div>

        <RouterLink v-if="next" class="pager-item is-next" :to="linkOf(next)">
            <span class="pager-label">
                下一篇
                <i-mdi-chevron-right />
            </span>
            <span class="pager-title">{{ next.title }}</span>
            <time class="pager-time">{{ dayOf(next.publishTime) }}</time>
        </RouterLink>
        <div v-else class="pager-item is-empty is-next">
            <span class="pager-label">下一篇</span>
            <span class="pager-title">已经是最新的文章了</span>
        </div>
    </nav>
</template>

<script setup lang="ts">
type ArticleItem = Api.Article.ArticleArchiveInfo

defineProps<{
    prev?: ArticleItem | null
    next?: ArticleItem | null
}>()

const linkOf = (item: ArticleItem) => ({
    name: 'ArticleDetail',
    params: { id: item.articleId }
})
const dayOf = (publishTime?: string) => (publishTime || '').slice(0, 10)
</script>

<style lang="scss" scoped>
.article-pager {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);

    .pager-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-color-100);
        text-decoration: none;
        transition: border-color 0.2s ease, transform 0.2s ease;

        &:hover:not(.is-empty) {
            border-color: #fd4781;
            transform: translateY(-2px);
        }

        &.is-next {
            text-align: right;
        }

        &.is-empty {
            cursor: default;
            opacity: 0.65;
        }

        .pager-label {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 12px;
            color: #fd4781;
        }

        &.is-next .pager-label {
            justify-content: flex-end;
        }

        .pager-title {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            color: var(--text-color-100);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &.is-empty .pager-title {
            color: var(--text-color-400);
        }

        .pager-time {
            font-size: 12px;
            color: var(--text-color-400);
        }
    }

    @media screen and (max-width: $screen-medium) {
        grid-template-columns: 1fr;
        gap: 10px;
    }
}
</style>
