<template>
    <div class="live2d-widget"
        :class="{ 'is-hidden': !visible }"
        :style="{ left: widgetX + 'px', top: widgetY + 'px' }">
        <!-- 模型画布 -->
        <div class="canvas-wrapper" ref="canvasWrapperRef">
            <canvas ref="canvasRef"></canvas>
        </div>

        <!-- 工具栏 -->
        <transition name="slide">
            <div class="toolbar" v-show="visible">
                <div class="toolbar-item" :title="toolbarVisible ? '隐藏工具栏' : '显示工具栏'"
                    @click="toggleToolbarVisible">
                    <SvgIcon :icon="toolbarVisible ? 'mdi:chevron-left' : 'mdi:chevron-right'" />
                </div>
                <div class="toolbar-list" v-show="toolbarVisible">
                    <div class="toolbar-item" v-for="exp in expressions" :key="exp"
                        :title="exp" @click="playExpression(exp)">
                        <SvgIcon :icon="expressionIconMap[exp] ?? defaultExpressionIcon" />
                    </div>
                    <div class="toolbar-item" title="随机动作" @click="playRandomMotion">
                        <SvgIcon icon="mdi:shuffle" />
                    </div>
                    <div class="toolbar-item" title="切换表情" @click="playRandomExpression">
                        <SvgIcon icon="mdi:emoticon" />
                    </div>
                </div>
            </div>
        </transition>

        <!-- 显示/隐藏按钮 -->
        <div class="toggle-btn" @click="toggleVisible" :title="visible ? '隐藏' : '显示'">
            <SvgIcon :icon="visible ? 'mdi:chevron-down' : 'mdi:cat'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Application, Ticker } from 'pixi.js'
import { Live2DModel, MotionPriority } from 'pixi-live2d-display/cubism4'

// 注册 Ticker
Live2DModel.registerTicker(Ticker)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWrapperRef = ref<HTMLDivElement | null>(null)

const visible = ref(true)
const toolbarVisible = ref(true)
const expressions = ref<string[]>([])

// 自定义表情图标映射：表情名 -> icon名。找不到匹配时用默认图标。
const expressionIconMap: Record<string, string> = {
    // '水': 'mdi:water',
    // '葱': 'mdi:leaf',
    // '唱': 'mdi:microphone',
    // '比': 'mdi:heart',
    // '前': 'mdi:camera',
    // 'Q': 'mdi:emoticon-kiss',
    // '圈': 'mdi:checkbox-blank-circle',
    // '脸': 'mdi:emoticon-happy',
}
const defaultExpressionIcon = 'mdi:emoticon-outline'
const loading = ref(true)

let app: Application | null = null
let model: InstanceType<typeof Live2DModel> | null = null

// 模型路径
const modelPath = `${import.meta.env.BASE_URL}models/miku/miku.model3.json`

// 窗口尺寸
const { height: winHeight } = useWindowSize()

// 拖拽（useDraggable 自动处理 pointerdown/move/up，自动清理）
const { x: widgetX, y: widgetY } = useDraggable(canvasWrapperRef, {
    initialValue: { x: 20, y: winHeight.value - 420 }
})

// 初始化 PixiJS 应用
const initApp = () => {
    if (!canvasRef.value) return

    app = new Application({
        view: canvasRef.value,
        autoStart: true,
        backgroundAlpha: 0,
        antialias: true,
        width: 300,
        height: 400,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    })
}

// 加载 Live2D 模型
const loadModel = async () => {
    if (!app) return
    try {
        model = await Live2DModel.from(modelPath, { autoInteract: false })
        app.stage.addChild(model)

        // 缩放并定位模型
        adjustModelSize()

        // 提取可用表情列表
        const internalModel = (model as any).internalModel
        if (internalModel?.motionManager?.definitions?.Expressions) {
            expressions.value = internalModel.motionManager.definitions.Expressions.map(
                (e: any) => e.Name
            )
        }
        // 备用：从 settings 中读取
        if (expressions.value.length === 0 && internalModel?.settings) {
            const exps = internalModel.settings.expressions || []
            expressions.value = exps.map((e: any) => e.Name || e.name)
        }


        // 点击模型触发随机表情
        model.on('hit', () => {
            playRandomExpression()
        })

        loading.value = false

        // 播放待机动作
        playMotion('Idle', 0)
    } catch (err) {
        console.error('Live2D 模型加载失败:', err)
    }
}

