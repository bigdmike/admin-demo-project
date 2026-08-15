import { drop, factory, manyOf, oneOf, primaryKey } from '@mswjs/data'
const DB_STORAGE_KEY = 'MOCK_DATABASE_PRODUCTS_STATE'

function getEntityId (reference) {
  return typeof reference === 'object' ? reference?.id : reference
}

function resolveEntity (modelName, reference) {
  const id = getEntityId(reference)
  const entity = db[modelName].findFirst({
    where: { id: { equals: id } },
  })

  if (!entity) {
    throw new Error(`Cannot restore ${modelName} reference with id "${id}"`)
  }

  return entity
}

function resolveEntities (modelName, references = []) {
  return references.map(reference => resolveEntity(modelName, reference))
}

export const db = factory({
  // 1. 分類表
  category: {
    id: primaryKey(String),
    name: String,
    slug: String,
    sortOrder: Number,
  },

  // 2. 品牌表
  brand: {
    id: primaryKey(String),
    name: String,
    sortOrder: Number,
  },

  // 3. 庫存表 (獨立管理庫存與倉位)
  inventory: {
    id: primaryKey(String),
    stockQuantity: Number,
    safetyStock: Number,
    allowBackorder: Boolean,
    location: String,
    // 一對一關聯回變體 (可選，看查詢方向)
    variant: oneOf('variant'),
  },

  // 4. 商品變體 (SKU)
  variant: {
    id: primaryKey(String),
    sku: String, // 或作為唯一碼
    barcode: String,
    price: Number,
    costPrice: Number,
    weightGrams: Number,
    isActive: Boolean,
    // 一對一關聯：變體對應其庫存
    inventory: oneOf('inventory'),
    // 多對多關聯：變體可有多個選項值 (如顏色、尺寸)
    optionValues: manyOf('optionValue'),
  },

  // 5. 商品選項值 (如紅色、藍色、M、L)
  optionValue: {
    id: primaryKey(String),
    name: String,
  },

  // 6. 商品選項 (如顏色、尺寸)
  option: {
    id: primaryKey(String),
    name: String,
    // 多對一關聯：選項值屬於某選項
    values: manyOf('optionValue'),
  },

  // 7. 商品主表
  product: {
    id: primaryKey(String),
    name: String,
    slug: String,
    status: String, // published | draft | archived
    description: String,
    hasVariants: Boolean,
    createdAt: String,
    updatedAt: String,
    sortOrder: Number,
    category: manyOf('category'),
    brand: oneOf('brand'),
    variants: manyOf('variant'),
    options: manyOf('option'),
  },
})

