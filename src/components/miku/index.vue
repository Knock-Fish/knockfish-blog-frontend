<template>
    <div class="miku"></div>
</template>

<script setup lang='ts'>
import { } from 'vue'

</script>

<style lang="scss" scoped>
.miku {
    width: 100px;
    height: 100px;
    background: url("../../assets/imgs/39.webp") no-repeat;
    background-size: 800px 100px;
    overflow: hidden;
    animation: m .8s steps(8) infinite;
}

@keyframes m {
    0% {}

    100% {
        background-position: -800px 0;
    }
}


</style>