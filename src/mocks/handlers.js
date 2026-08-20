import { http } from 'msw'
import { productBrandsHandlers } from './handlers/productBrands'
import { productCategoriesHandlers } from './handlers/productCategories'
import { productHandlers } from './handlers/products'
import { userHandlers } from './handlers/users'

export const handlers = [
  // 使用者相關 API
  http.post('/api/auth/login', userHandlers.login),
  http.get('/api/auth/me', userHandlers.getUserInfo),
  http.post('/api/auth/refresh', userHandlers.refreshToken),
  http.post('/api/auth/logout', userHandlers.logout),
  http.post('/api/auth/expire-refresh-token', userHandlers.expireRefreshToken),

  // 商品分類相關 API
  http.get('/api/product/categories', productCategoriesHandlers.getCategories),
  http.get('/api/product/categories/:id', productCategoriesHandlers.getCategory),
  http.post('/api/product/categories', productCategoriesHandlers.createCategory),
  http.put('/api/product/categories/sort', productCategoriesHandlers.sortCategories),
  http.put('/api/product/categories/:id', productCategoriesHandlers.updateCategory),
  http.delete('/api/product/categories/:id', productCategoriesHandlers.deleteCategory),

  // 商品品牌相關 API
  http.get('/api/product/brands', productBrandsHandlers.getBrands),
  http.get('/api/product/brands/:id', productBrandsHandlers.getBrand),
  http.post('/api/product/brands', productBrandsHandlers.createBrand),
  http.put('/api/product/brands/sort', productBrandsHandlers.sortBrands),
  http.put('/api/product/brands/:id', productBrandsHandlers.updateBrand),
  http.delete('/api/product/brands/:id', productBrandsHandlers.deleteBrand),

  // 商品相關 API
  http.get('/api/products', productHandlers.getProducts),
  http.get('/api/products/:id', productHandlers.getProduct),
  http.post('/api/products', productHandlers.createProduct),
  http.put('/api/products/sort', productHandlers.sortProducts),
  http.delete('/api/products/:id', productHandlers.deleteProduct),
]