export function initMockDatabase () {
  // 1. 建立分類與品牌
  const apparel = db.category.create({
    id: 'cat_01',
    name: '上身服飾',
    slug: 'apparel-tops',
    sortOrder: 1,
  })
  db.category.create({
    id: 'cat_02',
    name: '下身服飾',
    slug: 'apparel-bottoms',
    sortOrder: 2,
  })
  db.category.create({
    id: 'cat_03',
    name: '鞋類',
    slug: 'footwear',
    sortOrder: 3,
  })
  db.category.create({
    id: 'cat_04',
    name: '配件',
    slug: 'accessories',
    sortOrder: 4,
  })
  db.category.create({
    id: 'cat_05',
    name: '運動服',
    slug: 'sportswear',
    sortOrder: 5,
  })
  db.category.create({
    id: 'cat_06',
    name: '其他',
    slug: 'miscellaneous',
    sortOrder: 6,
  })
  db.category.create({
    id: 'cat_07',
    name: '外套',
    slug: 'outerwear',
    sortOrder: 7,
  })
  db.category.create({
    id: 'cat_08',
    name: '針織衫',
    slug: 'knitwear',
    sortOrder: 8,
  })
  db.category.create({
    id: 'cat_09',
    name: '洋裝',
    slug: 'dresses',
    sortOrder: 9,
  })
  db.category.create({
    id: 'cat_10',
    name: '裙裝',
    slug: 'skirts',
    sortOrder: 10,
  })
  db.category.create({
    id: 'cat_11',
    name: '牛仔系列',
    slug: 'denim',
    sortOrder: 11,
  })
  db.category.create({
    id: 'cat_12',
    name: '居家服',
    slug: 'loungewear',
    sortOrder: 12,
  })
  db.category.create({
    id: 'cat_13',
    name: '內著',
    slug: 'underwear',
    sortOrder: 13,
  })
  db.category.create({
    id: 'cat_14',
    name: '泳裝',
    slug: 'swimwear',
    sortOrder: 14,
  })
  db.category.create({
    id: 'cat_15',
    name: '包款',
    slug: 'bags',
    sortOrder: 15,
  })
  db.category.create({
    id: 'cat_16',
    name: '帽款',
    slug: 'headwear',
    sortOrder: 16,
  })
  db.category.create({
    id: 'cat_17',
    name: '襪類',
    slug: 'socks',
    sortOrder: 17,
  })
  db.category.create({
    id: 'cat_18',
    name: '飾品',
    slug: 'jewelry',
    sortOrder: 18,
  })
  db.category.create({
    id: 'cat_19',
    name: '童裝',
    slug: 'kidswear',
    sortOrder: 19,
  })
  db.category.create({
    id: 'cat_20',
    name: '大尺碼',
    slug: 'plus-size',
    sortOrder: 20,
  })
  db.category.create({
    id: 'cat_21',
    name: '聯名限定',
    slug: 'limited-collaborations',
    sortOrder: 21,
  })

  const urbanBrand = db.brand.create({
    id: 'brd_01',
    name: 'Urban Basic',
    sortOrder: 1,
  })

  // 2. 建立商品主體 (先建立關聯到 category 與 brand)
  const hoodie = db.product.create({
    id: 'prod_01',
    name: '經典重磅落肩連帽衛衣',
    slug: 'classic-heavyweight-oversized-hoodie',
    status: 'published',
    description: '400g 重磅純棉面料',
    hasVariants: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: apparel,
    brand: urbanBrand,
  })

  // 4. 建立商品選項值 (關聯到商品選項)
  const blackValue = db.optionValue.create({
    id: 'val_01',
    name: '曜石黑',
  })
  const grayValue = db.optionValue.create({
    id: 'val_02',
    name: '燕麥灰',
  })
  const mValue = db.optionValue.create({
    id: 'val_03',
    name: 'M',
  })
  const lValue = db.optionValue.create({
    id: 'val_04',
    name: 'L',
  })

  // 3. 建立商品選項 (關聯到商品)
  const colorOption = db.option.create({
    id: 'opt_01',
    name: '顏色',
    values: [blackValue, grayValue], // 關聯到選項值
  })
  const sizeOption = db.option.create({
    id: 'opt_02',
    name: '尺寸',
    values: [mValue, lValue], // 關聯到選項值
  })

  // 3. 建立庫存
  const invBlackM = db.inventory.create({
    id: 'inv_01',
    stockQuantity: 45,
    safetyStock: 10,
    allowBackorder: false,
    location: 'A-01-03',
    optionValues: [blackValue, mValue], // 關聯到選項值
  })

  const invBlackL = db.inventory.create({
    id: 'inv_02',
    stockQuantity: 5,
    safetyStock: 10,
    allowBackorder: true,
    location: 'A-01-04',
    optionValues: [blackValue, lValue], // 關聯到選項值
  })

  const invGrayM = db.inventory.create({
    id: 'inv_03',
    stockQuantity: 20,
    safetyStock: 10,
    allowBackorder: false,
    location: 'A-01-05',
    optionValues: [grayValue, mValue], // 關聯到選項值
  })
  const invGrayL = db.inventory.create({
    id: 'inv_04',
    stockQuantity: 15,
    safetyStock: 10,
    allowBackorder: false,
    location: 'A-01-06',
    optionValues: [grayValue, lValue], // 關聯到選項值
  })

  // 4. 建立變體並關聯 product 與 inventory
  const variantBlackM = db.variant.create({
    id: 'var_01',
    sku: 'UB-HD-BLK-M',
    barcode: '4710001001011',
    price: 1280,
    costPrice: 450,
    weightGrams: 650,
    isActive: true,
    product: hoodie,
    inventory: invBlackM,
    optionValues: [blackValue, mValue], // 關聯到選項值
  })

  const variantBlackL = db.variant.create({
    id: 'var_02',
    sku: 'UB-HD-BLK-L',
    barcode: '4710001001012',
    price: 1280,
    costPrice: 450,
    weightGrams: 700,
    isActive: true,
    product: hoodie,
    inventory: invBlackL,
    optionValues: [blackValue, lValue], // 關聯到選項值
  })

  const variantGrayM = db.variant.create({
    id: 'var_03',
    sku: 'UB-HD-GRY-M',
    barcode: '4710001001013',
    price: 1280,
    costPrice: 450,
    weightGrams: 650,
    isActive: true,
    product: hoodie,
    inventory: invGrayM,
    optionValues: [grayValue, mValue], // 關聯到選項值
  })

  const variantGrayL = db.variant.create({
    id: 'var_04',
    sku: 'UB-HD-GRY-L',
    barcode: '4710001001014',
    price: 1280,
    costPrice: 450,
    weightGrams: 700,
    isActive: true,
    product: hoodie,
    inventory: invGrayL,
    optionValues: [grayValue, lValue], // 關聯到選項值
  })

  // 5. 更新商品的 variants 關聯 (自動維護 manyOf)
  db.product.update({
    where: { id: { equals: hoodie.id } },
    data: {
      variants: [variantBlackM, variantBlackL, variantGrayM, variantGrayL],
      options: [colorOption, sizeOption], // 關聯到商品選項
    },
  })
}

