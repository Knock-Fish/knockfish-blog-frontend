import { createApp } from 'vue'
import ElementPlus from 'element-plus'              // element-plus组件库
import { initStore } from "@/store/index"           // pinia
import { initRouter } from "@/router/index"         // vue-router
import '@styles/reset.scss'                         // 重置HTML样式
import "@styles/el-ui.scss"                         // 覆盖组件库默认样式
import "animate.css"                                // animate动画库
import "@styles/mobile.scss"                        // 
import '@styles/el-dark.scss'                       // Element 自定义主题（暗色）
import { setupGlobDirectives } from "@/directives/index"
import App from './App.vue'
const app = createApp(App)
initStore(app)  // 初始化pinia
initRouter(app) // 初始化router
setupGlobDirectives(app)    // 自定义指令
app.use(ElementPlus)    // 使用组件库
app.mount('#app')

const hideLoading = () => {
  const loadingContainer = document.getElementById('loading-container')
  if (loadingContainer) {
    loadingContainer.classList.add('hidden')
    setTimeout(() => {
      loadingContainer.remove()
    }, 500)
  }
}

if (document.readyState === 'complete') {
  hideLoading()
} else {
  window.addEventListener('load', hideLoading)
}