<template>
    <!-- 80vh用于设置背景图展示的大小 -->
    <div class="header-bg"
        :style="{ height: coverStore.enterActive ? '80vh' : '100vh' }">
        <BackgroundImage :src="imgUrl">
            <div class="header-bg-wrapper" :class="wrapperAnimateClass">
                <!-- 左侧主内容 -->
                <div class="left-content">
                    <!-- 欢迎徽章 -->
                    <!-- <div class="welcome-badge">
                        <span class="badge-icon">🐟</span>
                        <span>欢迎光临我的小鱼塘</span>
                    </div> -->

                    <!-- 主标题 -->
                    <h1 class="main-title">KnockFish</h1>

                    <!-- 身份标签 -->
                    <div class="identity-tags">
                        <span class="tag">代码敲敲</span>
                        <span class="tag-divider">•</span>
                        <span class="tag">生活写写</span>
                        <span class="tag-divider">•</span>
                        <span class="tag">偶尔摸鱼</span>
                    </div>

                    <!-- 描述/寄语 -->
                    <p class="description">
                        <i-mdi-format-quote-open />
                        在这里记录我与代码的日常，分享技术踩坑与收获，<br />
                        偶尔也聊聊生活中的小确幸与小感悟。
                    </p>
                </div>

                <!-- 右侧内容 -->
                <div class="right-content">
                    <div class="right-inner">
                        <!-- 音乐组件：歌单/接口由这里传，组件本身不关心具体歌单 -->
                        <MusicCard :playlist-id="musicPlaylistId" :meting-api="metingApi || undefined" />
                    </div>
                </div>

                <!-- 向下滚动箭头 -->
                <div v-if="!coverStore.enterActive" class="arrow-bounce"
                    @click="coverStore.setEnterActive(true)">
                    <i-mdi-keyboard-arrow-down />
                </div>
            </div>
        </BackgroundImage>
    </div>
</template>

<script setup lang='ts'>
import { useCoverStore } from "@/store/modules/cover"

const coverStore = useCoverStore()
const imgUrl = new URL("@/assets/imgs/header-bg.webp", import.meta.url).href

/**
 * 音乐播放器的数据来源放在这里（站点配置层），组件本身只接受 props。
 * 歌单 id 不算敏感信息，可以直接写默认值；想临时换歌单改 .env.local 即可，不用动代码。
 *   VITE_MUSIC_PLAYLIST_ID=18584146744
 *   VITE_METING_API=https://api.injahow.cn/meting/
 */
const musicPlaylistId = import.meta.env.VITE_MUSIC_PLAYLIST_ID || '18584146744'
const metingApi = import.meta.env.VITE_METING_API || ''

// 首次入场（新标签/刷新/新开页面）时执行短距离从下往上的淡入；
// 状态与 markBgAnimated 持久化到 sessionStorage，每次新开标签才会重置再触发一次
const wrapperAnimateClass = computed(() => ({
    'animate__animated animate__fadeInUp-short': !coverStore.bgAnimated,
}))

onMounted(() => {
    if (!coverStore.bgAnimated) {
        // 动画播放完后标记已触发，后续同一 session 内不再重放
        const timer = window.setTimeout(() => {
            coverStore.markBgAnimated()
            window.clearTimeout(timer)
        }, 1100)
    }
})
</script>

<style lang="scss" scoped>
/* 字体由构建链路自动子集化并转为 woff2（原 ttf 合计 10.7MB，现约 504KB）。
   字库源文件保留在 src/assets/fonts/source/，改文案后无需手动操作：
   dev 与 build 启动时会自动重扫源码字符集，dev 下改文案还会增量重跑。 */
@font-face {
    font-family: 'ZCOOL KuaiLe';
    font-style: normal;
    font-weight: 400;
    src: url('@/assets/fonts/ZCOOLKuaiLe-Regular.woff2') format('woff2');
    font-display: swap;
}

@font-face {
    font-family: 'LeMiCookie';
    font-style: normal;
    font-weight: 400;
    src: url('@/assets/fonts/LeMiCookie.woff2') format('woff2');
    font-display: swap;
}

:global(.animate__fadeInUp-short) {
    -webkit-animation-name: fadeInUpShort;
    animation-name: fadeInUpShort;
}

@-webkit-keyframes fadeInUpShort {
    from {
        opacity: 0;
        -webkit-transform: translate3d(0, 20px, 0);
        transform: translate3d(0, 20px, 0);
    }

    to {
        opacity: 1;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }
}

@keyframes fadeInUpShort {
    from {
        opacity: 0;
        -webkit-transform: translate3d(0, 20px, 0);
        transform: translate3d(0, 20px, 0);
    }

    to {
        opacity: 1;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }
}

