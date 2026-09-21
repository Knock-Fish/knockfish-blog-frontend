<template>
  <button
    v-if="showToggle && !isCoarse"
    class="ani-cursor-toggle"
    :title="enabled ? '关闭自定义鼠标指针' : '开启自定义鼠标指针'"
    :aria-pressed="enabled"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 3l6 18 2.5-7.5L21 11 5 3z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  collectSelectorsByCursors,
  setANICursor,
  type CursorController
} from '@utils/ani-cursor'

const props = withDefaults(
  defineProps<{
    /** 指针显示尺寸（CSS px）。浏览器建议 ≤32，过大可能失效 */
    size?: number
    /** .ani 文件所在目录，需以 / 结尾 */
    base?: string
    /** 是否显示右下角开关按钮 */
    showToggle?: boolean
  }>(),
  {
    size: 32,
    base: undefined,
    showToggle: true
  }
)

const STORAGE_KEY = 'ani-cursor-enabled'

const enabled = ref(false)
const isCoarse = ref(window.matchMedia('(pointer: coarse)').matches)
let controllers: CursorController[] = []

/**
 * CSS cursor 关键字 → laffy 光标文件。
 * 映射关系取自光标包自带的 install.inf（Windows 光标角色 → 文件），
 * 只列出 CSS 里真正会出现的关键字；zoom-in / none 等无对应光标，保持系统样式。
 */
const CURSOR_FILES: Record<string, string> = {
  default: 'Normal.ani',
  auto: 'Normal.ani',
  pointer: 'Link.ani',
  text: 'Text.ani',
  // SizeAll
  move: 'Move.ani',
  'all-scroll': 'Move.ani',
  grab: 'Move.ani',
  grabbing: 'Move.ani',
  // Help / Wait
  help: 'Help.ani',
  wait: 'Busy.ani',
  progress: 'Busy.ani',
  // Precision / No
  crosshair: 'Precision.ani',
  cell: 'Precision.ani',
  'not-allowed': 'Unavailable.ani',
  // SizeWE
  'e-resize': 'Horizontal.ani',
  'w-resize': 'Horizontal.ani',
  'ew-resize': 'Horizontal.ani',
  'col-resize': 'Horizontal.ani',
  // SizeNS
  'n-resize': 'Vertical.ani',
  's-resize': 'Vertical.ani',
  'ns-resize': 'Vertical.ani',
  'row-resize': 'Vertical.ani',
  // SizeNESW
  'ne-resize': 'Diagonal2.ani',
  'sw-resize': 'Diagonal2.ani',
  'nesw-resize': 'Diagonal2.ani',
  // SizeNWSE
  'nw-resize': 'Diagonal1.ani',
  'se-resize': 'Diagonal1.ani',
  'nwse-resize': 'Diagonal1.ani',
  // UpArrow
  alias: 'Alternate.ani',
  copy: 'Alternate.ani'
}

/** a/button/input 等的 cursor 来自浏览器默认样式，扫描不到，需手工补上 */
const LINK_GROUP = ['a', 'button', '[role="button"]', 'summary', 'label', '.is-link']
const TEXT_GROUP = ['input', 'textarea', 'select', '[contenteditable="true"]']

function aniBase(): string {
  return props.base ?? import.meta.env.BASE_URL + 'ani/laffy/'
}

function readPref(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}
function writePref(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* 隐私模式下忽略 */
  }
}

function apply(): void {
  const base = aniBase()
  const size = props.size

  // 整页默认光标：cursor 可继承，套在 html 上即作用于全页
  controllers.push(setANICursor('html', base + 'Normal.ani', 'auto', size, size))

  // 一次性扫描所有需要的 cursor 关键字，按关键字分桶（只遍历一遍样式表）。
  // 元素自身的 cursor 声明会盖掉从 html 继承来的动画值，第三方组件（如 sakana-widget
  // 的鱼身声明 cursor: move）若不加进来，鼠标划上去仍显示系统指针。
  const buckets = collectSelectorsByCursors(Object.keys(CURSOR_FILES))

  // 浏览器默认样式的选择器（a/button/input 等）扫描不到，手工补到对应桶
  const fill = (key: string, selectors: string[]): void => {
    const list = buckets.get(key) ?? []
    list.push(...selectors)
    buckets.set(key, list)
  }
  fill('pointer', LINK_GROUP)
  fill('text', TEXT_GROUP)

  // 按映射表注入：每个 cursor 关键字对应一个 laffy 光标文件。
  // 用 :is() 包裹 —— 它接收「宽容选择器列表」，个别非法选择器不会让整条规则失效。
  for (const [cursor, file] of Object.entries(CURSOR_FILES)) {
    const selectors = buckets.get(cursor)
    if (!selectors?.length) continue
    controllers.push(setANICursor(`:is(${selectors.join(', ')})`, base + file, cursor, size, size))
  }
}

function clear(): void {
  controllers.forEach((controller) => controller.destroy())
  controllers = []
}

let observer: MutationObserver | null = null
let rescanTimer: number | undefined

/** 区分我们自己注入的样式，避免监听逻辑自触发 */
function isOwnStyle(node: Node): boolean {
  return (
    node instanceof HTMLStyleElement &&
    (node.hasAttribute('data-ani-cursor') || node.hasAttribute('data-ani-cursor-keyframes'))
  )
}

/**
 * 监听 head 里新增的样式表并重新扫描。
 * 第三方组件（如播放器）的 CSS 常常是懒加载的，晚于本组件挂载，
 * 不重新扫描的话它们内部的 cursor 声明会漏掉。
 */
function startWatchingStylesheets(): void {
  if (observer) return
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (isOwnStyle(node)) continue
        if (node instanceof HTMLStyleElement || node instanceof HTMLLinkElement) {
          window.clearTimeout(rescanTimer)
          rescanTimer = window.setTimeout(() => {
            if (!enabled.value) return
            clear()
            apply()
          }, 400)
          return
        }
      }
    }
  })
  observer.observe(document.head, { childList: true })
}

function stopWatchingStylesheets(): void {
  observer?.disconnect()
  observer = null
  window.clearTimeout(rescanTimer)
}

onMounted(() => {
  if (isCoarse.value) return // 触摸设备不启用
  if (!readPref()) return
  apply()
  enabled.value = true
  startWatchingStylesheets()
})

// 只清理样式，不写偏好，避免热更新把开关“误关”
onUnmounted(() => {
  stopWatchingStylesheets()
  clear()
})

watch(
  () => [props.size, props.base],
  () => {
    if (!enabled.value) return
    clear()
    apply()
  }
)

function toggle(): void {
  if (enabled.value) {
    clear()
    enabled.value = false
    writePref(false)
  } else {
    apply()
    enabled.value = true
    writePref(true)
  }
}
</script>

<style scoped>
.ani-cursor-toggle {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483646;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(125, 125, 125, 0.35);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  color: #555;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transition: transform 0.15s ease, color 0.15s ease;
}
.ani-cursor-toggle:hover {
  transform: scale(1.08);
  color: #222;
}
.ani-cursor-toggle[aria-pressed='false'] {
  color: #bbb;
}
</style>
