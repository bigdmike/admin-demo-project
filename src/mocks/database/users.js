import { factory, primaryKey } from '@mswjs/data'
const DB_STORAGE_KEY = 'MOCK_DATABASE_USERS_STATE'

export const db = factory({
  // 1. 分類表
  users: {
    id: primaryKey(Number),
    name: String,
    role: String,
    account: String,
    password: String,
  },
})

export function initMockDatabase () {
  db.users.create({ id: 1, name: 'Admin User', role: 'admin', account: 'admin@example.com', password: 'admin123' })
  db.users.create({ id: 2, name: 'Guest User', role: 'viewer', account: 'guest@example.com', password: 'guest123' })
}

// 1. 初始化資料庫（帶 LocalStorage 判斷）
export function setupDatabase () {
  const savedData = localStorage.getItem(DB_STORAGE_KEY)

  if (savedData) {
    try {
      // 若 LocalStorage 有資料，反序列化並塞入 @mswjs/data
      const parsed = JSON.parse(savedData)

      // 依序還原各表資料
      if (parsed.users) {
        for (const item of parsed.users) {
          db.users.create(item)
        }
      }
      return
    } catch (error) {
      console.warn('還原 Mock DB 失敗，改用預設 Seed', error)
      localStorage.removeItem(DB_STORAGE_KEY)
    }
  }

  // 若 LocalStorage 沒有資料，執行原本的 Seed 邏輯
  initMockDatabase()
  persistDatabase()
}

// 2. 將當前記憶體狀態寫入 LocalStorage
export function persistDatabase () {
  const snapshot = {
    users: db.users.getAll(),
  }

  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(snapshot))
}

// 3. 提供一鍵重置功能（方便後台測試按鈕）
export function resetDatabase () {
  localStorage.removeItem(DB_STORAGE_KEY)
}
