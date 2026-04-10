<template>
    <div class="home">
        <div class="left-bar">
            <Desctiptio />
            <Tags />
        </div>
        <div class="middle-article-list">
            <ArticleList />
        </div>
        <div class="right-bar">

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
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    gap: 15px;

    .left-bar {
        display: flex;
        flex-direction: column;
        align-self: start;
        width: 250px;
        gap: 15px;
    }

    .right-bar {
        width: 250px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    @media screen and (max-width: $screen-medium) {
        width: 100%;
        flex-direction: column-reverse;

        .left-bar {
            width: 90%;
            margin: 0 auto;
        }

        .middle-article-list {
            width: 90%;
        }
    }
}
</style>