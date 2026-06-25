import request from "@/utils/http"

export class CodeCategoryService {
    static getMenuList() {
        return request.get<Api.CodeCategory.CodeCategoryMenuList>({
            url: "/api/code-category/menu"
        })
    }
}
