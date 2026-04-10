<template>
    <div class="page-bg">
        <BackgroundImage :src="backgroundImageUrl" :activeIndex="currentIndex">
        </BackgroundImage>
    </div>
</template>

<script setup lang='ts'>
const darkBgUrl = new URL("@imgs/page-bg-dark.png", import.meta.url).href
const lightBgUrl = new URL("@imgs/page-bg.webp", import.meta.url).href
const backgroundImageUrl = ref([lightBgUrl, darkBgUrl])
const currentIndex = ref(0)
const isDark = useDark()
watch(isDark, () => {
    if (isDark.value) {
        currentIndex.value = 1
    } else {
        currentIndex.value = 0
    }
})
onBeforeMount(() => {
    currentIndex.value = isDark.value ? 1 : 0
})
</script>

<style lang="scss" scoped>
.page-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -2;
}
</style>