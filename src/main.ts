import { createApp } from 'vue'
import ElementPlus from 'element-plus'              // element-plus组件库
import { initStore } from "@/store/index"           // pinia
import { initRouter } from "@/router/index"         // vue-router
import '@styles/reset.scss'                         // 重置HTML样式
import "@styles/el-ui.scss"                         // 覆盖组件库默认样式
import "animate.css"                                // animate动画库
import "@styles/mobile.scss"                        // 
import "prismjs/themes/prism-tomorrow.min.css"
import '@styles/el-dark.scss'                       // Element 自定义主题（暗色）
import "@/mock/index"                               // Mockjs
import { addCollection } from '@iconify/vue'   // 使用iconify
import mdi from '@iconify-json/mdi/icons.json'
import SvgIcon from "@comps/svg-icon/index.vue"
import { setupGlobDirectives } from "@/directives/index"
import App from './App.vue'
addCollection(mdi)
const app = createApp(App)
initStore(app)  // 初始化pinia
initRouter(app) // 初始化router
setupGlobDirectives(app)    // 自定义指令
app.use(ElementPlus)    // 使用组件库
// 注册全局组件
app.component("SvgIcon", SvgIcon)
app.mount('#app')
