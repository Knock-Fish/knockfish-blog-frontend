<template>
    <Teleport to="body">
        <Transition name="album-lock">
            <div v-if="album" class="lock-mask" @click.self="close">
                <div class="lock-modal" role="dialog" aria-modal="true" aria-label="输入相册密码">
                    <button type="button" class="close" title="关闭" @click="close">
                        <i-mdi-close />
                    </button>

                    <h2>{{ album.name }}</h2>
                    <p class="tip">输入密码后进入</p>

                    <AlbumUnlockForm :album="album" @unlocked="(token, expiresIn) => emit('unlocked', token, expiresIn)" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import AlbumUnlockForm from './AlbumUnlockForm.vue'
import type { GalleryAlbumVO } from '@/api/galleryApi'

/** 传 null 表示关闭；组件常驻，让离场动画能跑完 */
const props = defineProps<{ album: GalleryAlbumVO | null }>()
const emit = defineEmits<{ close: []; unlocked: [token: string, expiresIn: number] }>()

let prevOverflow = ''

function close() {
    emit('close')
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
}

function lockScroll(locked: boolean) {
    if (locked) {
        prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = prevOverflow
    }
}

watch(
    () => props.album,
    album => {
        if (album) {
            lockScroll(true)
            document.addEventListener('keydown', onKeydown)
        } else {
            lockScroll(false)
            document.removeEventListener('keydown', onKeydown)
        }
    },
    { immediate: true },
)

onBeforeUnmount(() => {
    lockScroll(false)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
@use '../style/tokens' as *;

/* Teleport 到 body 后拿不到 .gallery-page 上的变量，这里自己挂一份 */
.lock-mask {
    @include gallery-tokens;

    position: fixed;
    inset: 0;
    z-index: 30000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(10, 10, 14, 0.5);
}

html.dark .lock-mask {
    @include gallery-tokens-dark;

    background: rgba(0, 0, 0, 0.62);
}

.lock-modal {
    position: relative;
    box-sizing: border-box;
    width: 360px;
    max-width: 100%;
    padding: 26px 22px 22px;
    border: 1px solid var(--g-line);
    border-radius: var(--g-radius);
    background: var(--g-surface);
    box-shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.55);
    text-align: center;
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--g-dim);
    font-size: 15px;
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;

    &:hover {
        color: var(--g-text);
        background: color-mix(in srgb, var(--g-text) 8%, transparent);
    }
}

h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--g-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tip {
    margin: 6px 0 18px;
    font-size: 12px;
    color: var(--g-dim);
}

.album-lock-enter-active,
.album-lock-leave-active {
    transition: opacity 0.2s var(--g-ease);
}

.album-lock-enter-from,
.album-lock-leave-to {
    opacity: 0;
}

.album-lock-enter-active .lock-modal {
    transition: transform 0.22s var(--g-ease);
}

.album-lock-enter-from .lock-modal {
    transform: translateY(8px) scale(0.98);
}

@media screen and (max-width: 640px) {
    .lock-mask {
        padding: 16px;
    }

    .lock-modal {
        padding: 24px 18px 20px;
    }
}
</style>
