export default {
    getUserInfo: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                avatar: "avatar.webp",
                nickName: "Knock_Fish",
                description: "我是一条鱼",
            }
        }
    }
}