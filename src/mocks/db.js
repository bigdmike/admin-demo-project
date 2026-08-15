const INITIAL_USERS = [
  { id: '1', name: 'Admin User', role: 'admin', account: 'admin@example.com', password: 'admin123' },
  { id: '2', name: 'Guest User', role: 'viewer', account: 'guest@example.com', password: 'guest123' },
]

const STORAGE_KEY = 'mock_app_users'

// 初始化資料（若 localStorage 沒有就塞入預設值）
export function initDb () {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS))
  }
}

// 封裝簡單的 CRUD 操作
export const db = {
  getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),

  getUserById: id => {
    const users = db.getUsers()
    return users.find(u => u.id === id)
  },

  addUser: userData => {
    const users = db.getUsers()
    const newUser = { id: String(Date.now()), ...userData }
    users.unshift(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    return newUser
  },

  updateUser: (id, updateData) => {
    const users = db.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) {
      return null
    }
    users[index] = { ...users[index], ...updateData }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    return users[index]
  },

  deleteUser: id => {
    const users = db.getUsers().filter(u => u.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  },

  // 重置資料按鈕（面試展示很實用）
  resetDb: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS))
  },
}
