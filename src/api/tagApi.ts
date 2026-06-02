import request from "@/utils/http"
export class TagService{
    static getTagInfo(){
        return request.get<Api.Tag.TagListData>({
            url: "/api/tag"
        })
    }
}