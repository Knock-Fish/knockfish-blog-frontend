<template>
  <div
    class="poker-card-wrapper"
    :class="{
      shuffling: isShuffling,
      'shuffling-back': isShufflingBack,
      halfway: isHalfway,
    }"
  >
    <!-- 正面卡片 -->
    <ElCard
      class="card-layer card-front"
      :class="{
        'slide-left': isSlideLeft,
        'slide-right': !isSlideLeft,
      }"
    >
      <UserCardContent :user="user2" />
    </ElCard>

    <!-- 背面卡片 -->
    <ElCard
      class="card-layer card-back"
      :class="{
        'slide-left': isSlideLeft,
        'slide-right': !isSlideLeft,
      }"
    >
      <UserCardContent :user="user1" />
    </ElCard>

    <!-- 点击切换层 -->
    <ElCard class="card-click-layer" @click="flipCard" />
  </div>
</template>

<script setup lang="ts">
import { UserService } from '@api/userApi'
import { useUserStore } from '@/store/modules/user'
import UserCardContent from './UserCardContent.vue'

const userStore = useUserStore()

const { user1, user2, isSlideLeft, isShuffling, isShufflingBack, isHalfway } =
  storeToRefs(userStore)

const { flipCard } = userStore

const getUser = async () => {
  const [data1, data2] = await Promise.all([
    UserService.getUserInfo(1),
    UserService.getUserInfo(2),
  ])
  userStore.setUsers(data1, data2)
}

onMounted(async () => {
  await getUser()
})
</script>

<style lang="scss" scoped>
$transition-duration: 0.5s;
$easing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
$card-offset-x: -15px;
$card-offset-y: -15px;
$shuffle-distance: 100px;
$shuffle-rotation: 8deg;
.poker-card-wrapper {
  position: relative;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
.card-layer {
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  transition: all $transition-duration $easing-function;

  will-change: transform, z-index;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.card-front {
  z-index: 2;
  transform-origin: center center;

  &.slide-left {
    transform: translateX($card-offset-x) translateY($card-offset-y);
    z-index: 1;
  }

  &.slide-right {
    transform: translateX(0) translateY(0);
    z-index: 2;
  }
}

.card-back {
  z-index: 1;
  transform: translateX($card-offset-x) translateY($card-offset-y);

  &:hover {
    transform: translateX(calc($card-offset-x - 10px))
      translateY(calc($card-offset-y - 18px));
  }

  &.slide-left {
    transform: translateX(0) translateY(0);
    z-index: 2;
  }

  &.slide-right {
    transform: translateX($card-offset-x) translateY($card-offset-y);
    z-index: 1;
  }
}

.poker-card-wrapper {
  &.shuffling .card-front,
  &.shuffling-back .card-back {
    animation: shuffleFrontOut $transition-duration ease-in-out forwards;
  }

  &.shuffling .card-back,
  &.shuffling-back .card-front {
    animation: shuffleBackIn $transition-duration ease-in-out forwards;
  }

  &.shuffling.halfway .card-front,
  &.shuffling-back.halfway .card-back {
    z-index: 1;
  }

  &.shuffling.halfway .card-back,
  &.shuffling-back.halfway .card-front {
    z-index: 3;
  }
}

.el-card {
  background-color: var(--bg-color-100);
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.card-click-layer {
  cursor: pointer;
  height: 295px;
  width: 100%;
  position: absolute;
  left: $card-offset-x;
  top: $card-offset-y;
  z-index: 1;
  background: transparent;
  border: none;
  box-shadow: none;

  :deep(.el-card__body) {
    height: 100%;
  }
}

@keyframes shuffleFrontOut {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  50% {
    transform: translateX($shuffle-distance) translateY(-60px)
      rotate($shuffle-rotation);
  }
  100% {
    transform: translateX($card-offset-x) translateY($card-offset-y) rotate(0deg);
  }
}

@keyframes shuffleBackIn {
  0% {
    transform: translateX($card-offset-x) translateY($card-offset-y) rotate(0deg);
  }
  50% {
    transform: translateX(-80px) translateY(-50px) rotate(calc($shuffle-rotation * -1));
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}
</style>