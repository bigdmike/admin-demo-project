import { resetDatabase as resetProductDb, setupDatabase as setupProductDb } from './products'
import { resetDatabase as resetUserDb, setupDatabase as setupUserDb } from './users'

// 初始化資料（若 localStorage 沒有就塞入預設值）
export function initDb () {
  setupUserDb()
  setupProductDb()
}

// 重置資料按鈕（面試展示很實用）
export function resetDb () {
  resetUserDb()
  resetProductDb()
  window.location.reload()
}
