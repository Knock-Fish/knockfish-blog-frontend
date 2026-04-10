import request from "@/utils/http"
export class UserService{
    static getUserInfo(){
        return request.get<Api.User.UserInfo>({
            url: "/api/user"
        })
    }
}