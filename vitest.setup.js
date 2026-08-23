import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/mocks/server'

globalThis.visualViewport = {
  height: 768,
  width: 1024,
  offsetLeft: 0,
  offsetTop: 0,
  addEventListener: () => {},
  removeEventListener: () => {},
}

// 測試啟動前開啟 MSW 監聽
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 每個測試案例跑完後，還原動態覆寫的 handler
afterEach(() => server.resetHandlers())

// 所有測試結束後關閉 server
afterAll(() => server.close())
