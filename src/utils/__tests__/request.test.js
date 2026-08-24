import { http, HttpResponse } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request' // 你的 axios 實例
import { server } from '../../mocks/server'

describe('Axios 401 Interceptor (純單元測試)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('發送請求時是否有在Header帶入AuthStore的token', async () => {
    // 在authStore中先塞入一個假裝過期的憑證字串
    const authStore = useAuthStore()
    authStore.setAccessToken('test_token')

    let authHeader = null
    server.use(
      http.get('*/api/auth/me', ({ request: req }) => {
        authHeader = req.headers.get('Authorization')

        // 第一次請求會帶著過期的 Token，回傳 401
        if (authHeader === 'Bearer test_token') {
          return HttpResponse.json({ success: true, data: { id: 1, name: 'Admin', role: 'admin' } })
        }

        // 其他情況，回傳 403
        return new HttpResponse(null, { status: 403 })
      }),
    )

    // 發送業務請求（觸發 401 -> 觸發 refresh -> 自動重送）
    const response = await request.get('/api/auth/me')

    expect(response.success).toBe(true)
    expect(authHeader).toBe('Bearer test_token')
  })

  it('遇到 401 時，能自動呼叫換證並使用新 Token 重新送出請求', async () => {
    // 在authStore中先塞入一個假裝過期的憑證字串
    const authStore = useAuthStore()
    authStore.setAccessToken('expired_token')
    let originalApiCallCount = 0

    server.use(
      http.get('*/api/auth/me', ({ request: req }) => {
        originalApiCallCount++
        const authHeader = req.headers.get('Authorization')

        // 第一次請求會帶著過期的 Token，回傳 401
        if (authHeader === 'Bearer expired_token') {
          return new HttpResponse(null, { status: 401 })
        }

        // 第二次請求會帶著新的 Token，回傳成功的使用者資訊
        if (authHeader === 'Bearer refreshed_token_123') {
          return HttpResponse.json({ success: true, data: { id: 1, name: 'Admin', role: 'admin' } })
        }

        // 其他情況，回傳 403
        return new HttpResponse(null, { status: 403 })
      }),

      // 第一次請求回傳401後會出發請求換證的流程，這裡模擬換證成功，回傳新的 Token
      http.post('*/api/auth/refresh', () => {
        return HttpResponse.json({
          authToken: 'refreshed_token_123',
          user: { id: 1, name: 'Admin', role: 'admin' },
        })
      }),
    )

    // 發送業務請求（觸發 401 -> 觸發 refresh -> 自動重送）
    const response = await request.get('/api/auth/me')

    expect(response.success).toBe(true)
    expect(response.data).toEqual({ id: 1, name: 'Admin', role: 'admin' })
    expect(originalApiCallCount).toBe(2)
    expect(authStore.accessToken).toBe('refreshed_token_123')
  })

  it('併發佇列重試', async () => {
    // 在authStore中先塞入一個假裝過期的憑證字串
    const authStore = useAuthStore()
    authStore.setAccessToken('expired_token')
    let originalApiCallCount = 0
    let tokenRefreshCount = 0

    server.use(
      http.get('*/api/auth/me', ({ request: req }) => {
        originalApiCallCount++
        const authHeader = req.headers.get('Authorization')

        // 第一次請求會帶著過期的 Token，回傳 401
        if (authHeader === 'Bearer expired_token') {
          return new HttpResponse(null, { status: 401 })
        }

        // 第二次請求會帶著新的 Token，回傳成功的使用者資訊
        if (authHeader === 'Bearer refreshed_token_123') {
          return HttpResponse.json({ success: true })
        }

        // 其他情況，回傳 403
        return new HttpResponse(null, { status: 401 })
      }),

      // 第一次請求回傳401後會出發請求換證的流程，這裡模擬換證成功，回傳新的 Token
      http.post('*/api/auth/refresh', () => {
        tokenRefreshCount += 1
        return HttpResponse.json({
          authToken: 'refreshed_token_123',
          user: { id: 1, name: 'Admin', role: 'admin' },
        })
      }),
    )

    // 發送業務請求（觸發 401 -> 觸發 refresh -> 自動重送）
    const promiseList = [
      request.get('/api/auth/me'),
      request.get('/api/auth/me'),
      request.get('/api/auth/me'),
    ]
    const response = await Promise.all(promiseList).then(responses => responses)

    expect(response[0].success).toBe(true)
    expect(response[1].success).toBe(true)
    expect(response[2].success).toBe(true)
    expect(originalApiCallCount).toBe(6)
    expect(authStore.accessToken).toBe('refreshed_token_123')
    expect(tokenRefreshCount).toBe(1)
  })

  it('併發佇列401失敗', async () => {
    // 在authStore中先塞入一個假裝過期的憑證字串
    const authStore = useAuthStore()
    authStore.setAccessToken('expired_token')
    let originalApiCallCount = 0
    let refreshCallCount = 0

    server.use(
      http.get('*/api/auth/me', ({ request: req }) => {
        originalApiCallCount++
        const authHeader = req.headers.get('Authorization')

        // 第一次請求會帶著過期的 Token，回傳 401
        if (authHeader === 'Bearer expired_token') {
          return new HttpResponse(null, { status: 401 })
        }

        // 其他情況，回傳 403
        return new HttpResponse(null, { status: 403 })
      }),

      // 第一次請求回傳401後會出發請求換證的流程，這裡模擬換證成功，回傳新的 Token
      http.post('*/api/auth/refresh', () => {
        refreshCallCount += 1
        return new HttpResponse(null, { status: 401 })
      }),
    )

    // 發送業務請求（觸發 401 -> 觸發 refresh -> 自動重送）
    const promiseList = [
      request.get('/api/auth/me'),
      request.get('/api/auth/me'),
      request.get('/api/auth/me'),
      request.get('/api/auth/me'),
    ]
    const responses = await Promise.allSettled(promiseList)

    expect(responses).toHaveLength(4)
    expect(responses.every(({ status }) => status === 'rejected')).toBe(true)
    expect(originalApiCallCount).toBe(4)
    expect(refreshCallCount).toBe(1)
  })
})
