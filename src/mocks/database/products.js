import { factory, manyOf, oneOf, primaryKey } from '@mswjs/data'
import { createProductDatabaseStorage } from './productDatabaseStorage.js'
import { seedProductDatabase } from './seeds/products.js'

export const db = factory({
  category: {
    id: primaryKey(String),
    name: String,
    slug: String,
    sortOrder: Number,
  },

  brand: {
    id: primaryKey(String),
    name: String,
    sortOrder: Number,
  },

  inventory: {
    id: primaryKey(String),
    stockQuantity: Number,
    safetyStock: Number,
    allowBackorder: Boolean,
    location: String,
    optionValues: manyOf('optionValue'),
  },

  variant: {
    id: primaryKey(String),
    sku: String,
    barcode: String,
    price: Number,
    costPrice: Number,
    weightGrams: Number,
    isActive: Boolean,
    inventory: oneOf('inventory'),
    optionValues: manyOf('optionValue'),
  },

  optionValue: {
    id: primaryKey(String),
    name: String,
  },

  option: {
    id: primaryKey(String),
    name: String,
    values: manyOf('optionValue'),
  },

  product: {
    id: primaryKey(String),
    name: String,
    slug: String,
    status: String,
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

const databaseStorage = createProductDatabaseStorage({
  db,
  seed: seedProductDatabase,
  storageKey: 'MOCK_DATABASE_PRODUCTS_STATE_V2',
  legacyStorageKeys: ['MOCK_DATABASE_PRODUCTS_STATE'],
})

export const setupDatabase = databaseStorage.setup
export const persistDatabase = databaseStorage.persist
export const resetDatabase = databaseStorage.reset
