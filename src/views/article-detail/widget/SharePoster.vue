<template>
    <button class="poster-trigger" type="button" :disabled="loading || disabled"
        :title="disabled ? '文章数据未就绪，稍后再试' : '生成分享海报'" @click="open">
        <i-mdi-image-outline />
        {{ loading ? '生成中…' : '分享海报' }}
    </button>

    <!-- 自己写弹层，不引 ElDialog：那个组件会把 element-plus 公共 chunk 撑大 5KB gzip，首屏无关 -->
    <Teleport to="body">
        <Transition name="poster-fade">
            <div v-if="visible" class="poster-mask" @click.self="close">
                <div class="poster-modal" role="dialog" aria-modal="true"
                    aria-label="分享海报">
                    <div class="poster-head">
                        <span class="poster-title">分享海报</span>
                        <button class="poster-close" type="button" title="关闭"
                            @click="close">
                            <i-mdi-close />
                        </button>
                    </div>
                    <div class="poster-body">
                        <img v-if="previewUrl" class="poster-preview" :src="previewUrl"
                            alt="文章分享海报" />
                        <div v-else-if="errorMsg" class="poster-error">
                            <i-mdi-alert-circle-outline />
                            <span>{{ errorMsg }}</span>
                        </div>
                        <div v-else class="poster-skeleton">
                            <i-mdi-image-outline />
                            <span>正在生成海报…</span>
                        </div>
                    </div>
                    <div class="poster-footer">
                        <button class="poster-action is-primary" type="button"
                            :disabled="!blob" @click="download">
                            <i-mdi-download />
                            保存图片
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { renderSharePoster, posterFileName, canvasToBlob } from '@/utils/sharePoster'
import type { PosterData } from '@/utils/sharePoster'

const props = defineProps<{
    /** 文章信息，父组件按需拼好后传进来 */
    data: PosterData
    /** 文章还没加载完时禁用按钮，避免生成一张「未命名文章」的空海报 */
    disabled?: boolean
}>()

const visible = ref(false)
const loading = ref(false)
const previewUrl = ref('')
const blob = ref<Blob | null>(null)
const errorMsg = ref('')
const fileName = computed(() => posterFileName(props.data.title))

const release = () => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
    blob.value = null
    errorMsg.value = ''
}

const close = () => {
    visible.value = false
    release()
}

/** 生成海报；版式固定 16:9，想换风格改 utils 里的默认 variant */
const regenerate = async () => {
    release()
    loading.value = true
    try {
        const { canvas } = await renderSharePoster(props.data)
        const result = await canvasToBlob(canvas)
        if (!result) throw new Error('海报导出失败，封面可能未开启跨域')
        blob.value = result
        previewUrl.value = URL.createObjectURL(result)
    } catch (error) {
        // 错误就近显示在弹层里，避免为一句提示引入 ElMessage（会给首屏公共 chunk 增重）
        errorMsg.value = error instanceof Error ? error.message : '海报生成失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

const open = () => {
    visible.value = true
    regenerate()
}

const download = async () => {
    if (!blob.value) return
    const file = new File([blob.value], fileName.value, { type: 'image/png' })
    // 移动端优先唤起系统分享面板（可直接发微信 / 存相册）
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: props.data.title })
            return
        } catch {
            // 用户取消分享，落回下载
        }
    }
    const a = document.createElement('a')
    a.href = previewUrl.value
    a.download = fileName.value
    a.click()
}

// Esc 关闭 + 打开时锁住页面滚动
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && visible.value) close()
})

watch(visible, (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
})

onBeforeUnmount(() => {
    release()
    document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.poster-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    padding: 4px 12px;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    background: transparent;
    font-size: 13px;
    color: var(--text-color-300);
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
        font-size: 16px;
    }

    &:hover {
        border-color: #fd4781;
        color: #fd4781;
    }

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
}

.poster-mask {
    position: fixed;
    inset: 0;
    z-index: 30000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.45);
}

.poster-modal {
    width: 420px;
    max-width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    padding: 16px 18px 14px;
    border-radius: 14px;
    background: var(--bg-color-100);
    box-sizing: border-box;

    .poster-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .poster-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-color-100);
        }

        .poster-close {
            display: inline-flex;
            padding: 2px;
            border: none;
            background: transparent;
            font-size: 18px;
            color: var(--text-color-400);
            cursor: pointer;

            &:hover {
                color: #fd4781;
            }
        }
    }

    .poster-body {
        flex: 1;
        min-height: 0;
        display: flex;
        justify-content: center;
        overflow: auto;

        .poster-preview {
            display: block;
            max-width: 100%;
            max-height: 62vh;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        // 尺寸和最终海报一致（16:9），出图时不会跳动
        .poster-skeleton {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            max-width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: 8px;
            border: 1px dashed var(--border-color);
            background: var(--hover-bg-color-100);
            box-sizing: border-box;
            font-size: 13px;
            color: var(--text-color-400);
            animation: poster-pulse 1.4s ease-in-out infinite;

            svg {
                font-size: 22px;
            }
        }

        .poster-error {
            display: flex;
            align-items: center;
            gap: 6px;
            align-self: center;
            padding: 12px 16px;
            font-size: 13px;
            color: #d14343;

            svg {
                flex-shrink: 0;
                font-size: 16px;
            }
        }
    }

    .poster-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 14px;

        .poster-action {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 7px 16px;
            border-radius: 18px;
            border: 1px solid var(--border-color);
            background: transparent;
            font-size: 13px;
            color: var(--text-color-200);
            cursor: pointer;

            &.is-primary {
                border-color: transparent;
                background: linear-gradient(90deg, #ff92b5, #fd4781);
                color: #fff;
            }

            &:disabled {
                opacity: 0.6;
                cursor: default;
            }
        }
    }
}

.poster-fade-enter-active,
.poster-fade-leave-active {
    transition: opacity 0.2s ease;
}

.poster-fade-enter-from,
.poster-fade-leave-to {
    opacity: 0;
}

@keyframes poster-pulse {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@media screen and (max-width: $screen-small) {
    .poster-mask {
        padding: 12px;

        .poster-modal {
            padding: 14px 14px 12px;

            .poster-footer {
                flex-direction: column;
                align-items: stretch;
                text-align: center;

                .poster-action {
                    justify-content: center;
                }
            }
        }
    }
}
</style>
