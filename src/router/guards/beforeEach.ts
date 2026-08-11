import type { Router, RouteLocationNormalized } from 'vue-router'
import { useCoverStore } from "@/store/modules/cover"
/**
 * 设置路由全局前置守卫
 */

export function setupBeforeEachGuard(router: Router): void {
    router.beforeEach(
        async (
            to: RouteLocationNormalized
        ) => {
            try {
                return await handleRouterGuard(to)
            } catch (error) {
                console.error('路由守卫处理失败:', error)
                return '/400'
            }
        }
    )
}
/**
 * 处理路由守卫逻辑
 */
async function handleRouterGuard(
    to: RouteLocationNormalized,
): Promise<boolean | string> {
    const coverStore = useCoverStore()
    if(to.path !== '/home'){
        coverStore.setEnterActive(true)
        return true
    }
    return true
}