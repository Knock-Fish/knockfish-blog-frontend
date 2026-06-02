<template>
    <div class="home">
        <div class="left-bar">
            <Desctiptio />
            <!-- <Tags /> -->
        </div>
        <div class="middle-article-list">
            <ArticleList />
        </div>
    </div>
</template>

<script setup lang='ts'>
import Desctiptio from "./widget/Descriptio.vue"
import Tags from "./widget/Tags.vue"
import ArticleList from "./widget/ArticleList.vue";
defineOptions({ name: 'Home' })
</script>

<style lang="scss" scoped>
.home {
    display: flex;
    max-width: 1000px;
    box-sizing: border-box;
    margin: 0 auto;
    justify-content: center;
    box-sizing: border-box;
    gap: 15px;

    .left-bar {
        min-width: 200px;
        display: flex;
        flex-direction: column;
        // align-self: start;
        gap: 15px;
    }

    @media screen and (max-width: $screen-medium) {
        width: 100%;
        flex-direction: column-reverse;

        .left-bar,
        .middle-article-list {
            width: 90%;
            margin: 0 auto;
        }
    }
}
</style>