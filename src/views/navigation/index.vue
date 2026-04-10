<template>
    <div class="navigation">
        <div class="left-bar">
            <CategoryBar :category-anchor="categoryAnchor"/>
        </div>
        <div class="right-bar">
            <Site :category-data="categoryData"/>
        </div>
    </div>
</template>

<script setup lang='ts'>
import CategoryBar from './widget/Category.vue'
import Site from './widget/Site.vue'
import { CategoryService } from "@api/categoryApi"
defineOptions({ name: 'Navigtion' })
type Category = Api.Category.CategoryInfo
interface CategoryAnchor {
    categoryId: number
    categoryName: string
}
// 类别以及网站数据
const categoryData = ref<Category[]>([])
// 类别锚点
const categoryAnchor = ref<CategoryAnchor[]>([])
// 调用接口获取
const getCategoryWithSites = async () => {
    const category = await CategoryService.getAllCategoryWithSites()
    // 获取类别以及网站
    categoryData.value = category.list
    // 获取类别锚点
    categoryAnchor.value = categoryData.value.map((item: Category) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName
    }))
}
onMounted(() => {
    getCategoryWithSites()
})
</script>

<style lang="scss" scoped>
.navigation {
    display: flex;
    box-sizing: border-box;
    gap: 15px;

    .left-bar {
        min-height: 200px;

        @media screen and (max-width: $screen-larger) {
            display: none;
        }
    }

    .right-bar {
        width: 90%;

        @media screen and (max-width: $screen-larger) {
            width: 100%;
            // margin: 0 15px;
        }
    }
}
</style>