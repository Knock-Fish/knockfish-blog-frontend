import request from "@/utils/http"
export class LinkService{
    static getLinkList(){
        return request.get<Api.Link.LinkInfo[]>({
            url: "/api/front/link/list",
            cache: true,
            ttl: 60000
        })
    }
}