<template>
    <ElTimeline>
        <ElTimelineItem v-for="acticle in acticles"
            :key="acticle.articleId" :timestamp="acticle.publishTime.split(' ')[0]">
            <div class="content">
                <div class="title" @click="handleArticleDetail(acticle.articleId)">
                    {{ acticle.title }}
                </div>
                <div class="tags">
                    <ElPopover width="170">
                        <div>
                            <ElTag style="margin: 5px;"
                                v-for="tag in acticle.tags" :color="tag.color"
                                effect="light" :key="tag.tagId">
                                {{ tag.tagName }}
                            </ElTag>
                        </div>
                        <template #reference>
                            <ElTag color="#978B8B">{{ acticle.tags?.length
                                }}个标签
                            </ElTag>
                        </template>
                    </ElPopover>
                </div>
            </div>
        </ElTimelineItem>
    </ElTimeline>
</template>

<script setup lang='ts'>
type Article = Api.Article.ArticleInfo
import { ArticleService } from "@api/articleApi"
const router = useRouter()
const acticles = ref<Article[]>([])
ArticleService.getArticleTimeline().then((data) => {
    acticles.value = data.list
})
const handleArticleDetail = (articleId: number) => {
    router.push({
        name: 'ArticleDetail',
        params: {
            id: articleId
        }
    })
}

</script>

<style lang="scss" scoped>
.el-timeline {
    .el-timeline-item {
        .content {
            display: flex;
            gap: 10px;
            cursor: pointer;
            .title {
                &:hover {
                    border-bottom: solid 1px var(--text-color-100);
                }
            }
        }
    }
}
</style>