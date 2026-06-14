<template>
  <!-- 骨架屏 -->
  <div v-if="loading">
    <!-- 模拟2组分类区块，和真实结构一致 -->
    <ElSkeleton v-for="cateIdx in 2" :key="cateIdx" animated class="site skeleton-site">
      <template #template>
        <div class="card">
          <!-- 分类标题骨架 -->
          <ElSkeletonItem variant="text" class="skeleton-cate-title" />
          <!-- 网格容器 -->
          <div class="nav skeleton-nav">
            <!-- 单张站点卡片骨架，按最大列数生成 -->
            <ElSkeletonItem 
              v-for="itemIdx in 5" 
              :key="itemIdx"
              variant="rect" 
              class="skeleton-nav-item"
            >
              <div class="top-container">
                <ElSkeletonItem variant="rect" class="skeleton-ico" />
                <div class="text">
                  <ElSkeletonItem variant="text" class="skeleton-name" />
                  <ElSkeletonItem variant="text" class="skeleton-desc" />
                </div>
              </div>
            </ElSkeletonItem>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>

  <!-- 真实内容 -->
  <div v-else class="site" v-for="value in categoryData" :key="value.categoryId">
    <div class="card">
      <div class="title" :id="value.categoryName">
        {{ value.categoryName }}
      </div>
      <div class="nav">
        <a class="link" :href="item.siteUrl" target="_blank"
          v-for="item in value.sites" :key="item.siteId">
          <div class="nav-item" shadow="hover">
            <div class="top-container">
              <img v-lazy="item.ico" class="ico">
              <div class="text">
                <p class="site-name">{{ item.siteName }}</p>
                <p class="description">{{ item.description }}</p>
              </div>
            </div>
            <div class="bottom-container"></div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
type Category = Api.Category.CategoryInfo
interface Props {
  categoryData: Category[]
  loading: boolean
}
const props = defineProps<Props>()

</script>

<style lang="scss" scoped>
.site {
  margin-bottom: 15px;

  .card {
    box-sizing: border-box;

    .title {
      padding: 10px;
      font-weight: bold;
    }

    .nav {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;

      .link {
        display: block;
        width: 100%;
        height: 100%;
        text-decoration: none;
        cursor: pointer;
      }

      .nav-item {
        box-sizing: border-box;
        display: flex;
        padding: 5px 10px;
        border-radius: 7px;
        height: 70px;
        border: 1px solid var(--border-color);

        .top-container {
          display: flex;
          align-items: center;

          .ico {
            width: 35px;
            height: 35px;
            vertical-align: middle;
          }

          .text {
            margin-left: 10px;

            .site-name {
              font-size: 14px;
              font-weight: bold;
              color: var(--text-color-100);
              vertical-align: middle;
            }

            .description {
              font-size: 12px;
              color: var(--text-color-200);
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
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

/* 骨架屏样式 1:1 还原布局、尺寸、网格、响应式 */
.skeleton-site {
  margin-bottom: 15px;

  .card {
    .skeleton-cate-title {
      width: 120px;
      height: 20px !important;
      margin: 10px;
    }

    .skeleton-nav {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;

      .skeleton-nav-item {
        height: 70px !important;
        padding: 5px 10px;
        border-radius: 7px;
        box-sizing: border-box;

        .top-container {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;

          .skeleton-ico {
            width: 35px !important;
            height: 35px !important;
            border-radius: 4px;
            flex-shrink: 0;
          }

          .text {
            margin-left: 10px;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;

            .skeleton-name {
              width: 60%;
              height: 14px !important;
            }

            .skeleton-desc {
              width: 80%;
              height: 12px !important;
            }
          }
        }
      }

      /* 同步原页面所有响应式列数 */
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
</style>