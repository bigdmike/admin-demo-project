import { flushPromises, mount } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VAlert } from 'vuetify/components'
import LoginPage from '@/pages/LoginPage.vue'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import { server } from '../../mocks/server'

// 1. Mock Vue Router 的 push 與 currentRoute
const mockPush = vi.fn()
let mockCurrentRoute = { query: {} }
let pinia

vi.mock(import('vue-router'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      currentRoute: {
        get value () {
          return mockCurrentRoute
        },
      },
      push: mockPush,
    }),
    useRoute: () => mockCurrentRoute,
  }
})

describe('Login.vue 登入畫面功能驗證', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mockPush.mockClear()
    mockCurrentRoute = { query: {} }
  })

  // Helper：建立元件掛載環境
  const createWrapper = () => {
    return mount(LoginPage, {
      global: {
        plugins: [pinia, vuetify],
      },
    })
  }

  it('1. 表單為空時點擊登入，應顯示錯誤且不發送 API', async () => {
    const wrapper = createWrapper()

    // 點擊登入按鈕
    await wrapper.find('[data-testid="login-btn"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('請輸入帳號.')
    expect(wrapper.text()).toContain('請輸入密碼.')

    // router push 不應該被呼叫，因為沒有成功登入
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('2. 輸入正確帳密登入成功，應更新 Store 狀態並導航至首頁', async () => {
    const authStore = useAuthStore()
    const wrapper = createWrapper()
    const accountField = wrapper.find('[data-testid="account-input"]')
    const accountFieldInput = accountField.find('input')
    const passwordField = wrapper.find('[data-testid="password-input"]')
    const passwordFieldInput = passwordField.find('input')
    const loginBtn = wrapper.find('[data-testid="login-btn"]')

    // 透過 MSW 模擬登入成功回應
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json({
          authToken: 'valid_access_token',
          user: { id: 1, name: 'Admin', role: 'admin' },
        })
      }),
    )

    // 輸入帳號與密碼
    await accountFieldInput.setValue('admin@example.com')
    await passwordFieldInput.setValue('password123')
    await loginBtn.trigger('click')

    // 等待非同步請求與 DOM 更新完成
    await vi.waitFor(() => {
      // 驗證 Pinia 狀態是否被正確更新
      expect(authStore.accessToken).toBe('valid_access_token')
      expect(authStore.user?.name).toBe('Admin')
      // 驗證是否導航至首頁
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('3. 若 URL 帶有 redirect 參數，登入成功應導向指定目標路徑', async () => {
    // 模擬從 /products 踢過來的 query
    mockCurrentRoute = { query: { redirect: '/products' } }

    const wrapper = createWrapper()
    const accountField = wrapper.find('[data-testid="account-input"]')
    const accountFieldInput = accountField.find('input')
    const passwordField = wrapper.find('[data-testid="password-input"]')
    const passwordFieldInput = passwordField.find('input')
    const loginBtn = wrapper.find('[data-testid="login-btn"]')

    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json({
          authToken: 'valid_access_token',
          user: { id: 1, name: 'Admin' },
        })
      }),
    )

    await accountFieldInput.setValue('admin@gmail.com')
    await passwordFieldInput.setValue('password123')
    await loginBtn.trigger('click')

    await vi.waitFor(() => {
      // 驗證是否正確轉跳至 query.redirect 的路徑
      expect(mockPush).toHaveBeenCalledWith('/products')
    })
  })

  it('4. 帳密錯誤登入失敗時，應跳出錯誤提示且留在登入頁', async () => {
    const authStore = useAuthStore()
    const wrapper = createWrapper()
    const accountField = wrapper.find('[data-testid="account-input"]')
    const accountFieldInput = accountField.find('input')
    const passwordField = wrapper.find('[data-testid="password-input"]')
    const passwordFieldInput = passwordField.find('input')
    const loginBtn = wrapper.find('[data-testid="login-btn"]')
    const expectedErrorMsg = '帳號或密碼錯誤，請重新輸入'

    // 模擬後端回傳 401 登入失敗
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json({ message: expectedErrorMsg }, { status: 401 })
      }),
    )

    await accountFieldInput.setValue('wrong_user@gmail.com')
    await passwordFieldInput.setValue('wrong_pass')
    await loginBtn.trigger('click')
    await flushPromises()

    await vi.waitFor(() => {
      if (wrapper.vm.errorMessage !== undefined) {
        expect(wrapper.vm.errorMessage).toBe(expectedErrorMsg)
      }
      const alertComponent = wrapper.findComponent(VAlert)

      expect(alertComponent.exists()).toBe(true)
      expect(alertComponent.text()).toContain(expectedErrorMsg)
      expect(authStore.accessToken).toBeNull()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
