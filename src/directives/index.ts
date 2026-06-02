import type { App } from 'vue'
import { setupLazyDirective } from "./lazy"
// import { setupPrismDirective } from './prism'
import { setupEnhanceCodeDirective } from "./enhanceCode"

export function setupGlobDirectives(app: App) {
    setupLazyDirective(app) // 懒加载指令
    // setupPrismDirective(app)    // 高亮代码
    setupEnhanceCodeDirective(app)
}