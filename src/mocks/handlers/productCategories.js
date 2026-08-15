// src/mocks/handlers.js
import { delay, HttpResponse } from 'msw'
import { db, persistDatabase } from '../database/products'
import { withAuth } from '../middleware/auth'

export const productCategoriesHandlers = {

  // 1. 獲取商品分類列表
  getCategories: withAuth(async ({ request }) => {
    await delay(200)
    // 1. 將 request.url 轉成 URL 物件
    const url = new URL(request.url)

    // 2. 使用 searchParams 取得單一參數（沒傳時回傳 null）
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const keyword = url.searchParams.get('keyword') || ''
    const categories = db.category.findMany({ orderBy: {
      sortOrder: 'asc', // 或 'asc' 升冪
    } })

    // 3. 根據 keyword 過濾分類
    const filteredCategories = categories.filter(category =>
      category.name.includes(keyword),
    )

    // 4. 分頁邏輯
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 200,
      items: paginatedCategories,
      total: filteredCategories.length,
      page: Number(page),
      limit: Number(limit),
    })
  }),

  // 2. 獲取單一商品分類
  getCategory: withAuth(async ({ params }) => {
    await delay(200)
    const category = db.category.findFirst({
      where: { id: { equals: String(params.id) } },
    })

    if (!category) {
      return HttpResponse.json({ message: '商品分類不存在' }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      category,
    })
  }),

  // 3. 新增商品分類
  createCategory: withAuth(async ({ request }) => {
    await delay(200)
    const categoryData = await request.json()

    // 先將原本的資料排序值+1，確保新商品分類排在第一位
    db.category.updateMany({
      where: { sortOrder: { gte: 1 } },
      data: { sortOrder: prev => prev + 1 },
    })

    const newCategory = db.category.create(categoryData)
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      category: newCategory,
    })
  }),

  // 4. 更新商品分類
  updateCategory: withAuth(async ({ params, request }) => {
    await delay(200)

    const existingCategory = db.category.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingCategory) {
      return HttpResponse.json({ message: '商品分類不存在' }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedCategory = db.category.update({
      where: { id: { equals: String(params.id) } },
      data: updateData,
    })
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      category: updatedCategory,
    })
  }),

  // 5. 排序商品
  sortCategories: withAuth(async ({ request }) => {
    await delay(200)
    const sortData = await request.json()

    // 依照 sortedIds 的順序更新 sortOrder
    for (const item of sortData) {
      db.category.update({
        where: { id: { equals: String(item.id) } },
        data: { sortOrder: item.sortOrder },
      })
    }
    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),

  // 6. 刪除商品
  deleteCategory: withAuth(async ({ params }) => {
    await delay(200)
    const existingCategory = db.category.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingCategory) {
      return HttpResponse.json({ message: '商品分類不存在' }, { status: 404 })
    }

    db.category.delete({
      where: { id: { equals: String(params.id) } },
    })

    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),
}
