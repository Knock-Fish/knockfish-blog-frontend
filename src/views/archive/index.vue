<template>
    <div class="archive">
        <div class="timeline-article">
            <ElCard>
                <template #header>
                    <div>文章时间轴</div>
                </template>
                <Timeline />
            </ElCard>
        </div>
    </div>
</template>

<script setup lang='ts'>
import Timeline from './widget/Timeline.vue';
defineOptions({ name: 'Archive' })
</script>

<style lang="scss" scoped>
.archive {
    box-sizing: border-box;

    .timeline-article {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-card {
            width: 80%;
            @include frosted-glass;

            :deep(.el-card__body) {
                padding: 20px 0;
            }
            @media screen and (max-width: $screen-larger){
                width: 100%;
            }
        }
    }
}
</style>