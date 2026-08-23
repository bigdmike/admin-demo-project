import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始狀態應為未登入', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.accessToken).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('設置 Access Token 後應更新認證狀態', () => {
    const auth = useAuthStore()
    auth.setAccessToken('mock_token')
    expect(auth.accessToken).toBe('mock_token')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('設置 user 後應更新使用者資訊', () => {
    const auth = useAuthStore()
    const mockUser = { id: 1, name: 'Test User' }
    auth.setUser(mockUser)
    expect(auth.user).toEqual(mockUser)
  })

  it('執行logout後資訊應清空', () => {
    const auth = useAuthStore()
    auth.logout()
    expect(auth.accessToken).toBeNull()
    expect(auth.user).toBeNull()
  })
})
