export default {
    getUserInfo: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                userId: 1,
                username: "knockfish",
                avatar: "http://localhost:3306/src/assets/imgs/avatar.webp",
                nickName: "Knock_Fish",
                description: "我是一条鱼",
            }
        }
    }
}