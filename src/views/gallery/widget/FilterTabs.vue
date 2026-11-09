<template>
    <div class="filter-tabs">
        <button
            v-for="tab in TABS"
            :key="tab.value"
            type="button"
            class="tab"
            :class="{ active: modelValue === tab.value }"
            @click="emit('update:modelValue', tab.value)"
        >
            {{ tab.label }}
            <em v-if="counts[tab.value]">{{ counts[tab.value] }}</em>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { OrientationFilter } from '../types'

defineProps<{
    modelValue: OrientationFilter
    counts: Record<OrientationFilter, number>
}>()

const emit = defineEmits<{ 'update:modelValue': [value: OrientationFilter] }>()

const TABS: { value: OrientationFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'landscape', label: '横图' },
    { value: 'portrait', label: '竖图' },
    { value: 'square', label: '方图' },
]
</script>

<style lang="scss" scoped>
/* 分段控件：浅色轨道 + 选中项白色胶囊，和相册页的轻盈调性一致 */
.filter-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: 999px;
    background: var(--g-skeleton);
}

/**
 * 前台没有 button 全局 reset，UA 默认的灰底/描边必须显式清掉，
 * 否则未选中的标签会带一圈深色边框。
 */
.tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 15px;
    border: none;
    border-radius: 999px;
    background: transparent;
    appearance: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--g-dim);
    cursor: pointer;
    transition:
        color 0.22s var(--g-ease),
        background-color 0.22s var(--g-ease),
        box-shadow 0.22s var(--g-ease);

    &:hover {
        color: var(--g-text);
    }

    &.active {
        color: var(--g-text);
        background: var(--g-surface);
        box-shadow: 0 2px 10px rgba(20, 20, 30, 0.08);
    }

    em {
        font-size: 11px;
        font-style: normal;
        opacity: 0.55;
    }
}

@media (max-width: 560px) {
    .tab {
        padding: 6px 11px;
        font-size: 12px;
    }
}
</style>
