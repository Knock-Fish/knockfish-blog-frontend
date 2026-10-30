// qrcode-generator v2.0.4（MIT，Kazuhiko Arase）的最小类型声明
// 只声明本项目用到的 API，避免引入第三方 d.ts 的 `export =` 与 ESM 冲突
declare function qrcode(
    typeNumber: number,
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
): {
    addData(data: string, mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'): void
    make(): void
    getModuleCount(): number
    isDark(row: number, col: number): boolean
    createDataURL(cellSize?: number, margin?: number): string
    createSvgTag(cellSize?: number, margin?: number): string
}

export default qrcode
