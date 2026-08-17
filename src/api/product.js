import request from '@/utils/request'

// 取得使用者列表（支援搜尋與分頁參數）
export function getProduct ({ page, itemsPerPage, keyword }) {
  let url = '/products'
  const queryParams = []
  if (page) {
    queryParams.push(`page=${page}`)
  }
  if (itemsPerPage) {
    queryParams.push(`limit=${itemsPerPage}`)
  }
  if (keyword) {
    queryParams.push(`keyword=${encodeURIComponent(keyword)}`)
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`
  }
  return request({
    url,
    method: 'get',
  })
}

// 更新排序
export function sortProduct (sortedData) {
  return request({
    url: '/products/sort',
    method: 'put',
    data: sortedData,
  })
}

// 刪除商品
export function deleteProduct (id) {
  return request({
    url: `/products/${id}`,
    method: 'delete',
  })
}
