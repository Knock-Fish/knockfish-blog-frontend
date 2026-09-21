<template>
    <div ref="container" class="sakana-box"></div>
</template>

<script setup lang="ts">
import SakanaWidget from 'sakana-widget'

const container = ref<HTMLDivElement | null>(null)
let sakanaInstance: SakanaWidget | null = null

onMounted(async () => {
  await nextTick()
  if (!container.value) return

  // 初始化配置项
  sakanaInstance = new SakanaWidget({
    character: 'chisato', // chisato / takina
    controls: true,       // 是否显示底部控制面板
    
    size: 200,
    // autoFit: true,
    saveState: false
  })

  sakanaInstance.mount(container.value)
})

// 组件销毁时卸载实例，防止内存泄露
onUnmounted(() => {
  if (sakanaInstance) {
    sakanaInstance.unmount()
    sakanaInstance = null
  }
})
</script>

<style scoped>
.sakana-box {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 20000;
}
</style>
