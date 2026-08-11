type User = Api.User.UserInfo
export const useUserStore = defineStore('userStore', () => {
    const user1 = ref<User>({
        avatar: "",
        nickname: "",
        description: "",
        githubUrl: "",
        bilibiliUrl: ""
    })
    const user2 = ref<User>({
        avatar: "",
        nickname: "",
        description: "",
        githubUrl: "",
        bilibiliUrl: ""
    })
    const currentUsername = ref<number>(0)
    // false=展示user2(front)，true=展示user1(back置顶)
    const isSlideLeft = ref(false)
    const isShuffling = ref(false)
    const isShufflingBack = ref(false)
    const isHalfway = ref(false)
    const setCurrentUser = (userId: number) => {
        currentUsername.value = userId
    }
    // 清除定时器防止多次点击堆积
    let timer1: number | null = null
    let timer2: number | null = null

    const setUsers = (data1: User, data2: User) => {
        user1.value = data1
        user2.value = data2
    }

    const flipCard = () => {
        // 动画中禁止重复点击
        if (isShuffling.value || isShufflingBack.value) return

        // 清空旧定时器
        if (timer1) clearTimeout(timer1)
        if (timer2) clearTimeout(timer2)

        if (isSlideLeft.value) {
            // 切回右：back卡片退场，front入场
            isShufflingBack.value = true
            timer1 = window.setTimeout(() => {
                isHalfway.value = true
            }, 250)
            timer2 = window.setTimeout(() => {
                isShufflingBack.value = false
                isHalfway.value = false
                isSlideLeft.value = false
                setCurrentUser(2)
            }, 500)
        } else {
            // 切左：front退场，back入场
            isShuffling.value = true
            timer1 = window.setTimeout(() => {
                isHalfway.value = true
            }, 250)
            timer2 = window.setTimeout(() => {
                isShuffling.value = false
                isHalfway.value = false
                isSlideLeft.value = true
                setCurrentUser(1)
            }, 500)
        }
    }

    return {
        user1,
        user2,
        currentUsername,
        isSlideLeft,
        isShuffling,
        isShufflingBack,
        isHalfway,
        setUsers,
        setCurrentUser,
        flipCard
    }
}, {
    persist: {
        key: 'card-user',
        storage: localStorage
    }
})