<template>
  <RouterView />
  <Live2dWidget v-if="isReady" />
</template>

<script setup lang='ts'>
import { defineAsyncComponent, ref, nextTick, onMounted } from 'vue'

const Live2dWidget = defineAsyncComponent(() => import('@comps/live2d-widget/index.vue'))

const isReady = ref(false)

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    isReady.value = true
  }, 100)
})
</script>

<style lang="scss" scoped></style>