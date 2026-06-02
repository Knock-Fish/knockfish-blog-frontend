import request from "@/utils/http"
export class UserService{
    static getUserInfo(params: {username: string}){
        return request.get<Api.User.UserInfo>({
            url: "/api/user",
            params
        })
    }
}