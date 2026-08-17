import request from '@/utils/request'

// 取得使用者列表（支援搜尋與分頁參數）
export function getProductBrand ({ page, itemsPerPage, keyword }) {
  let url = '/product/brands'
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
export function sortProductBrand (sortedData) {
  return request({
    url: '/product/brands/sort',
    method: 'put',
    data: sortedData,
  })
}

// 新增品牌
export function createProductBrand (data) {
  return request({
    url: '/product/brands',
    method: 'post',
    data,
  })
}

// 更新品牌
export function updateProductBrand (id, data) {
  return request({
    url: `/product/brands/${id}`,
    method: 'put',
    data,
  })
}

// 刪除品牌
export function deleteProductBrand (id) {
  return request({
    url: `/product/brands/${id}`,
    method: 'delete',
  })
}
