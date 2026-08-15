// src/mocks/middleware/auth.js
import { HttpResponse } from 'msw'

const options = {
  isAccessTokenValid: true,
  isRefreshTokenValid: true,
}

/**
 * withAuth: 高階驗證中介層
 * @param {Function} resolver 真正的業務邏輯 handler
 */
export function withAuth (resolver) {
  return async info => {
    const { request } = info
    const authHeader = request.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    const isAccessTokenExpired = isTokenExpired({ token })

    // 1. 檢查是否有帶 Token
    if (!token) {
      return HttpResponse.json(
        { code: 401, message: '未提供 AccessToken，請先登入' },
        { status: 401 },
      )
    }

    // 2. 檢查 Token 是否已被標記為過期 / 無效
    if (isAccessTokenExpired) {
      return HttpResponse.json(
        { code: 401, message: 'AccessToken 已過期' },
        { status: 401 },
      )
    }

    // 3. 通過驗證執行原本的業務邏輯
    const tokenData = token.split('-')
    const userId = tokenData[3]
    info.userId = userId
    return resolver(info)
  }
}

export function isTokenExpired ({ token, refresh = false }) {
  if (!token) {
    return true
  }
  const parts = token.split('-')
  if (parts.length < 5) {
    return true
  }
  const timestamp = Number.parseInt(parts[4], 10)
  const now = Date.now()

  return refresh
    ? !options.isRefreshTokenValid || now - timestamp > 360 * 1000 // 假設 refresh token 有效期為 180 秒
    : !options.isAccessTokenValid || now - timestamp > 5 * 1000 // 假設 access token 有效期為 5 秒
}

export function setTokenValidity ({ accessTokenValid, refreshTokenValid }) {
  options.isAccessTokenValid = accessTokenValid
  options.isRefreshTokenValid = refreshTokenValid
}
