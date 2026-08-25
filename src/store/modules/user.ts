type User = Api.User.UserInfo
export const useUserStore = defineStore('userStore', () => {
    const user = ref<User>({
        avatar: "",
        nickname: "",
        description: "",
        githubUrl: "",
        bilibiliUrl: ""
    })

    const setUser = (data: User) => {
        user.value = data
    }


    return {
        user,
        setUser,
    }
}, {
    persist: {
        key: 'card-user',
        storage: localStorage
    }
})