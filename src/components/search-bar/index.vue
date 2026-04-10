<template>
    <div class="search-container">
        <!-- PC端搜索框 -->
        <div class="search-desktop">
            <div class="search-desktop-wrapper"
                :class="{ active: isDesktopActive }">
                <ElInput ref="inputRef" class="search-desktop-input"
                    @blur="handleFocus" v-model="keyword" type="text"
                    @keyup.enter.native="handleDesktopSearch"
                    placeholder="搜索什么……" />
                <ElButton class="icon-button" @click="toggle">
                    <SvgIcon icon="mdi:search"
                        :color="isDesktopActive ? '#cecece' : ''" />
                </ElButton>
            </div>
        </div>
        <!-- 移动端搜索框 -->
        <div class="search-mobile">
            <ElButton class="icon-button"
                @click.stop="isMobileActive = !isMobileActive">
                <SvgIcon icon="mdi:search"
                    :color="isMobileActive ? '#cecece' : '#414141'" />
            </ElButton>
            <div ref="cardRef">
                <Transition 
                enter-active-class="animate__animated animate__fadeInDown"
                leave-active-class="animate__animated animate__fadeOutDown">
                    <ElCard class="search-mobile-card" 
                        v-show="isMobileActive">
                        <ElInput class="search-mobile-input" size="large"
                            @keyup.enter.native="handleMobileSearch"
                            v-model="keyword" type="text"
                            placeholder="搜索什么……" />
                        <div class="search-result">
                        </div>
                    </ElCard>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
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
const handleFocus = () => {
    setTimeout(() => isDesktopActive.value = false, 100)
}
// 搜索框卡片DOM
const cardRef = useTemplateRef('cardRef')
// 点击其他区域关闭搜索框
onClickOutside(cardRef, () => {
    if (isMobileActive.value) {
        isMobileActive.value = false
    }
})
const handleDesktopSearch = () => {
    emit('enter-desktop')
    toggle()
    keyword.value = ''
}
const handleMobileSearch = () => {
    emit('enter-mobile')
    isMobileActive.value = false
    keyword.value = ''
}
</script>

<style lang="scss" scoped>
.search-container {
    .search-desktop {
        display: flex;
        // width: 220px;
        height: 45px;
        flex-direction: row-reverse;

        @media screen and (max-width: $screen-larger) {
            display: none;
        }

        .search-desktop-wrapper {
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
        }
    }
}
</style>