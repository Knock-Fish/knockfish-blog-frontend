<template>
    <ElCard>
        <template #header>
            <span class="title">标签</span>
        </template>
        <div class="tags">
            <ElTag v-for="item in tags" 
            :color="item.color" 
            effect="light" 
            :key="item.tagId">
                {{item.tagName}}
            </ElTag>
        </div>
    </ElCard>
</template>

<script setup lang='ts'>
import { TagService } from "@api/tagApi"
type Tag = Api.Tag.TagInfo
const tags = ref<Tag[]>([])
TagService.getTagInfo().then((data) => {
    tags.value = data.list
})
</script>

<style lang="scss" scoped>
    .el-card{
        @include frosted-glass;
        :deep(.el-card__header){
            padding: 10px;
        }
        .title{
            padding-left: 5px;
            border-left: 5px solid #01EAA1;
        }
        .tags{
            .el-tag{
                margin: 5px;
            }
        }
    }
</style>