/** 画幅：横图 / 竖图 / 方图 */
export type PhotoOrientation = 'landscape' | 'portrait' | 'square'

/** 筛选条件：全部 + 三种画幅 */
export type OrientationFilter = 'all' | PhotoOrientation

export interface Photo {
    /** 唯一标识：后端 photoId 转字符串 */
    id: string
    /** 列表用地址：缩略图（宽 640 WebP） */
    src: string
    /** 大图用地址：预览图（长边 1600），小图时等于缩略图 */
    preview?: string
    /** 原图地址，保存/新窗口打开用 */
    original?: string
    /** 展示标题 */
    title: string
    width: number
    height: number
    /** 是否敏感：列表缩略图打码，点开大图正常显示 */
    nsfw?: boolean
    /** 上传时间戳（毫秒），用于排序 */
    takenAt: number
}
