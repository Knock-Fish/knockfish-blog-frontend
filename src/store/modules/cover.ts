export const useCoverStore = defineStore('coverStore', () => {
    const enterActive = ref<boolean>(false)
    const setEnterActive = (active: boolean) => {
        enterActive.value = active
    }

    return {
        enterActive,
        setEnterActive
    }
}, {
    persist: {
        key: 'cover',
        storage: sessionStorage
    }
})