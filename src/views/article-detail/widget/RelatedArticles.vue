<template>
    <section v-if="rows.length" class="related">
        <h2 class="related-title">
            <i-mdi-file-document-multiple-outline class="related-title-icon" />
            {{ title }}
        </h2>
        <div class="related-list">
            <RouterLink v-for="row in rows" :key="row.articleId" class="related-item"
                :to="{ name: 'ArticleDetail', params: { id: row.articleId } }">
                <h3 class="item-title">{{ row.title }}</h3>
                <p class="item-desc">{{ row.description }}</p>
                <div class="item-meta">
                    <time class="item-date">{{ row.day }}</time>
                    <span v-for="tag in row.tags" :key="tag.name" class="item-tag"
                        :style="{ '--tc': tag.color }">{{ tag.name }}</span>
                </div>
            </RouterLink>
        </div>
    </section>
</template>

<script setup lang="ts">
type ArticleItem = Api.Article.ArticleArchiveInfo

const props = defineProps<{
    list: ArticleItem[]
    title?: string
}>()

const title = computed(() => props.title || '相关文章')

/** tagNames / tagColors 是按位对应的逗号分隔串 */
const rows = computed(() => props.list.map((item) => {
    const names = (item.tagNames || '').split(',').filter(Boolean)
    const colors = (item.tagColors || '').split(',')
    return {
        articleId: item.articleId,
        title: item.title,
        description: item.description,
        day: (item.publishTime || '').slice(0, 10),
        tags: names.map((name, i) => ({ name, color: colors[i] || '#fd4781' })),
    }
}))
</script>

<style lang="scss" scoped>
.related {
    margin-top: 40px;

    .related-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 14px;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color-100);

        .related-title-icon {
            color: #fd4781;
        }

        svg {
            flex-shrink: 0;
        }
    }

    .related-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .related-item {
        display: block;
        padding: 14px 16px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-color-100);
        text-decoration: none;
        transition: border-color 0.2s ease, transform 0.2s ease;

        &:hover {
            border-color: #fd4781;
            // 和上下篇保持一致往上抬：横向位移会被 .article-content 的 overflow-x: hidden 裁掉右边框
            transform: translateY(-2px);

            .item-title {
                color: #fd4781;
            }
        }

        .item-title {
            font-size: 15px;
            font-weight: 500;
            line-height: 1.5;
            color: var(--text-color-100);
            transition: color 0.2s ease;
        }

        .item-desc {
            margin-top: 6px;
            font-size: 13px;
            line-height: 1.6;
            color: var(--text-color-400);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .item-meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;

            .item-date {
                font-size: 12px;
                color: var(--text-color-400);
            }

            .item-tag {
                padding: 1px 8px;
                border-radius: 10px;
                font-size: 12px;
                line-height: 1.6;
                color: var(--tc);
                background: color-mix(in srgb, var(--tc) 12%, transparent);
            }
        }
    }
}
</style>
