import { http } from 'msw'
import { setupWorker } from 'msw/browser'
import { productCategoriesHandlers } from './handlers/productCategories'
import { userHandlers } from './handlers/users'

export const worker = setupWorker(

  // 使用者相關的 API
  http.post('/api/auth/login', userHandlers.login),
  http.get('/api/auth/me', userHandlers.getUserInfo),
  http.post('/api/auth/refresh', userHandlers.refreshToken),
  http.post('/api/auth/logout', userHandlers.logout),
  http.post('/api/auth/expire-refresh-token', userHandlers.expireRefreshToken),

  // 商品分類相關的 API
  http.get('/api/product/categories', productCategoriesHandlers.getCategories),
  http.get('/api/product/categories/:id', productCategoriesHandlers.getCategory),
  http.post('/api/product/categories', productCategoriesHandlers.createCategory),
  http.put('/api/product/categories/sort', productCategoriesHandlers.sortCategories),
  http.put('/api/product/categories/:id', productCategoriesHandlers.updateCategory),
  http.delete('/api/product/categories/:id', productCategoriesHandlers.deleteCategory),
)
