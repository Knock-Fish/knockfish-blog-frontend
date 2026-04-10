<template>
    <div class="site" v-for="value in categoryData" :key="value.categoryId">
        <ElCard>
            <div class="card">
                <div class="title" :id="value.categoryName">
                    {{ value.categoryName }}
                </div>
                <div class="nav">
                    <a class="link" :href="item.url" target="_blank"
                        v-for="item in value.sites" :key="item.siteId">
                        <ElCard class="nav-item" shadow="hover">
                            <div class="top-container">
                                <img v-lazy="item.ico" class="ico">
                                <div class="text">
                                    <p class="site-name">{{ item.siteName }}</p>
                                    <p class="description">{{ item.description
                                        }}</p>
                                </div>
                            </div>
                            <div class="bottom-container">

                            </div>
                        </ElCard>
                    </a>
                </div>
            </div>
        </ElCard>
    </div>
</template>

<script setup lang='ts'>
type Category = Api.Category.CategoryInfo
interface Props {
    categoryData: Category[]
}
const props = defineProps<Props>()

</script>

<style lang="scss" scoped>
.site {
    margin-bottom: 15px;

    .el-card {
        @include frosted-glass;

        .card {
            box-sizing: border-box;

            .title {
                padding: 10px;
                // font-size: 24px;
                font-weight: bold;
            }

            .nav {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;

                .link {
                    box-sizing: border-box;

                    .nav-item {
                        border-radius: 7px;
                        min-height: 70px;
                        // min-width: 223px;
                        border: 1px solid var(--border-color);

                        .top-container {
                            display: flex;

                            .ico {
                                width: 32px;
                                height: 32px;
                                vertical-align: middle;
                            }

                            .text {
                                margin-left: 10px;

                                .site-name {
                                    font-size: 14px;
                                    font-weight: bold;
                                    color: var(--text-color-400);
                                    vertical-align: middle;
                                }

                                .description {
                                    font-size: 12px;
                                    color: var(--text-color-200);

                                }
                            }

                        }
                    }
                }

                @media screen and (min-width: 900px) and (max-width: $screen-larger) {
                    grid-template-columns: repeat(4, 1fr);
                }

                @media screen and (min-width: $screen-medium) and (max-width: 900px) {
                    grid-template-columns: repeat(3, 1fr);
                }

                @media screen and (max-width: $screen-medium) {
                    grid-template-columns: repeat(2, 1fr);
                }

                @media screen and (max-width: $screen-small) {
                    grid-template-columns: repeat(1, 1fr);
                }
            }
        }
    }
}
</style>