// 调整模型尺寸（适配画布）
const adjustModelSize = () => {
    if (!model || !canvasRef.value) return

    const canvasWidth = 300
    const canvasHeight = 400

    // 重置缩放以获取原始尺寸，避免叠加放大
    model.scale.set(1)

    const scale = Math.min(
        canvasWidth / model.width,
        canvasHeight / model.height
    )

    model.scale.set(scale)
    model.anchor.set(0.5, 0.5)
    model.x = canvasWidth / 2
    model.y = canvasHeight / 2
}

// 鼠标跟随
const handleMouseMove = (e: MouseEvent) => {
    if (!model || !canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    model.focus(e.clientX - rect.left, e.clientY - rect.top)
}

// 播放表情
const playExpression = (name: string) => {
    if (!model) return
    model.expression(name)
}

// 随机播放表情
const playRandomExpression = () => {
    if (!model || expressions.value.length === 0) return
    const name = expressions.value[Math.floor(Math.random() * expressions.value.length)]
    model.expression(name)
}

// 播放动作
const playMotion = (group: string, index: number) => {
    if (!model) return
    model.motion(group, index, MotionPriority.NORMAL)
}

// 随机播放动作
const playRandomMotion = () => {
    if (!model) return
    const internalModel = (model as any).internalModel
    const motionGroups = internalModel?.motionManager?.definitions
    if (motionGroups) {
        const groups = Object.keys(motionGroups)
        if (groups.length > 0) {
            const group = groups[Math.floor(Math.random() * groups.length)]
            const motions = motionGroups[group]
            if (motions && motions.length > 0) {
                const index = Math.floor(Math.random() * motions.length)
                model.motion(group, index, MotionPriority.NORMAL)
                return
            }
        }
    }
    model.motion('Idle', 0, MotionPriority.NORMAL)
}

// 切换显示/隐藏
const toggleVisible = () => {
    visible.value = !visible.value
}

// 切换工具栏显示/隐藏
const toggleToolbarVisible = () => {
    toolbarVisible.value = !toolbarVisible.value
}

// 事件监听（useEventListener 自动清理）
useEventListener(canvasWrapperRef, 'mousemove', handleMouseMove)
useEventListener(window, 'resize', adjustModelSize)

onMounted(async () => {
    initApp()
    await loadModel()
})

onBeforeUnmount(() => {
    if (model) {
        model.destroy()
        model = null
    }
    if (app) {
        app.destroy(true)
        app = null
    }
})
</script>

<style lang="scss" scoped>
.live2d-widget {
    position: fixed;
    z-index: 99999;
    user-select: none;
    pointer-events: none;

    &.is-hidden {
        .canvas-wrapper {
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px);
        }
    }

    .canvas-wrapper {
        position: relative;
        width: 300px;
        height: 400px;
        opacity: 1;
        transition: opacity 0.3s ease, transform 0.3s ease;
        cursor: grab;
        pointer-events: auto;

        &:active {
            cursor: grabbing;
        }

        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    }

    .toolbar {
        position: absolute;
        left: 10px;
        bottom: 10px;
        display: flex;
        flex-direction: column;
        // gap: 6px;
        // padding: 8px 6px;
        background: rgba(255, 255, 255, 0.75);
        border-radius: 20px;
        backdrop-filter: blur(8px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: opacity 0.3s ease;
        pointer-events: auto;

        .toolbar-list {
            display: flex;
            flex-direction: column;
            // gap: 6px;
            padding-top: 6px;
            margin-top: 4px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .toolbar-item {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
            color: #333;
            font-size: 20px;

            &:hover {
                // background: rgba(116, 185, 255, 0.3);
                transform: scale(1.1);
            }
        }
    }

    .toggle-btn {
        position: absolute;
        left: 10px;
        bottom: -50px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.75);
        border-radius: 50%;
        cursor: pointer;
        backdrop-filter: blur(8px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: background 0.2s ease, transform 0.2s ease;
        color: #333;
        font-size: 20px;
        pointer-events: auto;

        &:hover {
            background: rgba(116, 185, 255, 0.3);
            transform: scale(1.1);
        }
    }

    // 滑入滑出动画
    .slide-enter-active,
    .slide-leave-active {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .slide-enter-from,
    .slide-leave-to {
        opacity: 0;
        transform: translateX(-10px);
    }
}

// 移动端隐藏
@media (max-width: $screen-medium) {
    .live2d-widget {
        display: none;
    }
}
</style>
