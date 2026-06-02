import type { Directive, App } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.min.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'

// 可选：根据需要导入更多语言支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'

interface EnhanceCodeOptions {
  addLineNumbers?: boolean      // 是否添加行号，默认 true
  addVPre?: boolean              // 是否添加 v-pre 属性，默认 true
  highlightOnUpdate?: boolean    // 更新时是否重新高亮，默认 true
}

const defaultOptions: EnhanceCodeOptions = {
  addLineNumbers: true,
  addVPre: true,
  highlightOnUpdate: true
}

/**
 * 增强代码块：添加行号和 v-pre 属性，并触发 Prism 高亮
 */
function enhanceCodeBlock(preElement: HTMLPreElement, options: EnhanceCodeOptions) {
  // 添加 line-numbers 类
  if (options.addLineNumbers && !preElement.classList.contains('line-numbers')) {
    preElement.classList.add('line-numbers')
  }
  
  // 添加 v-pre 属性
  if (options.addVPre && !preElement.hasAttribute('v-pre')) {
    preElement.setAttribute('v-pre', 'true')
  }
}

/**
 * 处理容器内的所有代码块
 */
function processCodeBlocks(container: HTMLElement, options: EnhanceCodeOptions) {
  // 获取所有 pre 元素
  const preElements = container.querySelectorAll('pre')
  
  preElements.forEach(pre => {
    // 确保 pre 内有 code 元素，如果没有则包裹一层
    let codeElement = pre.querySelector('code')
    if (!codeElement) {
      codeElement = document.createElement('code')
      codeElement.textContent = pre.textContent || ''
      pre.innerHTML = ''
      pre.appendChild(codeElement)
    }
    
    // 为 pre 添加增强样式和属性
    enhanceCodeBlock(pre, options)
  })
  
  // 触发 Prism 高亮
  if (options.highlightOnUpdate !== false) {
    Prism.highlightAllUnder(container)
  }
}

/**
 * 全局自定义指令：v-enhance-code
 * 用法：
 * <div v-enhance-code>...</div>
 * <div v-enhance-code="{ addLineNumbers: true, addVPre: true }">...</div>
 */
const enhanceCodeDirective: Directive = {
  mounted(el: HTMLElement, binding) {
    const options = { ...defaultOptions, ...(binding.value as EnhanceCodeOptions || {}) }
    
    // 使用 nextTick 确保 DOM 完全渲染
    setTimeout(() => {
      processCodeBlocks(el, options)
    }, 0)
  },
  
  updated(el: HTMLElement, binding) {
    const options = { ...defaultOptions, ...(binding.value as EnhanceCodeOptions || {}) }
    
    if (options.highlightOnUpdate) {
      setTimeout(() => {
        processCodeBlocks(el, options)
      }, 0)
    }
  }
}


export function setupEnhanceCodeDirective(app: App) {
    app.directive('enhance-code', enhanceCodeDirective)
}