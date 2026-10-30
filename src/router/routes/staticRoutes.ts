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
                meta: {
                    title: "鱼博客 · 敲打键盘的鱼",
                    absolute: true,
                    description: "敲打键盘的鱼的技术博客，记录编程学习过程中的思考与实践。",
                    icon: IconHome,
                    keepAlive: true
                }
            },
            {
                path: RoutesAlias.Link,
                name: 'Link',
                component: () => import("@views/link/index.vue"),
                meta: {
                    title: "友链",
                    description: "鱼博客的友情链接，与志同道合的博主互相串门。",
                    icon: IconPackageVariant,
                    keepAlive: true
                }
            },
            {
                path: RoutesAlias.Archive,
                name: 'Archive',
                redirect: '/archive/article',
                component: () => import("@views/archive/index.vue"),
                meta: {
                    title: "归档",
                    description: "按年份、标签整理的博客文章归档，以及代码片段与学习笔记。",
                    icon: IconCog,
                    keepAlive: true
                },
                children: [
                    {
                        path: 'article',
                        name: 'ArchiveArticle',
                        component: () => import("@views/archive/widget/ArticleYearList.vue"),
                        meta: {
                            title: "文章归档",
                            description: "按年份与标签浏览全部文章。"
                        }
                    },
                    {
                        path: 'code-snippets',
                        name: 'ArchiveCodeSnippets',
                        component: () => import("@views/archive/widget/CodeSnippets.vue"),
                        meta: {
                            title: "代码片段",
                            description: "日常开发中沉淀的可复用代码片段，按分类整理。"
                        }
                    },
                    {
                        path: 'note',
                        name: 'ArchiveNoteList',
                        component: () => import("@views/archive/widget/NoteList.vue"),
                        meta: {
                            title: "笔记",
                            description: "学习过程中随手记录的技术笔记。"
                        }
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
                meta: {
                    title: "导航",
                    description: "按分类整理的常用站点与工具导航。",
                    icon: IconInformationOutline,
                    keepAlive: true
                }
            },
            {
                path: RoutesAlias.About,
                name: 'About',
                component: () => import("@views/about/index.vue"),
                meta: {
                    title: "关于",
                    description: "关于 KnockFish：一个每天敲打键盘、偶尔摸鱼的程序员。",
                    icon: IconInformationOutline,
                    keepAlive: true
                }
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
                meta: {
                    title: "搜索结果",
                    description: "在鱼博客中检索文章。",
                    keepAlive: false
                }
            },
            {
                path: RoutesAlias.BadRequest,
                name: 'BadRequest',
                component: () => import("@views/error-page/index.vue"),
                meta: {
                    title: "请求异常",
                    description: "页面加载过程中出现异常。",
                    code: '400'
                }
            },
            {
                // 兜底放最后：未匹配到任何路由时不再白屏
                path: '/:pathMatch(.*)*',
                name: 'NotFound',
                component: () => import("@views/error-page/index.vue"),
                meta: {
                    title: "页面不存在",
                    description: "你访问的页面不存在或已被移动。",
                    code: '404'
                }
            }
        ]
    }
]