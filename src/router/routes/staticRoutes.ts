import type { RouteRecordRaw } from 'vue-router'
import { RoutesAlias } from "../routesAlias"
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
                meta: { title: "首页", icon: "mdi:home", keepAlive: true }
            },
            {
                path: RoutesAlias.Link,
                name: 'Link',
                component: () => import("@views/link/index.vue"),
                meta: { title: "友链", icon: 'mdi:package-variant', keepAlive: true }
            },
            {
                path: RoutesAlias.Archive,
                name: 'Archive',
                component: () => import("@views/archive/index.vue"),
                meta: { title: "归档", icon: 'mdi:cog', keepAlive: true }
            },
            {
                path: RoutesAlias.Navigation,
                name: 'Navigation',
                component: () => import("@views/navigation/index.vue"),
                meta: { title: "导航", icon: 'mdi:information-outline', keepAlive: true }
            },
            {
                path: RoutesAlias.About,
                name: 'About',
                component: () => import("@views/about/index.vue"),
                meta: { title: "关于", icon: 'mdi:information-outline', keepAlive: true }
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