.header-bg {
    position: relative;
    width: 100%;
    transition: all 0.5s cubic-bezier(0.2, 0, 0.2, 1);
    overflow: hidden;
    box-sizing: border-box;

    .header-bg-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 100%;
        padding: 0 8%;
        gap: 40px;

        // 半透明遮罩，保证文字在背景图上的可读性
        // &::before {
        //     content: '';
        //     position: absolute;
        //     inset: 0;
        //     background: linear-gradient(
        //         90deg,
        //         rgba(0, 0, 0, 0.45) 0%,
        //         rgba(0, 0, 0, 0.25) 10%,
        //         rgba(0, 0, 0, 0.1) 50%
        //     );
        //     z-index: 0;
        // }
    }

    // ========== 左侧主内容 ==========
    .left-content {
        position: relative;
        z-index: 1;
        flex: 1;
        max-width: 680px;
        color: #fff;

        .welcome-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 16px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);

            .badge-icon {
                font-size: 16px;
            }
        }

        .main-title {
            font-family: 'ZCOOL KuaiLe', sans-serif;
            font-size: clamp(48px, 6vw, 74px);
            font-weight: bold;
            color: #fff;
            margin: 0 0 20px 0;
            line-height: 1.1;
            text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.4);
            letter-spacing: 2px;
        }

        .identity-tags {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
            font-size: 18px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 1px 2px 6px rgba(0, 0, 0, 0.3);

            .tag-divider {
                color: rgba(255, 255, 255, 0.6);
            }
        }

        .description {
            font-family: 'LeMiCookie', sans-serif;
            position: relative;
            font-size: 20px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
            max-width: 540px;
            text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
            padding-left: 30px;

            // 左引号图标：尺寸 36px，半透明，与文字首行基线顶端对齐
            >.svg-icon {
                position: absolute;
                left: 0;
                top: 0;
                font-size: 25px;
                line-height: 1;
                color: rgba(255, 255, 255, 0.45);
            }
        }
    }

    // ========== 右侧内容 ==========
    .right-content {
        position: relative;
        // 必须高于波浪装饰（.wave 是 z-index:1000）：这里的 z-index 会创建层叠上下文，
        // 若仍是 1，音乐卡片的播放列表（内部 z-index 1001）会被波浪盖住。
        // 顶部导航栏是 20000，仍在其上，不会挡住导航。
        z-index: 1001;
        // flex: 0 0 340px;
        display: flex;
        justify-content: flex-end;

        .right-inner {
            // width: 100%;
            max-width: 300px;
            position: relative;

            :deep(.miku) {
                position: absolute;
                top: -85px;
                right: 0;
            }
        }
    }

    // 箭头弹跳样式
    .arrow-bounce {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 48px;
        color: #fff;
        cursor: pointer;
        z-index: 2;
        animation: arrowBounce 2s infinite ease-in-out;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);

        &:hover {
            opacity: 0.7;
        }
    }
}

// 上下弹跳关键帧动画
@keyframes arrowBounce {

    0%,
    100% {
        transform: translateX(-50%) translateY(0);
    }

    50% {
        transform: translateX(-50%) translateY(14px);
    }
}

// 中等屏幕
@media screen and (max-width: 1100px) {
    .header-bg {
        .header-bg-wrapper {
            padding: 0 5%;
            gap: 24px;
        }

        .right-content {
            .quote-block .quote-mark {
                font-size: 36px;
            }

            .quote-block .quote-text {
                font-size: 14px;
            }
        }

        .left-content {
            .identity-tags {
                font-size: 16px;
                gap: 8px;
            }

            .description {
                font-size: 15px;
            }
        }
    }
}

// ========== 响应式：移动端 ==========
@media screen and (max-width: 768px) {
    .header-bg {
        .header-bg-wrapper {
            &::before {
                background: linear-gradient(180deg,
                        rgba(0, 0, 0, 0.5) 0%,
                        rgba(0, 0, 0, 0.3) 50%,
                        rgba(0, 0, 0, 0.1) 100%);
            }
        }

        .left-content {
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            .welcome-badge {
                margin-bottom: 16px;
            }

            .main-title {
                font-size: clamp(36px, 10vw, 52px);
                margin-bottom: 16px;
            }

            .identity-tags {
                font-size: 15px;
                margin-bottom: 20px;
            }

            .description {
                font-size: 14px;
                margin-bottom: 20px;
                max-width: 100%;
            }
        }

        .right-content {
            display: none;
            flex: none;
            width: 100%;
            max-width: 320px;
            justify-content: center;


            .stats .stat-item .stat-num {
                font-size: 20px;
            }
        }

        .arrow-bounce {
            font-size: 36px;
            bottom: 20px;
        }
    }
}

// 暗黑模式适配
html.dark .header-bg {
    .header-bg-wrapper::before {
        background: linear-gradient(90deg,
                rgba(0, 0, 0, 0.6) 0%,
                rgba(0, 0, 0, 0.4) 50%,
                rgba(0, 0, 0, 0.15) 100%);
    }
}
</style>
