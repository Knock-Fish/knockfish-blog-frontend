<template>
    <section class="tag-filter">
        <!-- 搜索标签 -->
        <div class="filter-head">
            <label class="filter-search">
                <i-mdi-magnify />
                <input v-model="keyword" type="search" placeholder="搜索标签名…" />
            </label>
            <span class="filter-total">{{ tags.length }} 个标签</span>
        </div>

        <!-- 标签云 -->
        <div class="filter-cloud">
            <button v-for="tag in shownTags" :key="tag.name" type="button"
                class="chip" :class="{ on: isSelected(tag.name) }"
                :style="{ '--tc': tag.color }" @click="toggle(tag.name)">
                <i-mdi-check v-if="isSelected(tag.name)" />
                {{ tag.name }}<span class="chip-count">{{ tag.count }}</span>
            </button>

            <button v-if="collapsible" type="button" class="chip chip-more"
                @click="expanded = !expanded">
                {{ expanded ? '收起' : `展开全部 ${tags.length}` }}
                <i-mdi-chevron-down :class="{ up: expanded }" />
            </button>

            <span v-if="!shownTags.length" class="filter-none">没有匹配的标签</span>
        </div>

        <!-- 已选筛选 -->
        <div v-if="selected.length" class="filter-selected">
            <span class="filter-label">筛选</span>
            <button v-for="tag in selected" :key="tag" type="button" class="chip on"
                :style="{ '--tc': colorOf(tag) }" @click="toggle(tag)">
                {{ tag }}<i-mdi-close />
            </button>
            <span class="filter-hit">命中 {{ hits }} 篇</span>
            <button type="button" class="filter-clear" @click="selected = []">清空</button>
        </div>
    </section>
</template>

<script setup lang="ts">
interface TagStat {
    name: string
    count: number
    /** 后端返回的标签颜色（"R, G, B" 形式，直接喂给 --tc） */
    color: string
}

const props = defineProps<{
    /** 全部标签及篇数，已按篇数倒序 */
    tags: TagStat[]
    /** 当前筛选命中的文章数 */
    hits: number
    /** 收起状态下露出的标签数量 */
    preview?: number
}>()

const selected = defineModel<string[]>({ required: true })

const keyword = ref<string>('')
const expanded = ref<boolean>(false)

const matched = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return kw ? props.tags.filter(tag => tag.name.toLowerCase().includes(kw)) : props.tags
})

/** 默认只露一行常用标签，避免面板过高；搜索时全部展示 */
const shownTags = computed(() => {
    if (expanded.value || keyword.value) return matched.value
    return matched.value.slice(0, props.preview ?? 12)
})

const collapsible = computed(() => !keyword.value && matched.value.length > (props.preview ?? 12))

const isSelected = (name: string) => selected.value.includes(name)

/** 已选区只有标签名，颜色从标签表里回查 */
const colorOf = (name: string) => props.tags.find(tag => tag.name === name)?.color ?? ''

const toggle = (name: string) => {
    selected.value = isSelected(name)
        ? selected.value.filter(tag => tag !== name)
        : [...selected.value, name]
}
</script>

<style lang="scss" scoped>
/* 配色沿用归档页根节点上的主题 token */
.filter-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
}

.filter-search {
    position: relative;
    flex: 1 1 220px;
    max-width: 320px;
    display: flex;
    align-items: center;

    .svg-icon {
        position: absolute;
        left: 12px;
        font-size: 15px;
        color: var(--t-faint);
        pointer-events: none;
    }

    input {
        width: 100%;
        padding: 9px 14px 9px 36px;
        border: 1px solid var(--t-line);
        border-radius: 10px;
        background: var(--t-hover);
        color: var(--t-text);
        font-family: inherit;
        font-size: 13.5px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;

        &::placeholder {
            color: var(--t-faint);
        }

        &:focus {
            border-color: rgba(var(--accent), 0.5);
            box-shadow: 0 0 0 3px rgba(var(--accent), 0.09);
        }
    }
}

.filter-total {
    margin-left: auto;
    font-size: 12.5px;
    color: var(--t-faint);
    font-variant-numeric: tabular-nums;
}

.filter-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-none {
    font-size: 13px;
    color: var(--t-faint);
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border: 1px solid var(--t-line);
    border-radius: 99px;
    background: var(--t-surface);
    color: var(--t-dim);
    font-family: inherit;
    font-size: 12.5px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s;

    .svg-icon {
        font-size: 13px;
    }

    .chip-count {
        font-size: 10.5px;
        opacity: 0.55;
        font-variant-numeric: tabular-nums;
    }

    &:hover {
        color: var(--tc, rgb(var(--accent)));
        border-color: color-mix(in srgb, var(--tc, rgb(var(--accent))) 45%, transparent);
    }

    &.on {
        color: var(--tc, rgb(var(--accent)));
        border-color: color-mix(in srgb, var(--tc, rgb(var(--accent))) 50%, transparent);
        background: color-mix(in srgb, var(--tc, rgb(var(--accent))) 10%, transparent);
        box-shadow: 0 0 14px -4px color-mix(in srgb, var(--tc, rgb(var(--accent))) 55%, transparent);
    }

    &:focus-visible {
        outline: 2px solid var(--tc, rgb(var(--accent)));
        outline-offset: 2px;
    }
}

.chip-more {
    color: var(--t-faint);

    .svg-icon {
        transition: transform 0.25s ease;
    }

    .svg-icon.up {
        transform: rotate(180deg);
    }
}

.filter-selected {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--t-line);

    .filter-label {
        font-size: 12.5px;
        color: var(--t-faint);
    }

    .filter-hit {
        margin-left: auto;
        font-size: 12px;
        color: var(--t-dim);
        font-variant-numeric: tabular-nums;
    }

    .filter-clear {
        padding: 5px 12px;
        border: 1px solid var(--t-line);
        border-radius: 8px;
        background: none;
        color: var(--t-dim);
        font-family: inherit;
        font-size: 12.5px;
        cursor: pointer;
        transition: 0.2s;

        &:hover {
            color: rgb(var(--accent));
            border-color: rgba(var(--accent), 0.45);
        }
    }
}

@media screen and (max-width: 640px) {
    .filter-search {
        max-width: none;
    }

    .chip {
        padding: 4px 9px;
        font-size: 12px;
    }

    .filter-selected .filter-hit {
        margin-left: 0;
    }
}

@media (prefers-reduced-motion: reduce) {

    .chip,
    .chip-more .svg-icon {
        transition: none;
    }
}
</style>
