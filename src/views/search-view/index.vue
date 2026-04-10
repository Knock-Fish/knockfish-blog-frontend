<template>
    <div class="search-view">
        <div class="search-result">
            <div style="margin-bottom: 20px;">
                <h3>相关文章：{{keyword}}</h3>
            </div>
            <ElCard v-for="item in articleList">
                <div>{{item.title}}</div>
                <div>{{item.description}}</div>
                <time>时间：{{item.publishTime}}</time>
            </ElCard>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ArticleService } from "@api/articleApi"
type Article = Api.Article.ArticleInfo
const route = useRoute()
const keyword = ref<string>('')
const articleList = ref<Article[]>([])
const page = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
})
/** 获取文章列表 */
const getArticleData = () => {
    ArticleService.getAllArticleWithTags({
        title: keyword.value,
        pageNum: page.pageNum,  // 当前页码
        pageSize: page.pageSize,    // 每页条数
    }).then((data) => {
        articleList.value = data.list
        page.total = data.total
    })
}
watch(() => route.query.keyword,
    (newKeyword) => {
        keyword.value = (newKeyword as string) || ''
        page.pageNum = 1
        getArticleData()
    })
onMounted(() => {
    keyword.value = (route.query.keyword as string) || ''
    getArticleData()
})
</script>

<style lang="scss" scoped>
.search-view {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;

    .search-result {
        width: 80%;
        height: 500px;
        padding: 20px;
        @include frosted-glass;
        // background-color: #fff;

        .el-card {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            @include frosted-glass;
        }
    }
}
</style>