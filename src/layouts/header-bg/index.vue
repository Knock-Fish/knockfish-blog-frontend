<template>
    <div class="header-bg">
        <BackgroundImage :src="backgroundImageUrl" :activeIndex="currentIndex">
            <div class="header-bg-wrapper">
                <div>
                    <div class="message">
                        KnockFish's blog
                    </div>
                    <span class="slogan" ref="typedElement"></span>
                </div>
            </div>
        </BackgroundImage>
    </div>
</template>

<script setup lang='ts'>
import Typed from 'typed.js'
// 响应式布尔值，表示当前是否暗黑模式
const isDark = useDark()
// 背景图（header-bg-dark.webp/header-bg-light.webp）
const darkBgUrl = new URL("@imgs/header-bg-dark.webp", import.meta.url).href
const lightBgUrl = new URL("@imgs/header-bg-light.webp", import.meta.url).href

// 响应式背景图URL
const backgroundImageUrl = ref([lightBgUrl, darkBgUrl])

const currentIndex = ref(0)
watch(isDark, () => {
    if (isDark.value) {
        currentIndex.value = 1
    } else {
        currentIndex.value = 0
    }
})
const typedElement = ref(null)
let typed: null | Typed = null
onBeforeMount(() => {
    currentIndex.value = isDark.value ? 1 : 0
})
onMounted(() => {
    typed = new Typed(typedElement.value, {
        strings: ['你好，欢迎来到鱼的博客', '在此记录自己的所遇'],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
        cursorChar: '|',
    })
})

onBeforeUnmount(() => {
    typed?.destroy()
})
</script>

<style lang="scss" scoped>
.header-bg {
    width: 100%;
    height: 70vh;
    overflow: hidden;
    text-align: center;
    box-sizing: border-box;

    .header-bg-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        opacity: 0.9;

        >div {
            min-height: 150px;
        }

        .message {
            font-family: "logo-fonts";
            font-size: clamp(40px, 1vw + 12px, 60px);
            font-weight: bold;
            color: rgb(255, 255, 255);
            text-shadow: 2px 2px 5px #a2a2a2;
            white-space: nowrap;
        }

        .slogan {
            display: inline-block;
            font-size: 25px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 5px #a2a2a2;
            white-space: nowrap;
        }
    }
}
</style>