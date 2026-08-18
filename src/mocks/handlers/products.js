// src/mocks/handlers.js
import { delay, HttpResponse } from 'msw'
import { db, persistDatabase } from '../database/products'
import { withAuth } from '../middleware/auth'
import { presentProduct } from '../presenters/product'

export const productHandlers = {

  // 1. 獲取商品列表
  getProducts: withAuth(async ({ request }) => {
    await delay(200)
    // 1. 將 request.url 轉成 URL 物件
    const url = new URL(request.url)

    // 2. 使用 searchParams 取得單一參數（沒傳時回傳 null）
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const keyword = url.searchParams.get('keyword') || ''
    const products = db.product.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    }).map(product => presentProduct(db, product))

    // 3. 根據 keyword 過濾分類
    const filteredProducts = products.filter(product =>
      product.name.includes(keyword),
    ).map(product => {
      let stockQuantity = product.variants.map(variant => variant.inventory.stockQuantity || 0)
      stockQuantity = stockQuantity.reduce((a, b) => a + b, 0)
      return {
        name: product.name,
        status: product.status,
        stockQuantity,
        id: product.id,
        soldCount: 0,
      }
    })

    // 4. 分頁邏輯
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 200,
      items: paginatedProducts,
      total: filteredProducts.length,
      page: Number(page),
      limit: Number(limit),
    })
  }),

  // 2. 獲取單一商品
  getProduct: withAuth(async ({ params }) => {
    await delay(200)
    const product = db.product.findFirst({
      where: { id: { equals: String(params.id) } },
    })

    if (!product) {
      return HttpResponse.json({ message: '商品不存在' }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      product: presentProduct(db, product),
    })
  }),

  // 3. 新增商品
  createProduct: withAuth(async ({ request }) => {
    await delay(200)
    const productData = await request.json()

    // 先將原本的資料排序值+1，確保新商品排在第一位
    db.product.updateMany({
      where: { sortOrder: { gte: 1 } },
      data: { sortOrder: prev => prev + 1 },
    })

    const newProduct = db.product.create({
      ...productData,
      id: 'prod_' + String(Date.now()),
    })
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      product: newProduct,
    })
  }),

  // 5. 排序商品
  sortProducts: withAuth(async ({ request }) => {
    await delay(200)
    const sortData = await request.json()

    // 依照 sortedIds 的順序更新 sortOrder
    for (const item of sortData) {
      db.product.update({
        where: { id: { equals: String(item.id) } },
        data: { sortOrder: item.sortOrder },
      })
    }
    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),

  // 6. 刪除商品
  deleteProduct: withAuth(async ({ params }) => {
    await delay(200)
    const existingProduct = db.product.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingProduct) {
      return HttpResponse.json({ message: '商品不存在' }, { status: 404 })
    }

    db.product.delete({
      where: { id: { equals: String(params.id) } },
    })

    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),
}
