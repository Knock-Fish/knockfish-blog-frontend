<template>
    <!-- 搜索历史面板：桌面端以浮层挂在输入框下方，移动端直接放进展开的卡片里 -->
    <div class="search-history">
        <div class="history-head">
            <span class="history-label">
                <i-mdi-history />
                搜索历史
            </span>
            <button type="button" class="history-clear"
                @mousedown.prevent @click="emit('clear')">清空</button>
        </div>
        <ul class="history-list">
            <li v-for="item in items" :key="item" class="history-item"
                @mousedown.prevent @click="emit('select', item)">
                <span class="history-keyword">{{ item }}</span>
                <button type="button" class="history-remove" title="删除这条记录"
                    @mousedown.prevent.stop @click.stop="emit('remove', item)">
                    <i-mdi-close />
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    items: string[]
}>()

const emit = defineEmits<{
    (e: 'select', keyword: string): void
    (e: 'remove', keyword: string): void
    (e: 'clear'): void
}>()
</script>

<style lang="scss" scoped>
.search-history {
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--bg-color-100);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .history-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        .history-label {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: var(--text-color-400);

            svg {
                font-size: 14px;
            }
        }

        .history-clear {
            padding: 0;
            border: none;
            background: transparent;
            font-size: 12px;
            color: var(--text-color-400);
            cursor: pointer;

            &:hover {
                color: #fd4781;
            }
        }
    }

    .history-list {
        margin: 0;
        padding: 0;
        list-style: none;
        max-height: 240px;
        overflow-y: auto;

        .history-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 8px;
            border-radius: 6px;
            cursor: pointer;

            &:hover {
                background: var(--hover-bg-color-100);

                .history-remove {
                    opacity: 1;
                }
            }

            .history-keyword {
                flex: 1;
                min-width: 0;
                font-size: 13px;
                color: var(--text-color-200);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .history-remove {
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
                padding: 0;
                border: none;
                background: transparent;
                color: var(--text-color-400);
                font-size: 14px;
                opacity: 0;
                cursor: pointer;
                transition: opacity 0.2s ease;

                &:hover {
                    color: #fd4781;
                }
            }
        }
    }

    // 触屏没有 hover，删除按钮常驻
    @media (hover: none) {
        .history-item .history-remove {
            opacity: 1;
        }
    }
}
</style>
