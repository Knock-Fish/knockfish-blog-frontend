<template>
    <div class="unlock-form">
        <ElInput ref="passwordRef" v-model="password" type="password" show-password placeholder="相册密码" size="large"
            @keyup.enter="submit" />

        <div class="captcha-row">
            <ElInput v-model="captcha" placeholder="验证码" maxlength="4" size="large" @keyup.enter="submit" />
            <button type="button" class="captcha-img" title="点击刷新验证码" @click="loadCaptcha">
                <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                <span v-else>加载中…</span>
            </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <ElButton type="primary" size="large" class="submit" :loading="submitting" @click="submit">
            进入相册
        </ElButton>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { GalleryService, type GalleryAlbumVO } from '@/api/galleryApi'

const props = defineProps<{ album: GalleryAlbumVO }>()
const emit = defineEmits<{ unlocked: [token: string, expiresIn: number] }>()

/** 只用到 focus，不引 element-plus 的实例类型，避免类型导出变动 */
const passwordRef = ref<{ focus: () => void }>()
const password = ref('')
const captcha = ref('')
const captchaId = ref('')
const captchaImage = ref('')
const submitting = ref(false)
const error = ref('')

async function loadCaptcha() {
    captchaImage.value = ''
    captcha.value = ''
    try {
        const data = await GalleryService.getCaptcha()
        captchaId.value = data.captchaId
        captchaImage.value = data.image
    } catch {
        error.value = '验证码加载失败，点击图片重试'
    }
}

async function submit() {
    if (submitting.value) return
    if (!password.value.trim()) {
        error.value = '请输入相册密码'
        return
    }
    if (!captcha.value.trim()) {
        error.value = '请输入验证码'
        return
    }
    submitting.value = true
    error.value = ''
    try {
        const data = await GalleryService.unlockAlbum(props.album.albumId, {
            captchaId: captchaId.value,
            captcha: captcha.value.trim(),
            password: password.value,
        })
        emit('unlocked', data.token, data.expiresIn)
    } catch (e) {
        const err = e as { message?: string }
        error.value = err?.message || '密码或验证码不正确'
        // 验证码一次性，失败必须换一张
        void loadCaptcha()
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    void loadCaptcha()
    passwordRef.value?.focus()
})
</script>

<style lang="scss" scoped>
.unlock-form {
    width: 100%;
}

/* 全局 el-ui.scss 把 .el-input 的边框、背景、内边距都清空了（按钮也一样），
   这里的表单要自带完整外观，否则在弹窗里是一片空白 */
.unlock-form :deep(.el-input__wrapper) {
    box-sizing: border-box;
    height: 42px;
    padding: 0 12px !important;
    border-radius: 10px;
    background-color: color-mix(in srgb, var(--g-text) 6%, transparent) !important;
    box-shadow: inset 0 0 0 1px var(--g-line) !important;
    transition: box-shadow 0.2s var(--g-ease), background-color 0.2s var(--g-ease);

    &:hover {
        box-shadow: inset 0 0 0 1px color-mix(in srgb, rgb(var(--g-accent)) 40%, var(--g-line)) !important;
    }

    &.is-focus {
        background-color: color-mix(in srgb, var(--g-text) 3%, transparent) !important;
        box-shadow: inset 0 0 0 1px rgb(var(--g-accent)) !important;
    }
}

.unlock-form :deep(.el-input__inner) {
    font-size: 14px;
    color: var(--g-text);
    text-align: left;

    &::placeholder {
        color: var(--g-dim);
    }
}

.captcha-row {
    display: flex;
    gap: 10px;
    margin-top: 12px;
}

.captcha-img {
    flex: none;
    width: 108px;
    height: 42px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--g-line);
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    display: grid;
    place-items: center;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }

    span {
        font-size: 11px;
        color: var(--g-dim);
    }
}

.error {
    margin: 10px 0 0;
    font-size: 12px;
    color: #e5484d;
}

/* 同一个全局重置：.el-button 背景/边框被 !important 清零，primary 只剩白字不可见，
   所以这里把主色背景、白字显式写回来 */
.submit {
    width: 100%;
    height: 42px;
    margin-top: 18px;
    padding: 0 !important;
    border: none !important;
    border-radius: 10px;
    background-color: rgb(var(--g-accent)) !important;
    color: #fff !important;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: filter 0.2s var(--g-ease), transform 0.15s var(--g-ease);

    &:hover,
    &:focus {
        background-color: rgb(var(--g-accent)) !important;
        color: #fff !important;
        filter: brightness(1.08);
    }

    &:active {
        transform: translateY(1px);
    }

    // loading 时 element 会盖一层半透明遮罩，把按钮洗白，这里去掉
    &.is-loading::before {
        background-color: transparent !important;
    }
}

.unlock-form :deep(.submit .el-icon) {
    color: #fff;
}
</style>
