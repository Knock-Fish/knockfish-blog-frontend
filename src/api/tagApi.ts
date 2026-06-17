import request from "@/utils/http"
export class TagService{
    static getTagInfo(params: Record<string, any>){
        return request.get<Api.Tag.TagListData>({
            url: "/api/tag",
            params
        })
    }
}