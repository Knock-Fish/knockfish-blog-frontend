import type { App, Directive } from "vue";
import Prism from 'prismjs'
const prismDirective: Directive<HTMLImageElement> = {
    // 元素挂载时调用
    mounted(el: HTMLElement) {
        // 查找元素内所有需要高亮的代码块
        const codeBlocks = el.querySelectorAll('pre code');

        codeBlocks.forEach((block) => {
            // 如果已经有 language-xxx 类名，Prism 会自动识别
            Prism.highlightElement(block as HTMLElement);
        });
    },

    // 元素更新时调用（如果内容动态变化）
    updated(el: HTMLElement) {
        const codeBlocks = el.querySelectorAll('pre code');

        codeBlocks.forEach((block) => {
            Prism.highlightElement(block as HTMLElement);
        });
    }
}

export function setupPrismDirective(app: App) {
    app.directive('prism', prismDirective)
}