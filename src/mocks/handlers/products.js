// src/mocks/handlers.js
import { delay, http, HttpResponse } from 'msw'
import { db, persistDatabase } from '../database/products'
import { withAuth } from '../middleware/auth'

export const productHandlers = [

  // 1. 獲取商品列表
  http.get('/api/products', withAuth(async () => {
    await delay(200)
    const products = db.product.getAll()

    return HttpResponse.json({
      code: 200,
      products,
    })
  })),

  // 2. 獲取單一商品
  http.get('/api/products/:id', withAuth(async ({ params }) => {
    await delay(200)
    const product = db.product.findFirst({
      where: { id: { equals: String(params.id) } },
    })

    if (!product) {
      return HttpResponse.json({ message: '商品不存在' }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      product,
    })
  })),

  // 3. 新增商品
  http.post('/api/products', withAuth(async ({ request }) => {
    await delay(200)
    const productData = await request.json()

    // 先將原本的資料排序值+1，確保新商品排在第一位
    db.product.updateMany({
      where: { sortOrder: { gte: 1 } },
      data: { sortOrder: prev => prev + 1 },
    })

    const newProduct = db.product.create(productData)
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      product: newProduct,
    })
  })),

  // 4. 更新商品
  http.put('/api/products/:id', withAuth(async ({ params, request }) => {
    await delay(200)

    const existingProduct = db.product.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingProduct) {
      return HttpResponse.json({ message: '商品不存在' }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedProduct = db.product.update({
      where: { id: { equals: String(params.id) } },
      data: updateData,
    })
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      product: updatedProduct,
    })
  })),

  // 5. 排序商品
  http.post('/api/products/sort', withAuth(async ({ request }) => {
    await delay(200)
    const { sortedIds } = await request.json()

    // 依照 sortedIds 的順序更新 sortOrder
    for (const [index, id] of sortedIds.entries()) {
      db.product.update({
        where: { id: { equals: String(id) } },
        data: { sortOrder: index + 1 },
      })
    }
    persistDatabase()
    return HttpResponse.json({ code: 200 })
  })),

  // 6. 刪除商品
  http.delete('/api/products/:id', withAuth(async ({ params }) => {
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
  })),
]
