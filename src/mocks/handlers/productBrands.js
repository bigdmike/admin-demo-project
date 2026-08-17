// src/mocks/handlers.js
import { delay, HttpResponse } from 'msw'
import { db, persistDatabase } from '../database/products'
import { withAuth } from '../middleware/auth'

export const productBrandsHandlers = {

  // 1. 獲取商品分類列表
  getBrands: withAuth(async ({ request }) => {
    await delay(200)
    // 1. 將 request.url 轉成 URL 物件
    const url = new URL(request.url)

    // 2. 使用 searchParams 取得單一參數（沒傳時回傳 null）
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const keyword = url.searchParams.get('keyword') || ''
    const brands = db.brand.findMany({ orderBy: {
      sortOrder: 'asc', // 或 'asc' 升冪
    } })

    // 3. 根據 keyword 過濾分類
    const filteredBrands = brands.filter(brand =>
      brand.name.includes(keyword),
    )

    // 4. 分頁邏輯
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedBrands = filteredBrands.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 200,
      items: paginatedBrands,
      total: filteredBrands.length,
      page: Number(page),
      limit: Number(limit),
    })
  }),

  // 2. 獲取單一商品品牌
  getBrand: withAuth(async ({ params }) => {
    await delay(200)
    const brand = db.brand.findFirst({
      where: { id: { equals: String(params.id) } },
    })

    if (!brand) {
      return HttpResponse.json({ message: '商品品牌不存在' }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      brand,
    })
  }),

  // 3. 新增商品品牌
  createBrand: withAuth(async ({ request }) => {
    await delay(200)
    const brandData = await request.json()

    // 先將原本的資料排序值+1，確保新商品品牌排在第一位
    db.brand.updateMany({
      where: { sortOrder: { gte: 1 } },
      data: { sortOrder: prev => prev + 1 },
    })

    const newBrand = db.brand.create({
      ...brandData,
      id: 'brand_' + String(Date.now()),
    })
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      brand: newBrand,
    })
  }),

  // 4. 更新商品品牌
  updateBrand: withAuth(async ({ params, request }) => {
    await delay(200)

    const existingBrand = db.brand.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingBrand) {
      return HttpResponse.json({ message: '商品品牌不存在' }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedBrand = db.brand.update({
      where: { id: { equals: String(params.id) } },
      data: updateData,
    })
    persistDatabase()

    return HttpResponse.json({
      code: 200,
      brand: updatedBrand,
    })
  }),

  // 5. 排序商品品牌
  sortBrands: withAuth(async ({ request }) => {
    await delay(200)
    const sortData = await request.json()

    // 依照 sortedIds 的順序更新 sortOrder
    for (const item of sortData) {
      db.brand.update({
        where: { id: { equals: String(item.id) } },
        data: { sortOrder: item.sortOrder },
      })
    }
    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),

  // 6. 刪除商品品牌
  deleteBrand: withAuth(async ({ params }) => {
    await delay(200)
    const existingBrand = db.brand.findFirst({
      where: { id: { equals: String(params.id) } },
    })
    if (!existingBrand) {
      return HttpResponse.json({ message: '商品品牌不存在' }, { status: 404 })
    }

    db.brand.delete({
      where: { id: { equals: String(params.id) } },
    })

    persistDatabase()
    return HttpResponse.json({ code: 200 })
  }),
}
