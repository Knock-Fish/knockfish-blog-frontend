<template>
    <div class="home">
        <div class="left-bar">
            <div style="height: 300px;">
                <Desctiptio />
            </div>
            <Tags />
        </div>
        <div class="middle-article-list">
            <ArticleList />
        </div>
    </div>
</template>

<script setup lang='ts'>
import Desctiptio from "./widget/Descriptio.vue"
import Tags from "./widget/Tags.vue"
import ArticleList from "./widget/ArticleList.vue"
import { useCoverStore } from "@/store/modules/cover"
defineOptions({ name: 'Home' })
const coverStore = useCoverStore()
const { y } = useWindowScroll()

if (!coverStore.enterActive) {
  watch(y, (scrollY) => {
    if (scrollY > 1) {
      coverStore.setEnterActive(true)
    }
  }, { once: true })
}
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
        width: 290px;
        display: flex;
        flex-direction: column;
    }

    .middle-article-list {
        width: 100%;
    }

    @media screen and (max-width: $screen-medium) {
        width: 100%;
        flex-direction: column;

        .left-bar,
        .middle-article-list {
            width: 90%;
            // width: 90%;
            margin: 0 auto;
        }
    }
}
</style>