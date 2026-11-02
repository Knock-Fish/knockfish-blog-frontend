import request from "@/utils/http"
export class TagService{
    static getTagInfo(params: Record<string, any>){
        return request.get<Api.Tag.TagListData>({
            url: "/api/front/tag",
            params,
            cache: true,
            ttl: 60000
        })
    }
    static getArticlesByTag(tagId: number){
        return request.get<Api.Tag.TagArticleList>({
            url: `/api/front/tag/${tagId}/articles`,
            cache: true,
            ttl: 60000
        })
    }
}