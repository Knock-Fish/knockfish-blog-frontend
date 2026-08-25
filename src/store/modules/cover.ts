export const useCoverStore = defineStore('coverStore', () => {
    const enterActive = ref<boolean>(false)
    // header-bg 首次入场动画是否已触发（用于新标签/首次加载的从下往上 animate.css 动画）
    const bgAnimated = ref<boolean>(false)
    const setEnterActive = (active: boolean) => {
        enterActive.value = active
    }
    // 标记入场动画已触发并持久化，确保每个新标签页只执行一次从下往上的入场
    const markBgAnimated = () => {
        bgAnimated.value = true
    }

    return {
        enterActive,
        bgAnimated,
        setEnterActive,
        markBgAnimated,
    }
}, {
    persist: {
        key: 'cover',
        storage: sessionStorage
    }
})
