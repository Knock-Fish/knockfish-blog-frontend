import axios from "axios"
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from "axios"
import { ApiStatus } from "./status"

const REQUEST_TIMEOUT = 15000
const { VITE_API_URL } = import.meta.env

interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

const requestCache = new Map<string, CacheItem>()
const pendingRequests = new Map<string, Promise<any>>()

function generateCacheKey(config: AxiosRequestConfig): string {
  const method = config.method?.toUpperCase() || 'GET'
  const url = config.url || ''
  const params = config.params ? JSON.stringify(config.params) : ''
  const data = config.data && typeof config.data === 'object' ? JSON.stringify(config.data) : ''
  return `${method}_${url}_${params}_${data}`
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  let inThrottle = false
  return ((...args: any[]) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

const service = axios.create({
    baseURL: VITE_API_URL,
    timeout: REQUEST_TIMEOUT,
})

service.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
        if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
            request.headers.set('Content-Type', 'application/json')
            request.data = JSON.stringify(request.data)
        }
        return request
    },
    (error) => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    (response: AxiosResponse<Api.Http.BaseResponse>) => {
        const res = response.data
        if (res.code !== ApiStatus.success) {
            // 带上业务码，调用方可区分「未登录 401」与「相册需密码 40101」
            const err = new Error(res.msg || 'Error') as Error & { code?: number }
            err.code = res.code
            return Promise.reject(err)
        }
        return res.data
    },
    (error) => {
        return Promise.reject(error)
    }
)

async function request<T = any>(config: AxiosRequestConfig & { cache?: boolean; ttl?: number }): Promise<T> {
    const { cache = false, ttl = 60000, ...axiosConfig } = config

    if (axiosConfig.method?.toUpperCase() === 'POST' ||
        axiosConfig.method?.toUpperCase() === 'PUT') {
        if (axiosConfig.params && !axiosConfig.data) {
            axiosConfig.data = axiosConfig.params
            axiosConfig.params = undefined
        }
    }

    const cacheKey = generateCacheKey(axiosConfig)

    if (cache && axiosConfig.method?.toUpperCase() === 'GET') {
        const cached = requestCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data as T
        }
    }

    const pending = pendingRequests.get(cacheKey)
    if (pending) {
        return pending as Promise<T>
    }

    const requestPromise = service.request<Api.Http.BaseResponse<T>>(axiosConfig).then((data) => {
        if (cache && axiosConfig.method?.toUpperCase() === 'GET') {
            requestCache.set(cacheKey, {
                data,
                timestamp: Date.now(),
                ttl
            })
        }
        pendingRequests.delete(cacheKey)
        return data
    }).catch((error) => {
        pendingRequests.delete(cacheKey)
        throw error
    })

    pendingRequests.set(cacheKey, requestPromise)
    return requestPromise as Promise<T>
}

function clearCache(url?: string): void {
    if (url) {
        requestCache.forEach((_, key) => {
            if (key.includes(url)) {
                requestCache.delete(key)
            }
        })
    } else {
        requestCache.clear()
    }
}

const api = {
    get<T>(config: AxiosRequestConfig & { cache?: boolean; ttl?: number }): Promise<T> {
        return request<T>({ ...config, method: 'GET' })
    },
    post<T>(config: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'POST' })
    },
    put<T>(config: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'PUT' })
    },
    del<T>(config: AxiosRequestConfig): Promise<T> {
        return request<T>({ ...config, method: 'DELETE' })
    },
    request<T>(config: AxiosRequestConfig & { cache?: boolean; ttl?: number }): Promise<T> {
        return request<T>({ ...config })
    },
    clearCache
}

export { debounce, throttle, clearCache }
export default api