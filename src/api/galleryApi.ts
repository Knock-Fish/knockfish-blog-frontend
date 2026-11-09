import request from "@/utils/http"

/** 后端图库照片出参（前台只读） */
export interface GalleryPhotoVO {
    photoId: number
    fileName: string
    title: string
    thumbUrl: string
    previewUrl: string
    originalUrl: string
    width: number
    height: number
    fileSize: number
    mimeType: string
    /** 0 普通 / 1 敏感（前台列表模糊） */
    nsfw: number
    createTime: string
}

export interface GalleryPhotoPage {
    list: GalleryPhotoVO[]
    pageNum: number
    pageSize: number
    total: number
}

export interface GalleryStats {
    allCount: number
    landscape: number
    portrait: number
    square: number
    totalSize: number
}

export interface GalleryPageParams {
    pageNum?: number
    pageSize?: number
    /** all / landscape / portrait / square，all 时不传 */
    orientation?: string
    /** 相册ID；不传表示「全部」 */
    albumId?: number
}

export interface CaptchaVO {
    captchaId: string
    /** png 的 data URL，可直接放 img.src */
    image: string
}

export interface AlbumUnlockVO {
    token: string
    expiresIn: number
}

/** 前台相册（私密相册不返回封面与照片数，只有 locked 标记） */
export interface GalleryAlbumVO {
    albumId: number
    name: string
    description?: string | null
    coverUrl?: string | null
    photoCount?: number | null
    locked?: boolean
}

export class GalleryService {
    /** 分页查询图库（只含正常状态的照片）；私密相册必须带令牌 */
    static getPhotoPage(params: GalleryPageParams, albumToken?: string) {
        return request.get<GalleryPhotoPage>({
            url: "/api/front/gallery",
            params,
            headers: albumToken ? { "X-Album-Token": albumToken } : undefined,
            // 带令牌的请求不走本地缓存，避免不同解锁状态串数据
            cache: !albumToken,
            ttl: 60000
        })
    }

    /** 获取验证码（2 分钟内有效，一次性） */
    static getCaptcha() {
        return request.get<CaptchaVO>({ url: "/api/front/captcha", cache: false })
    }

    /** 解锁私密相册，成功后拿到访问令牌 */
    static unlockAlbum(albumId: number, data: { captchaId: string; captcha: string; password: string }) {
        return request.post<AlbumUnlockVO>({
            url: `/api/front/gallery/albums/${albumId}/unlock`,
            data
        })
    }

    /** 相册列表 */
    static getAlbums() {
        return request.get<GalleryAlbumVO[]>({
            url: "/api/front/gallery/albums",
            cache: true,
            ttl: 60000
        })
    }

    /** 相册详情（锁态也能拿到名字与 locked） */
    static getAlbum(albumId: number) {
        return request.get<GalleryAlbumVO>({
            url: `/api/front/gallery/albums/${albumId}`,
            cache: true,
            ttl: 60000
        })
    }

    /**
     * 各画幅数量统计，用于筛选标签上的数字。
     *
     * @param albumId 传了只统计该相册；私密相册必须同时传令牌，否则后端返回 40101
     */
    static getStats(albumId?: number, albumToken?: string) {
        return request.get<GalleryStats>({
            url: "/api/front/gallery/stats",
            params: albumId ? { albumId } : undefined,
            headers: albumToken ? { "X-Album-Token": albumToken } : undefined,
            // 带令牌时不同解锁状态的结果不同，不能吃本地缓存
            cache: !albumToken,
            ttl: 60000
        })
    }

    /** 单张详情（灯箱走列表数据即可，这里留给分享链接场景） */
    static getPhotoById(photoId: number) {
        return request.get<GalleryPhotoVO>({
            url: `/api/front/gallery/${photoId}`,
            cache: true,
            ttl: 60000
        })
    }
}
