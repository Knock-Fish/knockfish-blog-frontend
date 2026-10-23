/**
 * namespace: Api
 * 所有接口相关类型定义
 */
declare namespace Api {
    /** 基础类型 */
    namespace Http {
        /** 基础响应 */
        interface BaseResponse<T = any> {
            // 状态码
            code: number
            // 消息
            msg: string
            // 数据
            data: T
        }
    }
    /** 通用类型 */
    namespace Common {
        /** 分页参数 */
        interface PaginatingParams {
            /** 当前页码 */
            pageNum: number
            /** 每页条数 */
            pageSize: number
            /** 总条数 */
            total?: number
        }
    }
    /** 网站类别类型 */
    namespace Category{
        /** 类别信息 */
        interface CategoryInfo{
            categoryId: number
            categoryName: string
            createTime: string
            sites?: Api.Site.SiteInfo[]
        }
        /** 类别 + 所属网站列表 */
        type CategoryWithSites = CategoryInfo[]
        // interface CategoryWithSites{
        //     list: CategoryInfo[]
        //     keyword?: Record<string, any>
        //     current: number
        //     size: number
        //     total: number
        // }
    }
    /** 网站类型 */
    namespace Site{
        interface SiteInfo{
            siteId: number
            siteName: string
            description: string
            ico: string
            siteUrl: string
            createTime: string
            categoryId: number
        }
    }
    /** 标签类型 */
    namespace Tag{
        interface TagInfo{
            tagId: number
            tagName: string
            color: string
            createTime?: string
            articleCount?: number
        }
        interface TagListData{
            list: TagInfo[]
            keyword?: Record<string, any>
            current: number
            size: number
            total: number
        }
        interface TagArticleInfo{
            articleId: number
            title: string
            description: string
            publishTime: string
        }
        type TagArticleList = TagArticleInfo[]
    }
    /** 文章类型 */
    namespace Article{
        interface ArticleInfo{
            articleId: number
            title: string
            cover?: string
            description?: string
            content?: string
            status?: 'PUBLISH' | 'DRAFT'
            publishTime: string
            updatedTime?: string
            tags: Api.Tag.TagInfo[]
            userId: number
        }
        interface ArticleDetailInfo extends ArticleInfo {
            tagIds: string
            tagNames: string
            tagColors: string
            username: string
        }
        interface ArticleArchiveInfo {
            articleId: number
            title: string
            description: string
            publishTime: string
            tagNames: string
            /** 与 tagNames 按位对应的逗号分隔颜色串 */
            tagColors: string
            views: number
        }
        type ArticleListData = Api.Common.PaginatingParams<ArticleInfo>
        type ArticleArchiveList = ArticleArchiveInfo[]
    }
    /** 用户类型 */
    namespace User{
        interface UserInfo{
            avatar: string
            nickname: string
            description: string
            articleCount?: number
            tagCount?: number
            siteCount?: number
            githubUrl?: string
            bilibiliUrl?: string
        }
    }
    /** 代码分类类型 */
    namespace CodeCategory{
        interface CodeCategoryMenuInfo{
            codeCategoryId: number
            codeCategoryName: string
            sort: number
        }
        type CodeCategoryMenuList = CodeCategoryMenuInfo[]
    }
    /** 代码片段类型 */
    namespace CodeSnippet{
        interface CodeSnippetInfo{
            codeSnippetId: number
            title: string
            codeCategoryId: number
            codeContent: string
            createTime: string
        }
        interface CodeSnippetDetailInfo{
            title: string
            codeContent: string
        }
        type CodeSnippetListData = Api.Common.PaginatingParams<CodeSnippetInfo>
    }
    /** 笔记类型 */
    namespace Note{
        interface NoteInfo{
            noteId: number
            noteTitle: string
            sort: number
            createTime?: string
        }
        interface NoteDetailInfo{
            noteId: number
            noteTitle: string
            noteContent: string
        }
        type NoteListData = Api.Common.PaginatingParams<NoteInfo>
    }
    /** 友链类型 */
    namespace Link{
        interface LinkInfo{
            linkId: number
            linkName: string
            linkUrl: string
            avatar: string
            description: string
            status?: string
            createTime?: string
        }
    }
}