// 1. 初始化資料庫（帶 LocalStorage 判斷）
export function setupDatabase () {
  const savedData = localStorage.getItem(DB_STORAGE_KEY)

  if (savedData) {
    try {
      // 若 LocalStorage 有資料，反序列化並塞入 @mswjs/data
      const parsed = JSON.parse(savedData)

      // 依序還原各表資料
      if (parsed.category) {
        for (const item of parsed.category) {
          db.category.create(item)
        }
      }
      if (parsed.brand) {
        for (const item of parsed.brand) {
          db.brand.create(item)
        }
      }
      if (parsed.optionValue) {
        for (const item of parsed.optionValue) {
          db.optionValue.create({
            ...item,
          })
        }
      }
      if (parsed.option) {
        for (const item of parsed.option) {
          db.option.create({
            ...item,
            values: resolveEntities('optionValue', item.values),
          })
        }
      }
      if (parsed.inventory) {
        for (const item of parsed.inventory) {
          const inventory = { ...item }
          delete inventory.variant
          db.inventory.create(inventory)
        }
      }
      if (parsed.variant) {
        for (const item of parsed.variant) {
          db.variant.create({
            ...item,
            inventory: resolveEntity('inventory', item.inventory),
            optionValues: resolveEntities('optionValue', item.optionValues),
          })
        }
      }
      if (parsed.inventory) {
        for (const item of parsed.inventory) {
          if (item.variant) {
            db.inventory.update({
              where: { id: { equals: item.id } },
              data: {
                variant: resolveEntity('variant', item.variant),
              },
            })
          }
        }
      }
      if (parsed.product) {
        for (const item of parsed.product) {
          db.product.create({
            ...item,
            category: resolveEntities('category', item.category),
            brand: resolveEntity('brand', item.brand),
            variants: resolveEntities('variant', item.variants),
            options: resolveEntities('option', item.options),
          })
        }
      }
      return
    } catch (error) {
      console.warn('還原 Mock DB 失敗，改用預設 Seed', error)
      localStorage.removeItem(DB_STORAGE_KEY)
      drop(db)
    }
  }

  // 若 LocalStorage 沒有資料，執行原本的 Seed 邏輯
  initMockDatabase()
  persistDatabase()
}

// 2. 將當前記憶體狀態寫入 LocalStorage
export function persistDatabase () {
  const snapshot = {
    category: db.category.getAll(),
    brand: db.brand.getAll(),
    inventory: db.inventory.getAll(),
    variant: db.variant.getAll(),
    product: db.product.getAll(),
    option: db.option.getAll(),
    optionValue: db.optionValue.getAll(),
  }

  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(snapshot))
}

// 3. 提供一鍵重置功能（方便後台測試按鈕）
export function resetDatabase () {
  localStorage.removeItem(DB_STORAGE_KEY)
}
