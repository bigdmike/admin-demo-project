// src/api/user.js
import request from '@/utils/request'

// 登入
export function loginApi (data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 登出
export function logoutApi (data) {
  return request({
    url: '/auth/logout',
    method: 'post',
    data,
  })
}

// 取得使用者列表（支援搜尋與分頁參數）
export function getUserInfo () {
  return request({
    url: '/auth/me',
    method: 'get',
  })
}

// refresh token
export function refreshToken () {
  return request({
    url: '/auth/refresh',
    method: 'post',
  })
}

// 強制 refresh token 過期 (測試用)
export function expireRefreshToken () {
  return request({
    url: '/auth/expire-refresh-token',
    method: 'post',
  })
}
