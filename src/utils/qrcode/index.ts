import qrcode from './qrcode.mjs'

/**
 * 二维码生成
 *
 * 为什么自带一份 `qrcode.mjs`：只为一个二维码引一个 npm 依赖不划算，
 * 这个库是单文件、无依赖、MIT，52KB 且只在生成海报时才被动态加载。
 */
export interface QrMatrix {
    /** 边长（模块数，含定位图案） */
    size: number
    /** isDark(row, col) 为 true 表示该模块是黑块 */
    isDark: (row: number, col: number) => boolean
}

/**
 * 把文本编码成二维码点阵
 * 直接返回点阵而不是 dataURL：用 fillRect 逐格绘制比缩放位图清晰，边缘不会发虚
 */
export function createQrMatrix(text: string): QrMatrix {
    const qr = qrcode(0, 'M')
    qr.addData(text)
    qr.make()
    const size = qr.getModuleCount()
    return {
        size,
        isDark: (row, col) => qr.isDark(row, col),
    }
}
