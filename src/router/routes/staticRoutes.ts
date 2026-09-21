import type { RouteRecordRaw } from 'vue-router'
import { RoutesAlias } from "../routesAlias"
// 菜单图标：编译期按需引入（图标不再由运行时字符串查表，需以组件形式挂在 meta 上）
import IconHome from '~icons/mdi/home'
import IconPackageVariant from '~icons/mdi/package-variant'
import IconCog from '~icons/mdi/cog'
import IconInformationOutline from '~icons/mdi/information-outline'
/**
 * 静态路由配置
 */
export const staticRoutes: RouteRecordRaw[] = [
    {
        path: RoutesAlias.Layout,
        name: "Index",
        redirect: "/home",
        component: () => import("@views/index/index.vue"),
        meta: { requiresAuth: true },
        children: [
            {
                path: RoutesAlias.Home,
                name: 'Home',
                component: () => import("@views/home/index.vue"),
                meta: { title: "首页", icon: IconHome, keepAlive: true }
            },
            {
                path: RoutesAlias.Link,
                name: 'Link',
                component: () => import("@views/link/index.vue"),
                meta: { title: "友链", icon: IconPackageVariant, keepAlive: true }
            },
            {
                path: RoutesAlias.Archive,
                name: 'Archive',
                redirect: '/archive/article',
                component: () => import("@views/archive/index.vue"),
                meta: { title: "归档", icon: IconCog, keepAlive: true },
                children: [
                    {
                        path: 'article',
                        name: 'ArchiveArticle',
                        component: () => import("@views/archive/widget/ArticleYearList.vue"),
                        meta: { title: "文章年份列表" }
                    },
                    {
                        path: 'code-snippets',
                        name: 'ArchiveCodeSnippets',
                        component: () => import("@views/archive/widget/CodeSnippets.vue"),
                        meta: { title: "代码片段" }
                    },
                    {
                        path: 'tags',
                        name: 'ArchiveTags',
                        component: () => import("@views/archive/widget/TagArchive.vue"),
                        meta: { title: "标签归档" }
                    },
                    {
                        path: 'note/:id',
                        name: 'ArchiveNote',
                        component: () => import("@views/archive/widget/Note.vue"),
                        props: true,
                        meta: { title: "笔记详情" }
                    }
                ]
            },
            {
                path: RoutesAlias.Navigation,
                name: 'Navigation',
                component: () => import("@views/navigation/index.vue"),
                meta: { title: "导航", icon: IconInformationOutline, keepAlive: true }
            },
            {
                path: RoutesAlias.About,
                name: 'About',
                component: () => import("@views/about/index.vue"),
                meta: { title: "关于", icon: IconInformationOutline, keepAlive: true }
            },
            {
                path: RoutesAlias.ArticleDetail,
                name: 'ArticleDetail',
                component: () => import("@views/article-detail/index.vue"),
                props: true,
                meta: { title: "文章详情", keepAlive: false }
            },
            {
                path: RoutesAlias.SearchView,
                name: 'SearchView',
                component: () => import("@views/search-view/index.vue"),
                meta: { title: "搜索结果", keepAlive: false }
            }
        ]
    }
]