import { categorySeeds } from './categories.js'
import { brandSeeds, productSeeds } from './productCatalog.js'

function createCombinations (groups) {
  return groups.reduce(
    (combinations, group) => combinations.flatMap(combination => (
      group.values.map(value => [...combination, value])
    )),
    [[]],
  )
}

export function seedProductDatabase (db) {
  const categories = new Map(
    categorySeeds.map(category => [category.id, db.category.create(category)]),
  )
  const brands = brandSeeds.map(brand => db.brand.create(brand))

  let optionIndex = 0
  let optionValueIndex = 0
  let variantIndex = 0
  const productStatuses = {
    12: 'draft',
    13: 'archived',
  }

  for (const [productIndex, seed] of productSeeds.entries()) {
    const id = `prod_${String(productIndex + 1).padStart(2, '0')}`
    const createdDate = new Date(Date.UTC(2026, 6, productIndex + 1)).toISOString()
    const product = db.product.create({
      id,
      name: seed.name,
      slug: seed.slug,
      status: productStatuses[productIndex] ?? 'published',
      description: seed.description,
      hasVariants: true,
      sortOrder: productIndex + 1,
      createdAt: createdDate,
      updatedAt: createdDate,
      category: seed.categoryIds.map(categoryId => categories.get(categoryId)),
      brand: brands[productIndex],
      variants: [],
      options: [],
    })

    const options = seed.optionGroups.map(group => {
      optionIndex += 1
      const values = group.values.map(value => {
        optionValueIndex += 1
        return {
          ...value,
          entity: db.optionValue.create({
            id: `val_${String(optionValueIndex).padStart(2, '0')}`,
            name: value.name,
          }),
        }
      })

      return {
        values,
        entity: db.option.create({
          id: `opt_${String(optionIndex).padStart(2, '0')}`,
          name: group.name,
          values: values.map(value => value.entity),
        }),
      }
    })

    const variants = createCombinations(options).map((combination, combinationIndex) => {
      variantIndex += 1
      const number = String(variantIndex).padStart(2, '0')
      const optionValues = combination.map(value => value.entity)
      const inventory = db.inventory.create({
        id: `inv_${number}`,
        stockQuantity: (productIndex * 13 + combinationIndex * 17 + 18) % 61,
        safetyStock: 10,
        allowBackorder: variantIndex % 7 === 0,
        location: `${String.fromCodePoint(65 + (productIndex % 4))}-${String(productIndex + 1).padStart(2, '0')}-${String(combinationIndex + 1).padStart(2, '0')}`,
        optionValues,
      })

      return db.variant.create({
        id: `var_${number}`,
        sku: [seed.skuPrefix, ...combination.map(value => value.code)].join('-'),
        barcode: `4710001${String(variantIndex).padStart(6, '0')}`,
        price: seed.price,
        costPrice: seed.costPrice,
        weightGrams: seed.weightGrams + combinationIndex * 25,
        isActive: productIndex !== 13,
        inventory,
        optionValues,
      })
    })

    db.product.update({
      where: { id: { equals: product.id } },
      data: {
        variants,
        options: options.map(option => option.entity),
      },
    })
  }
}
