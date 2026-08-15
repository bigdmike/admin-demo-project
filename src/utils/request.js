import axios from 'axios'
import pinia from '@/plugins/pinia'
import router from '@/router'
import { useAppStore } from '@/stores/app'

let inMemoryAccessToken = null
let isRefreshing = false
let requestsQueue = []

const request = axios.create({
  baseURL: '/api', // MSW handler 匹配 /api 開頭的路徑
  timeout: 30 * 1000,
  withCredentials: true, // 允許跨域/同域請求攜帶 Cookie 憑證
})

function redirectToLogin () {
  const currentPath = router.currentRoute.value.fullPath
  if (currentPath === '/login') {
    return
  }
  // 如果currentPath的query已經有redirect參數，則不再添加，避免重複
  if (router.currentRoute.value.query.redirect) {
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.query.redirect },
    })
    return
  }

  router.push({
    path: '/login',
    query: { redirect: currentPath },
  })
}

// Request 攔截器：攜帶 Token
request.interceptors.request.use(config => {
  if (inMemoryAccessToken) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`
  }
  return config
})

// Response 攔截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config

    // 排除登入、刷新自身失敗，避免死循環
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise(resolve => {
          requestsQueue.push(newToken => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 呼叫刷新 API：完全不用傳 Body，瀏覽器會自動帶上 refresh_token Cookie
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        const newAccessToken = res.data.authToken

        setAccessToken(newAccessToken)

        for (const cb of requestsQueue) {
          cb(newAccessToken)
        }
        requestsQueue = []

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return request(originalRequest)
      } catch (error_) {
        // RefreshToken 也過期 (401/403)，清空隊列並導向登入頁
        requestsQueue = []
        setAccessToken(null)
        const appStore = useAppStore(pinia)
        appStore.setSnackbar({
          show: true,
          message: '登入逾期，請重新登入',
          type: 'error',
        })
        redirectToLogin()
        throw error_
      } finally {
        isRefreshing = false
      }
    }

    throw error
  },
)

export function setAccessToken (token) {
  inMemoryAccessToken = token
}

export default request
