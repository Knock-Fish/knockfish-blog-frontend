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
        }
        interface TagListData{
            list: TagInfo[]
            keyword?: Record<string, any>
            current: number
            size: number
            total: number
        }
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
        }
        interface ArticleDetailInfo extends ArticleInfo {
            tagIds: string
            tagNames: string
            tagColors: string
            username: string
        }
        type ArticleListData = Api.Common.PaginatingParams<ArticleInfo>
    }
    /** 用户类型 */
    namespace User{
        interface UserInfo{
            avatar: string
            nickname: string
            description: string
        }
    }
}