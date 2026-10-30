<template>
    <div class="error-page">
        <div class="error-code">{{ code }}</div>
        <h1 class="error-title">{{ title }}</h1>
        <p class="error-desc">{{ desc }}</p>
        <div class="error-actions">
            <RouterLink class="action is-primary" to="/home">
                <i-mdi-home-outline />
                回到首页
            </RouterLink>
            <button class="action" type="button" @click="goBack">
                <i-mdi-arrow-left />
                返回上一页
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * 404 / 400 共用页
 * 路由 meta.code 决定展示哪一套文案，避免为两个错误码各写一份模板
 */
defineOptions({ name: 'ErrorPage' })

const route = useRoute()
const router = useRouter()

const code = computed(() => String(route.meta.code ?? '404'))
const title = computed(() => (code.value === '400' ? '页面加载出了点问题' : '这条鱼游走了'))
const desc = computed(() => (code.value === '400'
    ? '页面在加载过程中遇到异常，刷新一下再试，或者先回首页逛逛。'
    : '你访问的链接可能已经失效，也可能这个页面被挪到了别的地方。'))

const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push('/home')
}
</script>

<style lang="scss" scoped>
.error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: calc(100vh - 220px);
    padding: 40px 20px;
    text-align: center;

    .error-code {
        font-family: "logo-font", sans-serif;
        font-size: clamp(80px, 18vw, 160px);
        font-weight: bold;
        line-height: 1;
        color: transparent;
        background: linear-gradient(50deg, #fd4781, #ff92b5, #ffd7de);
        -webkit-background-clip: text;
        background-clip: text;
        user-select: none;
    }

    .error-title {
        margin-top: 18px;
        font-size: 22px;
        font-weight: 600;
        color: var(--text-color-100);
    }

    .error-desc {
        margin-top: 10px;
        max-width: 420px;
        font-size: 14px;
        line-height: 1.7;
        color: var(--text-color-400);
    }

    .error-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 26px;

        .action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 38px;
            padding: 0 18px;
            border-radius: 19px;
            border: 1px solid var(--border-color);
            background: transparent;
            font-size: 14px;
            color: var(--text-color-200);
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;

            svg {
                font-size: 16px;
            }

            &:hover {
                border-color: #fd4781;
                color: #fd4781;
            }

            &.is-primary {
                border-color: transparent;
                background: linear-gradient(90deg, #ff92b5, #fd4781);
                color: #fff;

                &:hover {
                    opacity: 0.9;
                    color: #fff;
                }
            }
        }

        @media screen and (max-width: $screen-small) {
            flex-direction: column;
            width: 100%;

            .action {
                width: 100%;
            }
        }
    }
}
</style>
