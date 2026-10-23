import request from "@/utils/http"

export class NoteService {
    static getNoteList(params: Record<string, any>) {
        return request.get<Api.Note.NoteListData>({
            url: "/api/note",
            params
        })
    }

    static getNoteById(id: number) {
        return request.get<Api.Note.NoteDetailInfo>({
            url: `/api/note/${id}`
        })
    }
}
