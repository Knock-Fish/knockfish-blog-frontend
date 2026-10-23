<template>
    <a class="site-card-link" :href="site.siteUrl" target="_blank"
        rel="noopener noreferrer" :title="site.siteName">
        <ElCard shadow="hover" class="site-card">
            <!-- 站点图标：直接展示站点自己的 favicon，不加底色 -->
            <ElAvatar :src="site.ico" :size="36" shape="square" class="site-ico">
                <span class="ico-fallback">{{ initial }}</span>
            </ElAvatar>

            <div class="site-body">
                <p class="site-name">{{ site.siteName }}</p>
                <p class="site-desc">{{ site.description }}</p>
            </div>
        </ElCard>
    </a>
</template>

<script setup lang="ts">
type Site = Api.Site.SiteInfo

const props = defineProps<{ site: Site }>()

/** favicon 加载失败时的兜底：站点名首字母，英文大写 */
const initial = computed(() => {
    const first = props.site.siteName.trim()[0] ?? '?'
    return /[a-z]/i.test(first) ? first.toUpperCase() : first
})
</script>

<style lang="scss" scoped>
/* 配色 token（--accent / --t-*）由页面根节点 .site-nav 提供，此处只消费 */
.site-card-link {
    display: block;
    height: 100%;
    color: inherit;
    text-decoration: none;
}

.site-card {
    // 撑满网格单元，配合 .grid 的 grid-auto-rows 让所有站点项尺寸一致
    height: 100%;
    border-radius: 12px;
    border-color: var(--t-line);
    background: var(--t-surface);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

    // 覆盖 ElCard shadow="hover" 的默认光晕，换成更收敛的暖色投影并上浮
    &:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, rgb(var(--accent)) 30%, var(--t-line));
        box-shadow: 0 8px 22px -14px rgba(120, 90, 110, 0.4);
    }

    :deep(.el-card__body) {
        display: flex;
        align-items: center;
        gap: 11px;
        // 项目全局把 el-card__body 的内边距写死成 10px（el-ui.scss），这里按需改回
        padding: 13px 14px;
    }
}

.site-ico {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    // 不要底色：EP 的 .el-avatar 默认带灰底，透明 PNG 的 favicon 会透出方块
    background: transparent;
}

.ico-fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    color: var(--t-dim);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.site-body {
    min-width: 0;
}

.site-name {
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--t-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.site-desc {
    display: -webkit-box;
    // 固定占两行高度：描述只有一行时也撑住，保证每个站点项尺寸完全一致
    min-height: 3em;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--t-dim);
    transition: color 0.2s;
}

.site-card:hover .site-desc {
    color: var(--t-text-2);
}
</style>
