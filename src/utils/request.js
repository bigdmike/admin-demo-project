import axios from 'axios'
import router from '@/router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

let isRefreshing = false
let requestsQueue = []

const request = axios.create({
  baseURL: '/api', // MSW handler 匹配 /api 開頭的路徑
  timeout: 30 * 1000,
  withCredentials: true, // 允許跨域/同域請求攜帶 Cookie 憑證
})

// 處理佇列排隊的請求（成功給新 Token 重試，失敗全部 Reject 拋錯）
function processQueue (error, token = null) {
  for (const promise of requestsQueue) {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  }
  requestsQueue = []
}

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
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

// Response 攔截器
request.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config
    const authStore = useAuthStore()
    const appStore = useAppStore()
    const isAuthRequest = ['/auth/login', '/auth/refresh']
      .some(path => originalRequest.url.includes(path))

    // 排除登入、刷新自身失敗，避免死循環
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestsQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest._retry = true // 標記已重試，防止二次 401 循環
            originalRequest.headers.Authorization = `Bearer ${token}`
            return request(originalRequest)
          })
          .catch(error_ => {
            throw error_
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 呼叫刷新 API：完全不用傳 Body，瀏覽器會自動帶上 refresh_token Cookie
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        const newAccessToken = res.data.authToken
        const userData = res.data.user

        authStore.setAccessToken(newAccessToken)
        authStore.setUser(userData)

        // 2. 喚醒所有在佇列中排隊的請求，並派發新 Token
        processQueue(null, newAccessToken)

        // 3. 重送自己這第一個請求
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return request(originalRequest)
      } catch (error_) {
        // RefreshToken 也過期 (401/403)，清空隊列並導向登入頁
        processQueue(error_)
        authStore.logout()
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

    throw error.response?.data
  },
)

export default request
