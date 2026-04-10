import { useIntersectionObserver } from '@vueuse/core'
import type { App, Directive } from "vue";
const lazyDirective: Directive<HTMLImageElement> = {
    mounted(el: HTMLImageElement, binding: DirectiveBinding) {
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                console.log(isIntersecting)
                el.src = binding.value
                // 加载后立即停止观察
                stop()
            }
        })
    }
}
export function setupLazyDirective(app: App) {
    app.directive('lazy', lazyDirective)
}