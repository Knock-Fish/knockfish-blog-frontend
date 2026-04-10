import request from "@/utils/http"

export class CategoryService{
    // 获取所有类别下的网站信息
    static getAllCategoryWithSites(){
        return request.get<Api.Category.CategoryWithSites>({
            url: "/api/category/with-sites"
        })
    }
}