<template>
    <div class="link">
        <div class="link-list">
            <a target="_blank" class="link-main" v-for="link in linkData" :key="link.linkId" :href="link.linkUrl">
                <span class="avatar">
                    <img :src="link.avatar"
                        alt="">
                </span>
                <span class="link-info">
                    <span class="link-name">{{link.linkName}}</span>
                    <span class="link-desc">{{link.description}}</span>
                </span>
            </a>
        </div>
        <div v-if="loading" class="loading">
            <img src="@/assets/imgs/loading.gif" alt="加载中">
        </div>
        <div v-if="!loading && linkData.length === 0" class="empty">
            暂无友链
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { LinkService } from '@/api/linkApi'

defineOptions({ name: 'Link' })

const linkData = ref<Api.Link.LinkInfo[]>([])
const loading = ref(true)

onMounted(async () => {
    try {
        const data = await LinkService.getLinkList()
        linkData.value = data
    } catch (error) {
        console.error('获取友链列表失败:', error)
        linkData.value = []
    } finally {
        loading.value = false
    }
})
</script>

<style lang="scss" scoped>
.link {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;

    .link-list {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;

        .link-main {
            display: inline-flex;
            align-items: center;
            gap: 15px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            transition: all 0.3s ease;
            cursor: pointer;

            .avatar {
                flex-shrink: 0;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                }
            }

            .link-info {
                display: inline-flex;
                flex-direction: column;
                flex: 1;
                min-width: 0;

                .link-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-color-100);
                }

                .link-desc {
                    font-size: 13px;
                    color: #8c8c8c;
                    margin-top: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        img {
            width: 40px;
            height: 40px;
        }
    }

    .empty {
        text-align: center;
        color: #8c8c8c;
        padding: 40px;
    }
}

@media (max-width: 768px) {
    .link {
        padding: 12px;

        .link-list {
            grid-template-columns: 1fr;
            gap: 12px;

            .link-main {
                padding: 12px 16px;
            }
        }
    }
}
</style>