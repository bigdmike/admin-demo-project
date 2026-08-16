import request from '@/utils/request'

// 取得使用者列表（支援搜尋與分頁參數）
export function getProductCategory ({ page, itemsPerPage, keyword }) {
  let url = '/product/categories'
  const queryParams = []
  if (page) {
    queryParams.push(`page=${page}`)
  }
  if (itemsPerPage) {
    queryParams.push(`itemsPerPage=${itemsPerPage}`)
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
export function sortProductCategory (sortedData) {
  return request({
    url: '/product/categories/sort',
    method: 'put',
    data: sortedData,
  })
}

// 新增分類
export function createProductCategory (data) {
  return request({
    url: '/product/categories',
    method: 'post',
    data,
  })
}

// 更新分類
export function updateProductCategory (id, data) {
  return request({
    url: `/product/categories/${id}`,
    method: 'put',
    data,
  })
}

// 刪除分類
export function deleteProductCategory (id) {
  return request({
    url: `/product/categories/${id}`,
    method: 'delete',
  })
}
