<template>
    <IconifyIcon
        class="svg-icon"
        :icon="icon"
        :width="size"
        :height="size"
        :color="color"
        :style="customStyle"
    />
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
interface Props {
    icon: string
    size?: number | string
    color?: string
    customStyle?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
    size: "1em",
    color: 'currentColor'
})
</script>
<style lang="scss" scoped>
.svg-icon{
    display: inline-flex;
    overflow: hidden;
    outline: none;
    vertical-align: 1em;
}
</style>