import { drop } from '@mswjs/data'

function getEntityId (reference) {
  return typeof reference === 'object' ? reference?.id : reference
}

function getEntityIds (references = []) {
  return references.map(reference => getEntityId(reference))
}

export function createProductDatabaseStorage ({ db, seed, storageKey, legacyStorageKeys = [] }) {
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

  function restore (snapshot) {
    for (const category of snapshot.category ?? []) {
      db.category.create(category)
    }
    for (const brand of snapshot.brand ?? []) {
      db.brand.create(brand)
    }
    for (const optionValue of snapshot.optionValue ?? []) {
      db.optionValue.create(optionValue)
    }

    for (const option of snapshot.option ?? []) {
      db.option.create({
        ...option,
        values: resolveEntities('optionValue', option.values),
      })
    }

    for (const inventory of snapshot.inventory ?? []) {
      db.inventory.create({
        ...inventory,
        optionValues: resolveEntities('optionValue', inventory.optionValues),
      })
    }

    for (const variant of snapshot.variant ?? []) {
      db.variant.create({
        ...variant,
        inventory: resolveEntity('inventory', variant.inventory),
        optionValues: resolveEntities('optionValue', variant.optionValues),
      })
    }

    for (const product of snapshot.product ?? []) {
      db.product.create({
        ...product,
        category: resolveEntities('category', product.category),
        brand: resolveEntity('brand', product.brand),
        variants: resolveEntities('variant', product.variants),
        options: resolveEntities('option', product.options),
      })
    }
  }

  function createSnapshot () {
    return {
      category: db.category.getAll(),
      brand: db.brand.getAll(),
      optionValue: db.optionValue.getAll(),
      option: db.option.getAll().map(option => ({
        ...option,
        values: getEntityIds(option.values),
      })),
      inventory: db.inventory.getAll().map(inventory => ({
        ...inventory,
        optionValues: getEntityIds(inventory.optionValues),
      })),
      variant: db.variant.getAll().map(variant => ({
        ...variant,
        inventory: getEntityId(variant.inventory),
        optionValues: getEntityIds(variant.optionValues),
      })),
      product: db.product.getAll().map(product => ({
        ...product,
        category: getEntityIds(product.category),
        brand: getEntityId(product.brand),
        variants: getEntityIds(product.variants),
        options: getEntityIds(product.options),
      })),
    }
  }

  function persist () {
    localStorage.setItem(storageKey, JSON.stringify(createSnapshot()))
  }

  function setup () {
    const savedData = localStorage.getItem(storageKey)

    if (savedData) {
      try {
        restore(JSON.parse(savedData))
        return
      } catch (error) {
        console.warn('Mock 商品資料庫還原失敗，將重新建立 seed 資料。', error)
        localStorage.removeItem(storageKey)
        drop(db)
      }
    }

    seed(db)
    persist()
  }

  function reset () {
    localStorage.removeItem(storageKey)
    for (const legacyStorageKey of legacyStorageKeys) {
      localStorage.removeItem(legacyStorageKey)
    }
  }

  return { persist, reset, setup }
}
