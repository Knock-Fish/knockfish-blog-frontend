<template>
    <div class="search-container">
        <!-- PC端搜索框 -->
        <div class="search-desktop">
            <div ref="desktopRef" class="search-desktop-wrapper"
                :class="{ active: isDesktopActive }">
                <ElInput ref="inputRef" class="search-desktop-input"
                    @blur="handleFocus" v-model="keyword" type="text"
                    @keyup.enter="handleDesktopSearch"
                    @keydown.esc="closeDesktop" placeholder="搜索什么……" />
                <ElButton class="icon-button" @click="toggle">
                    <i-mdi-search
                        :style="{ color: isDesktopActive ? '#cecece' : undefined }" />
                </ElButton>
                <SearchHistory v-if="showDesktopHistory" class="desktop-history"
                    :items="history" @select="searchFromHistory"
                    @remove="removeHistory" @clear="clearHistory" />
            </div>
        </div>
        <!-- 移动端搜索框 -->
        <div class="search-mobile">
            <ElButton class="icon-button"
                @click.stop="isMobileActive = !isMobileActive">
                <i-mdi-search
                    :style="{ color: isMobileActive ? '#cecece' : '#414141' }" />
            </ElButton>
            <div ref="cardRef">
                <Transition 
                enter-active-class="animate__animated animate__fadeInDown"
                leave-active-class="animate__animated animate__fadeOutDown">
                    <ElCard class="search-mobile-card" 
                        v-show="isMobileActive">
                        <ElInput ref="mobileInputRef" class="search-mobile-input" size="large"
                            @keyup.enter="handleMobileSearch"
                            v-model="keyword" type="text"
                            placeholder="搜索什么……" />
                        <div class="search-result">
                            <SearchHistory v-if="showMobileHistory"
                                :items="history" @select="searchFromHistory"
                                @remove="removeHistory" @clear="clearHistory" />
                        </div>
                    </ElCard>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import SearchHistory from './widget/SearchHistory.vue'

// 搜索词，与父组件双向绑定
const keyword = defineModel<string>({ required: true })
// 搜索框是否隐藏
const isMobileActive = ref(false)
const isDesktopActive = ref(false)
const emit = defineEmits<{
    (e: 'enter-desktop'): void
    (e: 'enter-mobile'): void
}>()
// 搜索框DOM
const inputRef = ref<HTMLElement | null>(null)
const mobileInputRef = ref<HTMLElement | null>(null)
// 搜索框卡片DOM
const cardRef = useTemplateRef('cardRef')

/**
 * 搜索历史：最多保留 8 条，去重后按最近使用排序，持久化到 localStorage
 * （内容浏览型站点不需要账号，本地存就够）
 */
const MAX_HISTORY = 8
const history = useStorage<string[]>('knockfish-search-history', [])

const rememberKeyword = (value: string) => {
    const word = value.trim()
    if (!word) return
    history.value = [word, ...history.value.filter((item) => item !== word)].slice(0, MAX_HISTORY)
}
const removeHistory = (word: string) => {
    history.value = history.value.filter((item) => item !== word)
}
const clearHistory = () => {
    history.value = []
}

const showDesktopHistory = computed(() =>
    isDesktopActive.value && !keyword.value.trim() && history.value.length > 0)
const showMobileHistory = computed(() =>
    isMobileActive.value && !keyword.value.trim() && history.value.length > 0)

/** 自动获取焦点，在失去焦点时搜索框隐藏 */
const toggle = () => {
    if (!isDesktopActive.value && inputRef.value) {
        // 调用 focus() 方法
        inputRef?.value.focus()
    } else {
        inputRef.value?.blur()
    }
    isDesktopActive.value = !isDesktopActive.value
}
const closeDesktop = () => {
    inputRef.value?.blur()
    isDesktopActive.value = false
}
const handleFocus = () => {
    setTimeout(() => isDesktopActive.value = false, 100)
}
// 点击其他区域关闭搜索框
onClickOutside(cardRef, () => {
    if (isMobileActive.value) {
        isMobileActive.value = false
    }
})
const handleDesktopSearch = () => {
    rememberKeyword(keyword.value)
    emit('enter-desktop')
    closeDesktop()
    keyword.value = ''
}
const handleMobileSearch = () => {
    rememberKeyword(keyword.value)
    emit('enter-mobile')
    isMobileActive.value = false
    keyword.value = ''
}
/** 点历史记录：填进输入框后直接走对应的搜索逻辑 */
const searchFromHistory = (word: string) => {
    keyword.value = word
    if (isMobileActive.value) handleMobileSearch()
    else handleDesktopSearch()
}

/** 全局按 / 聚焦搜索框；已在输入框里时不拦截，保证能正常打出斜杠 */
const isTypingElement = (target: EventTarget | null) => {
    const el = target as HTMLElement | null
    if (!el) return false
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}
const openSearch = () => {
    // 与 $screen-larger 保持一致：1200px 以下走移动端浮层
    if (window.matchMedia('(max-width: 1200px)').matches) {
        isMobileActive.value = true
        nextTick(() => mobileInputRef.value?.focus())
    } else {
        isDesktopActive.value = true
        nextTick(() => inputRef.value?.focus())
    }
}
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
    if (isTypingElement(event.target)) return
    event.preventDefault()
    openSearch()
})
</script>

<style lang="scss" scoped>
.search-container {
    .search-desktop {
        display: flex;
        width: 220px;
        height: 45px;
        flex-direction: row-reverse;

        @media screen and (max-width: $screen-larger) {
            display: none;
        }

        .search-desktop-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            border-radius: 8px;
            transition: all .3s;

            &.active {
                background-color: white;

                .search-desktop-input {
                    width: 160px;
                }
            }

            .search-desktop-input {
                width: 0;
                transition: all .5s;
            }

            .icon-button {
                color: var(--text-color-200);
                padding: 10px;
                font-size: 23px;
            }

            .desktop-history {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                width: 240px;
                z-index: 30000;
            }
        }
    }

    .search-mobile {
        @media screen and (min-width: $screen-larger) {
            display: none;
        }

        .icon-button {
            padding: 0;
            font-size: 25px;
        }

        .search-mobile-card {
            width: 80vw;
            position: fixed;
            top: 90px;
            right: 10vw;
            border-radius: 15px;
            background-color: rgba($color: #ffffff, $alpha: 0.9);

            .search-mobile-input {
                height: 44px;
                background-color: rgba($color: #f1f1f1, $alpha: 0.9);
                border-radius: 8px;
                padding: 0 10px;
            }

            .search-result {
                margin-top: 10px;
            }
        }
    }
}
</style>
