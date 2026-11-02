import request from "@/utils/http"
export class ArticleService{
    // 获取所有文章以及标签
    static getAllArticleWithTags(params: Record<string, any>){
        return request.get<Api.Article.ArticleListData>({
            url: "/api/front/article/with-tag",
            params,
            cache: true,
            ttl: 60000
        })
    }
    // 获取指定文章
    static getArticleById(params: number){
        return request.get<Api.Article.ArticleDetailInfo>({
            url: `/api/front/article/${params}`,
            cache: true,
            ttl: 60000
        })
    }
    // 获取文章归档列表
    static getArticleArchiveList(){
        return request.get<Api.Article.ArticleArchiveList>({
            url: "/api/front/article/archive",
            cache: true,
            ttl: 60000
        })
    }
}