import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './src/tests/server'

// 測試啟動前開啟 MSW 監聽
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 每個測試案例跑完後，還原動態覆寫的 handler
afterEach(() => server.resetHandlers())

// 所有測試結束後關閉 server
afterAll(() => server.close())
