<template>
  <div class="user-card-content">
    <div class="avatar-wrapper">
      <ElAvatar :size="90" :src="user.avatar" />
      <div>
        <div class="name">{{ user.nickname }}</div>
        <div class="introduction">{{ user.description }}</div>
      </div>
    </div>

    <div class="stats">
      <div class="stat-item">
        <strong>{{ user.articleCount }}</strong>
        <span>文章</span>
      </div>
      <div class="stat-item stat-item-divider">
        <strong>{{ user.tagCount }}</strong>
        <span>标签</span>
      </div>
      <div class="stat-item">
        <strong>{{ user.siteCount }}</strong>
        <span>集站</span>
      </div>
    </div>

    <div class="social-links">
      <a v-if="user.githubUrl" class="social-link" :href="user.githubUrl"
        target="_blank" rel="noopener noreferrer">
        <img :src="githubIcon" alt="GitHub" />
      </a>
      <a v-if="user.bilibiliUrl" class="social-link" :href="user.bilibiliUrl"
        target="_blank" rel="noopener noreferrer">
        <img :src="bilibiliIcon" alt="Bilibili" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const githubIcon = new URL('@/assets/svg/github.svg', import.meta.url).href
const bilibiliIcon = new URL('@/assets/svg/bilibili.svg', import.meta.url).href
type User = Api.User.UserInfo
defineProps<{
  user: User
}>()
</script>

<style lang="scss" scoped>
.user-card-content {
  text-align: center;
  padding: 5px 0;
  width: 100%;
}

.avatar-wrapper {
  .name {
    font-family: 'logo-font', sans-serif;
    font-weight: bold;
    margin: 13px 0 8px;
    font-size: 18px;
  }

  .introduction {
    color: var(--text-color-secondary, #666);
    font-size: 14px;
    margin: 0 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.stats {
  display: inline-flex;
  margin-top: 25px;
  gap: 0;
}

.stat-item {
  display: inline-flex;
  flex-direction: column;
  padding: 0 16px;
  align-items: center;

  strong {
    font-size: 16px;
  }

  span {
    font-size: 14px;
    color: var(--text-color-secondary, #666);
    margin-top: 2px;
  }

  &-divider {
    border-left: 1px solid var(--border-color, #e0e0e0);
    border-right: 1px solid var(--border-color, #e0e0e0);
  }
}

.social-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.social-link {
  display: block;
  width: 25px;
  height: 25px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.15);
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>