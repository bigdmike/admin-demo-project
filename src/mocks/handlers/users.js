import { delay, HttpResponse } from 'msw'
import { db } from '../database/users'
import { isTokenExpired, setTokenValidity, withAuth } from '../middleware/auth'

export const userHandlers = {
  // 1. 模擬登入 (可模擬 JWT Token)
  login: async ({ request }) => {
    await delay(200)
    const { account, password } = await request.json()

    const user = db.users.findFirst({
      where: { account: { equals: String(account) }, password: { equals: String(password) } },
    })

    if (user) {
      const fakeToken = `mock-access-token-${user.id}-${Date.now()}`
      const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`

      return HttpResponse.json(
        {
          code: 200,
          user: { name: user.name, role: user.role },
          authToken: fakeToken,
          message: '登入成功',
        },
        {
          headers: {
            'Set-Cookie': `refresh_token=${refreshToken}; Path=/; Max-Age=86400; SameSite=Lax;`,
          },
        },
      )
    }

    return HttpResponse.json({ message: '帳號或密碼錯誤' }, { status: 401 })
  },

  // 2. 獲取使用者資訊
  getUserInfo: withAuth(async ({ userId }) => {
    const user = db.users.findFirst({
      where: { id: { equals: Number(userId) } },
    })

    if (!user) {
      return HttpResponse.json({ message: '使用者不存在' }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      user: { name: user.name, role: user.role },
    })
  }),

  // 3. 刷新 Token API
  refreshToken: async ({ cookies }) => {
    await delay(200)
    const refreshToken = cookies.refresh_token

    if (!refreshToken) {
      return HttpResponse.json({ message: 'RefreshToken 無效，請重新登入' }, { status: 403 })
    }
    if (isTokenExpired({ token: refreshToken, refresh: true })) {
      return HttpResponse.json({ message: 'RefreshToken 過期，請重新登入' }, { status: 401 })
    }

    const tokenData = refreshToken.split('-')
    const userId = tokenData[3]
    const newFakeToken = `mock-access-token-${userId}-${Date.now()}`
    const newRefreshToken = `mock-refresh-token-${userId}-${Date.now()}`

    return HttpResponse.json({
      code: 200,
      authToken: newFakeToken,
      message: 'Token 刷新成功',
    },
    {
      headers: {
        'Set-Cookie': `refresh_token=${newRefreshToken}; Path=/; Max-Age=86400; SameSite=Lax;`,
      },
    })
  },

  // 4. 登出 (清除 Cookie)
  logout: () => {
    return new HttpResponse({
      code: 200,
      message: '登出成功',
    }, {
      headers: {
        'Set-Cookie': 'refresh_token=; Path=/; Max-Age=0;', // 讓 MSW 的 Cookie Jar 主動失效
      },
    })
  },

  // 5. 強制refresh token過期 (測試用)
  expireRefreshToken: () => {
    setTokenValidity({ accessTokenValid: true, refreshTokenValid: false })
    return HttpResponse.json({ message: '已成功將 RefreshToken 設為過期狀態' })
  },
}
