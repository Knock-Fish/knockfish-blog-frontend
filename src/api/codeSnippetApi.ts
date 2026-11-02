import request from "@/utils/http"

export class CodeSnippetService {
    static getCodeSnippetListByCategoryId(categoryId: number, params: Record<string, any>) {
        return request.get<Api.CodeSnippet.CodeSnippetListData>({
            url: `/api/front/code-snippet/list/${categoryId}`,
            params
        })
    }

    static getCodeSnippetById(id: number) {
        return request.get<Api.CodeSnippet.CodeSnippetDetailInfo>({
            url: `/api/front/code-snippet/${id}`
        })
    }
}
