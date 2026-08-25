<template>
    <!-- 外层 Transition 控制下拉动画 -->
    <Transition name="header-drop">
        <header ref="headerBar" v-if="coverStore.enterActive"
            :class="['header-bar', { 'frosted-glass': isScrolled }]">
            <div class="left-bar">
                <div class="logo" @click="handleHome">KnockFish</div>
                <!-- 水平菜单 - 桌面端显示 -->
                <Menu class="menu-horizontal" :menu-item="menuItem" />
            </div>

            <div class="header-actions">
                <div class="search-bar">
                    <SearchBar v-model="keyword" @enter-desktop="handleSearch"
                        @enter-mobile="handleSearch" />
                </div>
                <!-- 暗黑模式 -->
                <div class="dark-btn" @click="toggleDark()">
                    <ElIcon>
                        <SvgIcon icon="mdi:weather-night" />
                    </ElIcon>
                </div>
                <!-- 移动端菜单按钮 -->
                <div class="hamburger-btn" @click.stop="toggleMenu">
                    <ElIcon>
                        <SvgIcon :icon="isShow ? 'mdi:close' : 'mdi:menu'" />
                    </ElIcon>
                </div>
            </div>
            <!-- 移动端垂直菜单 -->
            <Transition name="slide-down">
                <div v-show="isShow" ref="menuRef" class="menu-vertical"
                    @click.stop>
                    <Menu menu-mode="vertical" :menu-item="menuItem" @select="toggleMenu"/>
                </div>
            </Transition>
        </header>
    </Transition>
</template>

<script setup lang="ts">
import { useCoverStore } from "@/store/modules/cover"
import { useRouter } from 'vue-router'

const coverStore = useCoverStore()
const router = useRouter()
// 搜索词
const keyword = ref<string>('')
// 是否隐藏移动端垂直菜单
const isShow = ref(false)
// 是否添加毛玻璃效果
const isScrolled = ref(false)
// 响应式布尔值，表示当前是否暗黑模式
const isDark = useDark()
// 切换函数
const toggleDark = useToggle(isDark)
// 移动端菜单DOM
const menuRef = useTemplateRef('menuRef')
// 获取窗口y滑动距离
const { y } = useWindowScroll()
// 菜单项数据
const menuItem = reactive([
    { id: 1, name: "首页", path: "/home", icon: "mdi:home" },
    { id: 2, name: "友链", path: "/link", icon: "mdi:package-variant" },
    { id: 3, name: "归档", path: "/archive", icon: "mdi:cog" },
    { id: 4, name: "导航", path: "/navigation", icon: "mdi:information-outline" },
    { id: 5, name: "关于", path: "/about", icon: "mdi:email" },
])
const handleHome = () => {
    router.push({ name: 'Home' })
}
// 点击其他区域关闭菜单项
onClickOutside(menuRef, () => {
    if (isShow.value) {
        isShow.value = false
    }
})
const handleSearch = () => {
    if (keyword.value.trim()) {
        router.push({
            name: 'SearchView',
            query: {
                keyword: keyword.value.trim()
            }
        })
    }
}
// 监听滚动位置变化，执行回调
watch(y, (newY) => {
    isScrolled.value = newY > 150
})
// 切换菜单显示状态
const toggleMenu = () => {
    isShow.value = !isShow.value
}
</script>

<style lang="scss" scoped>
$header-height: 60px;
$menu-width: 200px;
$transition-duration: 0.3s;
$header-drop-time: 0.6s;

// 顶部图标按钮通用样式：hover 仅切换文字色，与菜单项激活色 rgb(249,81,115) 保持一致
@mixin header-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    color: var(--text-color-200);
    background: transparent;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: rgb(249, 81, 115);
    }
}

.header-bar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20000;
    height: $header-height;
    padding: 0 20px;
    align-items: center;
    justify-content: space-around;
    transition: all $transition-duration ease;

    &.frosted-glass {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .left-bar {
        display: flex;
        align-items: center;

        .logo {
            font-family: "logo-font", sans-serif;
            font-weight: bold;
            font-size: 18px;
            color: transparent;
            background: linear-gradient(50deg, blue, rgb(208, 0, 255), orange, red, yellow);
            -webkit-background-clip: text;
            background-clip: text;
            flex-shrink: 0;
            cursor: pointer;
        }
    }

    .header-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;

        .search-bar {
            flex-shrink: 0;

            // 搜索按钮：与暗黑按钮共用同一套滑动样式
            :deep(.icon-button) {
                @include header-icon-btn;
            }
        }

        .dark-btn {
            @include header-icon-btn;
            font-size: 20px;
        }

        .hamburger-btn {
            display: none;
            flex-shrink: 0;
            font-size: 20px;
            color: var(--text-color-200);

            &:hover {
                color: #000;
            }
        }
    }

    .menu-vertical {
        position: absolute;
        top: $header-height;
        right: 0;
        width: $menu-width;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    /* 移动端样式 */
    @media screen and (max-width: $screen-medium) {
        justify-content: space-between;

        .left-bar {
            .menu-horizontal {
                display: none;
            }

        }

        .header-actions {
            .hamburger-btn {
                display: block;
            }
        }
    }
}

// ========== 头部下拉入场动画 ==========
.header-drop-enter-active {
    transition: all $header-drop-time cubic-bezier(0.2, 0, 0.2, 1);
}
// 进入初始状态：完全上移隐藏，透明
.header-drop-enter-from {
    opacity: 0;
    transform: translateY(-100%);
}
// 进入结束状态
.header-drop-enter-to {
    opacity: 1;
    transform: translateY(0);
}

/* 原有菜单下拉动画 */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all $transition-duration ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>