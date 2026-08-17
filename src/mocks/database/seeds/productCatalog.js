export const brandSeeds = [
  'Urban Basic',
  'Plain Studio',
  'North Lane',
  'Blue Harbor',
  'Mellow Day',
  'Field Notes',
  'Knit & Co.',
  'Atelier Nine',
  'Stride Lab',
  'Motion Works',
  'Carry On',
  'Cap District',
  'Daily Step',
  'Tide Form',
  'Little Weekend',
].map((name, index) => ({
  id: `brd_${String(index + 1).padStart(2, '0')}`,
  name,
  sortOrder: index + 1,
}))

export const productSeeds = [
  {
    name: '經典重磅落肩連帽衛衣', slug: 'classic-heavyweight-oversized-hoodie', categoryIds: ['cat_01'],
    description: '400g 重磅純棉面料，寬鬆落肩剪裁。', skuPrefix: 'UB-HD', price: 1280, costPrice: 450, weightGrams: 650,
    optionGroups: [{ name: '顏色', values: [{ name: '曜石黑', code: 'BLK' }, { name: '燕麥灰', code: 'GRY' }] }, { name: '尺寸', values: [{ name: 'M', code: 'M' }, { name: 'L', code: 'L' }] }],
  },
  {
    name: '精梳棉寬版短袖上衣', slug: 'combed-cotton-wide-t-shirt', categoryIds: ['cat_01'],
    description: '柔軟精梳棉與俐落寬版輪廓。', skuPrefix: 'PS-TS', price: 680, costPrice: 220, weightGrams: 260,
    optionGroups: [{ name: '顏色', values: [{ name: '奶油白', code: 'CRM' }] }],
  },
  {
    name: '牛津紡日常襯衫', slug: 'daily-oxford-shirt', categoryIds: ['cat_01'],
    description: '高密度牛津紡布料，適合四季穿著。', skuPrefix: 'NL-SH', price: 1180, costPrice: 410, weightGrams: 390,
    optionGroups: [{ name: '顏色', values: [{ name: '霧藍', code: 'BLU' }] }],
  },
  {
    name: '中腰直筒牛仔褲', slug: 'mid-rise-straight-jeans', categoryIds: ['cat_02', 'cat_11'],
    description: '微彈丹寧面料與修飾腿型的直筒版型。', skuPrefix: 'BH-DN', price: 1580, costPrice: 590, weightGrams: 720,
    optionGroups: [{ name: '刷色', values: [{ name: '復古靛藍', code: 'IND' }] }],
  },
  {
    name: '垂墜感百褶長裙', slug: 'draped-pleated-midi-skirt', categoryIds: ['cat_02', 'cat_10'],
    description: '細緻百褶與輕盈垂墜布料。', skuPrefix: 'MD-SK', price: 1380, costPrice: 480, weightGrams: 420,
    optionGroups: [{ name: '顏色', values: [{ name: '岩石棕', code: 'BRN' }] }],
  },
  {
    name: '防潑水輕量風衣', slug: 'water-resistant-light-windbreaker', categoryIds: ['cat_07'],
    description: '輕量防潑水表布，方便收納攜帶。', skuPrefix: 'FN-WB', price: 2280, costPrice: 860, weightGrams: 510,
    optionGroups: [{ name: '顏色', values: [{ name: '軍綠', code: 'OLV' }] }],
  },
  {
    name: '羊毛混紡針織開襟衫', slug: 'wool-blend-knit-cardigan', categoryIds: ['cat_08'],
    description: '親膚羊毛混紡，細密針織不易變形。', skuPrefix: 'KC-CD', price: 1880, costPrice: 720, weightGrams: 480,
    optionGroups: [{ name: '顏色', values: [{ name: '酒紅', code: 'WNE' }] }],
  },
  {
    name: '收腰剪裁襯衫洋裝', slug: 'tailored-waist-shirt-dress', categoryIds: ['cat_09'],
    description: '俐落襯衫領與可調式收腰設計。', skuPrefix: 'AN-DR', price: 1980, costPrice: 760, weightGrams: 540,
    optionGroups: [{ name: '顏色', values: [{ name: '深海軍藍', code: 'NVY' }] }],
  },
  {
    name: '城市緩震慢跑鞋', slug: 'city-cushion-running-shoes', categoryIds: ['cat_03', 'cat_05'],
    description: '回彈中底搭配透氣網布鞋面。', skuPrefix: 'SL-RN', price: 2680, costPrice: 1080, weightGrams: 680,
    optionGroups: [{ name: '尺寸', values: [{ name: 'EU 42', code: '42' }] }],
  },
  {
    name: '機能彈性訓練短褲', slug: 'performance-stretch-training-shorts', categoryIds: ['cat_02', 'cat_05'],
    description: '四向彈性快乾布料，附安全拉鍊口袋。', skuPrefix: 'MW-ST', price: 980, costPrice: 350, weightGrams: 210,
    optionGroups: [{ name: '顏色', values: [{ name: '石墨灰', code: 'GPH' }] }],
  },
  {
    name: '多隔層輕量斜背包', slug: 'multi-pocket-light-crossbody-bag', categoryIds: ['cat_15'],
    description: '耐磨尼龍與實用多隔層收納。', skuPrefix: 'CO-BG', price: 1480, costPrice: 520, weightGrams: 380,
    optionGroups: [{ name: '顏色', values: [{ name: '沙卡其', code: 'KHK' }] }],
  },
  {
    name: '水洗棉棒球帽', slug: 'washed-cotton-baseball-cap', categoryIds: ['cat_16'],
    description: '自然水洗色澤，金屬扣可調節帽圍。', skuPrefix: 'CD-CP', price: 780, costPrice: 240, weightGrams: 140,
    optionGroups: [{ name: '顏色', values: [{ name: '磚紅', code: 'BRK' }] }],
  },
  {
    name: '厚底毛圈中筒襪', slug: 'cushioned-terry-crew-socks', categoryIds: ['cat_17'],
    description: '足底加厚毛圈，吸濕舒適。', skuPrefix: 'DS-SK', price: 280, costPrice: 75, weightGrams: 90,
    optionGroups: [{ name: '顏色', values: [{ name: '芥末黃', code: 'MUS' }] }],
  },
  {
    name: '俐落線條連身泳裝', slug: 'clean-line-one-piece-swimsuit', categoryIds: ['cat_14'],
    description: '高彈耐氯面料與穩定包覆剪裁。', skuPrefix: 'TF-SW', price: 1680, costPrice: 610, weightGrams: 230,
    optionGroups: [{ name: '顏色', values: [{ name: '湖水綠', code: 'AQU' }] }],
  },
  {
    name: '童趣印花大學衛衣', slug: 'kids-graphic-sweatshirt', categoryIds: ['cat_19'],
    description: '柔軟刷毛內裡與無感印花工法。', skuPrefix: 'LW-KS', price: 880, costPrice: 290, weightGrams: 320,
    optionGroups: [{ name: '尺寸', values: [{ name: '130 cm', code: '130' }] }],
  },
]
