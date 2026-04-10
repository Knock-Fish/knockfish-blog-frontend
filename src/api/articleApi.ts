import request from "@/utils/http"
export class ArticleService{
    // 获取文章时间轴
    static getArticleTimeline(){
        return request.get<Api.Article.ArticleListData>({
            url: "/api/article/timeline"
        })
    }
    // 获取所有文章以及标签
    static getAllArticleWithTags(params: Record<string, any>){
        return request.get<Api.Article.ArticleListData>({
            url: "/api/article/with-tags",
            params
        })
    }
    // 获取指定文章
    static getArticleById(params: number){
        return request.get<Api.Article.ArticleInfo>({
            url: `/api/article/${params}`
        })
    }
}