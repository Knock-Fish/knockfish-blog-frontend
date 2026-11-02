import request from "@/utils/http"

export class NoteService {
    /** 前台笔记列表：仅返回“显示”状态的笔记 */
    static getNoteList(params: Record<string, any>) {
        return request.get<Api.Note.NoteListData>({
            url: "/api/front/note/display",
            params
        })
    }

    /** 前台笔记详情：隐藏笔记后端按“不存在”处理 */
    static getNoteById(id: number) {
        return request.get<Api.Note.NoteDetailInfo>({
            url: `/api/front/note/display/${id}`
        })
    }
}
