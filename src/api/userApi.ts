import request from "@/utils/http"
export class UserService{
    static getUserInfo(params:number){
        return request.get<Api.User.UserInfo>({
            url: `/api/user/${params}`,
            cache: true,
            ttl: 300000
        })
    }
}