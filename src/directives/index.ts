import type { App } from 'vue'
import { setupLazyDirective } from "./lazy"

export function setupGlobDirectives(app: App) {
    setupLazyDirective(app) // 懒加载指令
}