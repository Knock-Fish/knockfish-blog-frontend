/**
 * subset-font 的手写类型声明
 */
declare module 'subset-font' {
  /** 输出格式，默认 woff2 */
  type FontFormat = 'woff' | 'woff2' | 'truetype'

  interface SubsetFontOptions {
    /** 输出字体格式，默认 'woff2' */
    targetFormat?: FontFormat
    /** 保留 OpenType 名称表中的指定 nameId */
    preserveNameIds?: number[]
    /** 是否保留字体的「名称」等元数据，默认剔除 */
    withAncientNameTable?: boolean
    /** CSS unicode-range，用于分片场景 */
    unicodeRange?: string
    /** 字体合集（TTC）中要处理的字体索引，默认 0 */
    fontIndex?: number
    /** 变体字体的坐标轴取值，如 { wght: 700 } */
    variationAxes?: Record<string, number>
  }

  function subsetFont(
    font: Uint8Array | ArrayBuffer | Buffer,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Uint8Array>

  export default subsetFont
}
