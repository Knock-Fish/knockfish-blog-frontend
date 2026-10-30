import type { Router } from 'vue-router'
import { setPageMeta } from '@/utils/pageMeta'

/**
 * 设置路由全局后置守卫
 *
 * 路由跳转完成后按 meta 写入 title / 描述 / 分享卡片信息，
 * 保证每次切页都先把上一页的信息重置掉（详情页随后会用真实数据再覆盖一次）。
 */
export function setupAfterEachGuard(router: Router): void {
    router.afterEach((to) => {
        setPageMeta({
            title: to.meta.title as string | undefined,
            description: to.meta.description as string | undefined,
            image: to.meta.image as string | undefined,
            absolute: Boolean(to.meta.absolute),
        })
    })
}
