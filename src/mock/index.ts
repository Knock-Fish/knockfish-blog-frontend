import Mock from 'mockjs'
// import { parseUrlParams } from "./utils/parseUrlParams"
// 导入各个模块的 mock 数据
import category from './modules/category'
import user from './modules/user'
import tag from './modules/tag'
import article from './modules/article'
Mock.mock(/\/api\/category\/with-sites/, "get", category.getAllCategoryWithSites)
Mock.mock(/\/api\/user/, "get", user.getUserInfo)
Mock.mock(/\/api\/tag/, "get", tag.getTagInfo)
Mock.mock(/\/api\/article\/with-tags/, "get", options => article.getAllArticleWithTags(options))
Mock.mock(/\/api\/article\/\d+/, "get", (options) => {
    const url = options.url
    const match = url.match(/\/api\/article\/(\d+)/)
    if (match && match[1]) {
        const id = parseInt(match[1])
        return article.getArticleById(id)
    }
})
Mock.mock(/\/api\/article\/timeline/, "get", article.getArticleTimeline)
