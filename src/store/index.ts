import type { App } from "vue"
import { createPinia } from "pinia"
import { createPersistedState } from 'pinia-plugin-persistedstate'
export const store = createPinia()
// 配置持久化插件
store.use(
  createPersistedState({
    key: (storeId: string) => `pinia-${storeId}`,
    storage: localStorage,
    serializer: {
      serialize: JSON.stringify,  // 将对象转为 JSON 字符串
      deserialize: JSON.parse   // 将 JSON 字符串解析为对象
    }
  })
)
// 初始化 Store
export function initStore(app: App<Element>): void {
  app.use(store)
}