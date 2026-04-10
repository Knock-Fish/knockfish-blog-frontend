import type { App, Directive } from "vue";
import Prism from 'prismjs'
const prismDirective: Directive<HTMLImageElement> = {

}

export function setupPrismDirective(app: App) {
    app.directive('prism', prismDirective)
}