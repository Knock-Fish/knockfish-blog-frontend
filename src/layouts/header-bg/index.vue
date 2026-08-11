<template>
    <div class="header-bg" :style="{ height: coverStore.enterActive ? '70vh' : '100vh' }">
        <BackgroundImage :src="imgUrl">
            <div class="header-bg-wrapper">
                <div>
                    <div class="message">
                        KnockFish's blog
                    </div>
                    <span class="slogan" ref="typedElement"></span>
                </div>
                <!-- 新增 arrow-bounce 类名 -->
                <div 
                    v-if="!coverStore.enterActive" 
                    class="arrow-bounce"
                    @click="coverStore.setEnterActive(true)"
                >
                    <SvgIcon icon="mdi:keyboard-arrow-down"/>
                </div>
            </div>
        </BackgroundImage>
    </div>
</template>

<script setup lang='ts'>
import Typed from 'typed.js'
import { useCoverStore } from "@/store/modules/cover"
const coverStore = useCoverStore()
const imgUrl = new URL("@/assets/imgs/header-bg.webp", import.meta.url).href

const typedElement = ref(null)
let typed: null | Typed = null

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
    position: relative;
    width: 100%;
    transition: all 0.5s cubic-bezier(0.2, 0, 0.2, 1);
    overflow: hidden;
    text-align: center;
    box-sizing: border-box;

    .header-bg-wrapper {
        position: relative;
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

        // 箭头弹跳样式
        .arrow-bounce {
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 70px;
            color: #fff;
            cursor: pointer;
            // 循环跳动动画
            animation: arrowBounce 2s infinite ease-in-out;

            &:hover {
                opacity: 0.7;
            }
        }
    }
}

// 上下弹跳关键帧动画
@keyframes arrowBounce {
    0%, 100% {
        transform: translateX(-50%) translateY(0);
    }
    50% {
        transform: translateX(-50%) translateY(14px);
    }
}
</style>