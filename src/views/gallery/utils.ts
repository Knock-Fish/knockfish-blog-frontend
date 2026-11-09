import type { Photo, PhotoOrientation } from './types'

/** 宽高比，数据缺失时按 4:3 */
export const ratioOf = (photo: Pick<Photo, 'width' | 'height'>) =>
    photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 4 / 3

/** 画幅判定：差值在 2px 内视为方图 */
export const orientationOf = (photo: Pick<Photo, 'width' | 'height'>): PhotoOrientation => {
    if (Math.abs(photo.width - photo.height) <= 2) return 'square'
    return photo.width > photo.height ? 'landscape' : 'portrait'
}

export const sizeTextOf = (photo: Pick<Photo, 'width' | 'height'>) =>
    `${Math.round(photo.width)} × ${Math.round(photo.height)}`

/* ------------------------------------------------------------------
 * 私密相册令牌
 * 只存 sessionStorage：关掉标签页即失效；URL 参数一律不作为凭据。
 * 列表页与相册页共用，列表页据此判断「已解锁过的相册直接进」。
 * ------------------------------------------------------------------ */

const albumTokenKey = (albumId: number) => `gallery:album:${albumId}:token`

/** 读取仍然有效的令牌，过期的顺手清掉 */
export function readAlbumToken(albumId: number): string | null {
    try {
        const raw = sessionStorage.getItem(albumTokenKey(albumId))
        if (!raw) return null
        const saved = JSON.parse(raw) as { token?: string; exp?: number }
        if (!saved.token || !saved.exp || saved.exp * 1000 <= Date.now()) {
            sessionStorage.removeItem(albumTokenKey(albumId))
            return null
        }
        return saved.token
    } catch {
        return null
    }
}

export function saveAlbumToken(albumId: number, token: string, expiresIn: number): void {
    try {
        sessionStorage.setItem(albumTokenKey(albumId), JSON.stringify({
            token,
            exp: Math.floor(Date.now() / 1000) + expiresIn,
        }))
    } catch {
        // 隐私模式下可能写不进去，忽略：当前页面内存里仍持有令牌
    }
}

export function clearAlbumToken(albumId: number): void {
    try {
        sessionStorage.removeItem(albumTokenKey(albumId))
    } catch {
        /* ignore */
    }
}
