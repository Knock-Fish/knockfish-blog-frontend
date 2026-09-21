/** 解码后的单个 .ani 文件 */
export interface DecodedAni {
  /** 每一帧（尺寸为光标原始像素，如 128×128） */
  frames: HTMLCanvasElement[]
  /** 与 frames 等长的每帧时长（毫秒） */
  durations: number[]
  /** 热区：鼠标实际生效点相对图像左上角的偏移（原始像素空间） */
  hotspot: { x: number; y: number }
  /** 原始尺寸（像素） */
  size: { w: number; h: number }
}

/** 单帧的播放信息 */
export interface FrameInfo {
  /** 指向 frameURLs 的下标 */
  index: number
  /** 该帧持续时长（毫秒） */
  duration: number
}

/** 加载完成的 ani 光标信息 */
export interface ANIInfo {
  /** @keyframes 名称 */
  keyframesName: string
  /** @keyframes 规则文本 */
  keyFrameContent: string
  /** 一次完整循环所需时间（毫秒） */
  totalRoundTime: number
  /** 每一帧的图像数据 URL，按文件内数据顺序排列 */
  frameURLs: string[]
  /** 播放顺序与时长，应从这里取帧索引 */
  frameInfo: FrameInfo[]
  /** 热点（已按目标尺寸缩放） */
  hotspot: { x: number; y: number }
  /** 动画失效时回退的系统光标 */
  cursorType: string
}

/** 用于管理一次光标设置的控制器 */
export interface CursorController {
  /** 光标已加载并注入页面 */
  readonly ready: Promise<void>
  /** 当前控制器是否已被销毁 */
  readonly destroyed: boolean
  /** 移除本次创建的动画样式 */
  destroy(): void
}
