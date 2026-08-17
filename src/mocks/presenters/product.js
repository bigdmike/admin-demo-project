function getReferenceId (reference) {
  return typeof reference === 'object' ? reference?.id : reference
}

function resolveReference (db, modelName, reference) {
  const id = getReferenceId(reference)
  const entity = db[modelName].findFirst({
    where: { id: { equals: id } },
  })

  if (!entity) {
    throw new Error(`找不到 ${modelName} 關聯資料：${id}`)
  }

  return entity
}

function resolveReferences (db, modelName, references = []) {
  return references.map(reference => resolveReference(db, modelName, reference))
}

function presentOption (db, reference) {
  const option = resolveReference(db, 'option', reference)

  return {
    ...option,
    values: resolveReferences(db, 'optionValue', option.values),
  }
}

function presentInventory (db, reference) {
  const inventory = resolveReference(db, 'inventory', reference)

  return {
    ...inventory,
    optionValues: resolveReferences(db, 'optionValue', inventory.optionValues),
  }
}

function presentVariant (db, reference) {
  const variant = resolveReference(db, 'variant', reference)

  return {
    ...variant,
    inventory: presentInventory(db, variant.inventory),
    optionValues: resolveReferences(db, 'optionValue', variant.optionValues),
  }
}

export function presentProduct (db, product) {
  return {
    ...product,
    brand: resolveReference(db, 'brand', product.brand),
    category: resolveReferences(db, 'category', product.category),
    options: product.options.map(option => presentOption(db, option)),
    variants: product.variants.map(variant => presentVariant(db, variant)),
  }
}
