import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export interface MasonryItem {
    id: string
    ratio: number
}

export interface MasonryBox {
    x: number
    y: number
    width: number
    height: number
}

/** 既可以是固定值，也可以按容器宽度返回不同值（做响应式列数用） */
export type ResponsiveNumber = number | ((containerWidth: number) => number)

export interface MasonryOptions {
    /** 单列最小宽度，决定列数 */
    minColumnWidth?: ResponsiveNumber
    gap?: number
    maxColumns?: ResponsiveNumber
}

/**
 * 瀑布流布局：按「最短列优先」把每一项算进容器，纯计算、不量 DOM。
 * 容器宽度变化（窗口缩放、侧栏折叠）时靠 ResizeObserver 自动重排。
 */
export function useMasonry(
    container: Ref<HTMLElement | null>,
    items: () => MasonryItem[],
    options: MasonryOptions = {},
) {
    // gap 固定，宽/列上限允许按容器宽度动态算，所以不能在这里解构死
    const { gap = 16 } = options

    const containerWidth = ref(0)
    let observer: ResizeObserver | null = null

    onMounted(() => {
        if (!container.value) return
        containerWidth.value = container.value.clientWidth
        observer = new ResizeObserver((entries) => {
            containerWidth.value = entries[0].contentRect.width
        })
        observer.observe(container.value)
    })

    onBeforeUnmount(() => observer?.disconnect())

    return computed(() => {
        const total = containerWidth.value
        const list = items()
        const boxes: Record<string, MasonryBox> = {}

        if (!total || !list.length) {
            return { boxes, height: 0, columns: 1 }
        }

        const resolve = (value: ResponsiveNumber | undefined, fallback: number) =>
            typeof value === 'function' ? value(total) : value ?? fallback
        const minWidth = Math.max(80, resolve(options.minColumnWidth, 220))
        const maxColumns = Math.max(1, resolve(options.maxColumns, 5))
        const columns = Math.max(1, Math.min(maxColumns, Math.floor((total + gap) / (minWidth + gap))))
        const columnWidth = (total - gap * (columns - 1)) / columns
        const columnHeights = new Array<number>(columns).fill(0)

        for (const item of list) {
            // 找出当前最矮的一列
            let target = 0
            for (let index = 1; index < columns; index += 1) {
                if (columnHeights[index] < columnHeights[target]) target = index
            }

            const height = Math.round(columnWidth / (item.ratio > 0 ? item.ratio : 4 / 3))
            boxes[item.id] = {
                x: Math.round(target * (columnWidth + gap)),
                y: Math.round(columnHeights[target]),
                width: columnWidth,
                height,
            }
            columnHeights[target] += height + gap
        }

        return { boxes, height: Math.round(Math.max(...columnHeights) - gap), columns }
    })
}
