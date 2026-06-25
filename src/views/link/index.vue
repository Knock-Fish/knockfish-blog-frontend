<template>
    <div class="link">
        <div class="link-list">
            <a target="_blank" class="link-main" v-for="link in linkData" :key="link.linkId">
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
        <!-- <div class="link-apply">
            <h2>申请提示</h2>
            <p>名称：knockfish</p>
            <p>描述：一条鱼</p>
            <p>头像：https://img.cn/avatar.jpg</p>
            <p>链接：https://img.cn/avatar.jpg</p>
        </div> -->
    </div>
</template>

<script setup lang='ts'>
defineOptions({ name: 'Link' })
const linkData = ref([
    {
        linkId: 1,
        linkName: "张三",
        description: "我是张三",
        linkUrl: "www.baidu.com",
        avatar: "https://fishbarn.cn/blog/avatar/fish.png"
    },
    {
        linkId: 2,
        linkName: "李四",
        description: "我是李四",
        linkUrl: "www.baidu.com",
        avatar: "https://fishbarn.cn/blog/avatar/fish.png"
    },
])
</script>

<style lang="scss" scoped>
.link {
    // display: flex;
    // position: relative;
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;

    .link-list {
        flex: 1;
        display: grid;
        // 响应式网格：每行自动填充，最小宽度280px
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px; // 网格间距

        .link-main {
            display: inline-flex;
            align-items: center; // 垂直居中
            gap: 15px;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            transition: all 0.3s ease;
            cursor: pointer;

            .avatar {
                flex-shrink: 0; // 防止头像被压缩
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
                min-width: 0; // 防止文本溢出

                .link-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-color-100);
                }

                .link-desc {
                    font-size: 13px;
                    color: #8c8c8c;
                    margin-top: 4px; // 调整间距
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }

    // .link-apply {
    //     position: sticky;
    //     top: 100px;
    //     height: 100%;
    // }
}

// 移动端适配
@media (max-width: 768px) {
    .link {
        padding: 12px;

        .link-list {
            grid-template-columns: 1fr; // 移动端单列
            gap: 12px;

            .link-main {
                padding: 12px 16px;
            }
        }
    }
}
</style>