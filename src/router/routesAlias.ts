/**
 * 路由别名，方便快速找到页面，同时可以用作路由跳转
 */
export const RoutesAlias = {
    Layout: '/',
    Home: '/home',
    Link: '/link',
    Archive: '/archive',
    Navigation: '/navigation',
    About: '/about',
    ArticleDetail: '/article-detail/:id',
    SearchView: '/search-view',
} as const