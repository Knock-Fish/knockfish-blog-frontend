<template>
  <div
    class="avatar-sparkle"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${size / 128}rem` }"
  >
    <!-- 旋转虚线环 -->
    <div class="avatar-ring" :style="{ borderColor: ringColor }">
      <span class="ring-star ring-star--top" :style="{ color: starColor }">✦</span>
      <span class="ring-star ring-star--bottom" :style="{ color: starColor }">✦</span>
    </div>

    <!-- 外围闪烁星星（5颗） -->
    <span class="star-deco star-1" :style="{ color: starColor }">✦</span>
    <span class="star-deco star-2" :style="{ color: starColor }">✧</span>
    <span class="star-deco star-3" :style="{ color: starColor }">♡</span>
    <span class="star-deco star-4" :style="{ color: starColor }">✦</span>
    <span class="star-deco star-5" :style="{ color: starColor }">✧</span>

    <!-- 头像插槽：外部传入 <img> 或自定义元素 -->
    <div class="avatar-inner">
      <slot>
        <!-- 无插槽时的默认占位头像 -->
        <div class="avatar-placeholder"></div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 头像整体尺寸（px），宽高一致 */
  size?: number
  /** 虚线环颜色 */
  ringColor?: string
  /** 星星颜色 */
  starColor?: string
}

withDefaults(defineProps<Props>(), {
  size: 128,
  ringColor: 'rgba(184, 169, 212, 0.25)',
  starColor: '#B8A9D4',
})
</script>

<style scoped>
/* ===== 组件外层容器 ===== */
.avatar-sparkle {
  position: relative;
  display: inline-block;
  /* fontSize 由内联 style 控制，作为 em 基准，实现整体等比缩放 */
}

/* ===== 1. 旋转虚线环 ===== */
.avatar-ring {
  position: absolute;
  inset: -0.094em; /* 原 -12px / 128 = 0.09375em */
  border-radius: 50%;
  border: 0.016em dashed; /* 原 2px */
  animation: spinRing 30s linear infinite;
  pointer-events: none;
  z-index: 0;
}

/* 环上的两个星星标记（改用真实子元素，避免伪元素无法动态改色） */
.ring-star {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1em;
  opacity: 0.4;
  line-height: 1;
}
.ring-star--top {
  top: -0.078em; /* 原 -10px */
}
.ring-star--bottom {
  bottom: -0.078em;
}

@keyframes spinRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== 2. 闪烁星星（5颗） ===== */
.star-deco {
  position: absolute;
  font-size: 1.2em;
  opacity: 0.3;
  animation: twinkle 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
  line-height: 1;
}

.star-1 {
  top: -0.031em;   /* 原 -4px */
  left: -0.141em;  /* 原 -18px */
  animation-delay: 0s;
}
.star-2 {
  top: -0.063em;   /* 原 -8px */
  right: -0.156em; /* 原 -20px */
  animation-delay: 0.4s;
}
.star-3 {
  bottom: 0.031em; /* 原 4px */
  left: -0.188em;  /* 原 -24px */
  animation-delay: 1.2s;
}
.star-4 {
  bottom: -0.047em;/* 原 -6px */
  right: -0.125em; /* 原 -16px */
  font-size: 0.9em;
  animation-delay: 2s;
}
.star-5 {
  top: 20%;
  left: -0.219em;  /* 原 -28px */
  font-size: 0.9em;
  animation-delay: 0.8s;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2) rotate(20deg);
  }
}

/* ===== 头像内层容器 ===== */
.avatar-inner {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  border-radius: 50%;
  overflow: hidden;
}

/* 默认占位头像 */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFF5F0, #F5EDFA);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3em;
  color: #B8A9D4;
  border: 0.023em solid rgba(255, 255, 255, 0.6); /* 原 3px */
  box-shadow: 0 0.063em 0.313em rgba(184, 169, 212, 0.15); /* 原 8px 40px */
}
</style>
