<template>
    <div class="archive-layout">
        <!-- 左侧菜单 -->
        <ArchiveMenu class="archive-menu-pc" v-show="!drawer"
            @menu-select="handleMenuChange" />
        <ElDrawer v-model="drawer" direction="ltr" :with-header="false"
            size="300">
            <ArchiveMenu @menu-select="handleMenuChange" />
        </ElDrawer>
        <div class="left-btn" @click="drawer = true">
            <i-mdi-menu-right />
        </div>
        <!-- 主内容区 -->
        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>
    </div>
</template>

<script setup lang="ts">
import ArchiveMenu from './widget/ArchiveMenu.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref<boolean>(false)
const { width } = useWindowSize()

watch(width, (val) => {
    if (val >= 900) drawer.value = false
})

const handleMenuChange = (menuKey: string) => {
    router.push(menuKey)
    drawer.value = false
}

defineOptions({ name: 'Archive' })
</script>

<style lang="scss" scoped>
.archive-layout {
    display: flex;
    width: 100%;

    .archive-menu-pc {
        position: sticky;
        top: 90px;
        left: 0;
    }

    .left-btn {
        position: fixed;
        bottom: 100px;
        left: -5px;
        width: 20px;
        height: 50px;
        display: none;
        align-items: center;
        border: 2px solid var(--border-color);
        border-left: none;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            transform: translateX(5px);
        }
    }

    .main-content {
        flex: 1;
        width: 80%;
    }

    @media screen and (max-width: 900px) {
        .archive-menu-pc {
            display: none;
        }
        .left-btn{
            display: flex;
        }

        .main-content {
            width: 100%;
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>