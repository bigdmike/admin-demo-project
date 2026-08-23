import { mount } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import ProductCategoryListPage from '@/pages/ProductCategoryListPage.vue'
import vuetify from '@/plugins/vuetify'

let mockCurrentRoute = { query: {} }
let pinia
vi.mock(import('vue-router'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      currentRoute: {
        get value () {
          return mockCurrentRoute
        },
      },
      push: data => {
        mockCurrentRoute = { query: data.query }
      },
    }),
    useRoute: () => mockCurrentRoute,
  }
})

describe('ProductCategoryListPage.vue 商品分類列表功能驗證', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    mockCurrentRoute = { query: {} }
  })

  const createWrapper = () => {
    return mount(ProductCategoryListPage, {
      global: {
        plugins: [pinia, vuetify],
      },
    })
  }

  it('初次載入時取得第一頁資料並顯示分類', async () => {
    let requestedUrl

    server.use(
      http.get('*/api/product/categories', ({ request }) => {
        requestedUrl = new URL(request.url)

        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
    )

    const wrapper = createWrapper()

    await vi.waitFor(() => {
      expect(requestedUrl).toBeDefined()
      expect(wrapper.text()).toContain('手機')
      expect(wrapper.text()).toContain('電腦')
    })

    expect(requestedUrl.searchParams.get('page')).toBe('1')
    expect(requestedUrl.searchParams.get('limit')).toBe('10')
  })

  it('搜尋關鍵字後應只顯示符合的分類', async () => {
    let requestedUrl
    const items = [
      { id: 1, name: '手機' },
      { id: 2, name: '電腦' },
    ]

    server.use(
      http.get('*/api/product/categories', ({ request }) => {
        requestedUrl = new URL(request.url)
        const keyword = requestedUrl.searchParams.get('keyword') ?? ''
        const filteredItems = items.filter(item => item.name.includes(keyword))

        return HttpResponse.json({
          items: filteredItems,
          total: filteredItems.length,
        })
      }),
    )

    const wrapper = createWrapper()
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('手機')
      expect(wrapper.text()).toContain('電腦')
    })

    const keywordField = wrapper.find('[data-testid="keyword-input"]')
    const keywordFieldInput = keywordField.find('input')
    await keywordFieldInput.setValue('手機')
    await keywordFieldInput.trigger('change')

    // 等待非同步請求與 DOM 更新完成
    await vi.waitFor(() => {
      expect(requestedUrl.searchParams.get('keyword')).toBe('手機')
      expect(wrapper.text()).toContain('手機')
      expect(wrapper.text()).not.toContain('電腦')
    })
    expect(mockCurrentRoute.query.keyword).toBe('手機')
    expect(requestedUrl.searchParams.get('page')).toBe('1')
    expect(requestedUrl.searchParams.get('limit')).toBe('10')
    expect(requestedUrl.searchParams.get('keyword')).toBe('手機')
  })

  it('切換頁面時使用新的分頁參數載入資料', async () => {
    const requestedUrls = []

    server.use(
      http.get('*/api/product/categories', ({ request }) => {
        requestedUrls.push(new URL(request.url))

        return HttpResponse.json({
          items: [],
          total: 30,
        })
      }),
    )

    const wrapper = createWrapper()

    const table = wrapper.findComponent({
      name: 'VDataTableServer',
    })

    await vi.waitFor(() => {
      expect(requestedUrls).toHaveLength(1)
      expect(table.props('loading')).toBe(false)
    })

    table.vm.$emit('update:page', 2)
    table.vm.$emit('update:options', { page: 2, itemsPerPage: 10 })

    await vi.waitFor(() => {
      const lastRequest = requestedUrls.at(-1)

      expect(lastRequest.searchParams.get('page')).toBe('2')
      expect(lastRequest.searchParams.get('limit')).toBe('10')
    })

    expect(mockCurrentRoute.query.page).toBe('2')
  })

  it('點擊新增分類按鈕後要開啟編輯組件', async () => {
    const wrapper = createWrapper()

    const addButton = wrapper.find('[data-testid="add-button"]')
    const editDialog = wrapper.findComponent({
      name: 'EditDialog',
    })

    expect(editDialog.vm.dialog).toBe(false)

    await addButton.trigger('click')

    await vi.waitFor(() => {
      expect(editDialog.vm.dialog).toBe(true)
    })
  })

  it('點擊刪除按鈕後要開啟刪除確認對話框', async () => {
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
    )
    const wrapper = createWrapper()

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    const deleteButton = wrapper.find('[data-testid="delete-button"]')
    await deleteButton.trigger('click')
    const deleteDialog = wrapper.findComponent({
      name: 'MainDeleteDialog',
    })

    await vi.waitFor(() => {
      expect(deleteDialog.vm.show).toBe(true)
    })
  })

  it('點擊編輯按鈕後要開啟編輯組件', async () => {
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
    )
    const wrapper = createWrapper()

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    const editButton = wrapper.find('[data-testid="edit-button"]')
    await editButton.trigger('click')
    const editDialog = wrapper.findComponent({
      name: 'EditDialog',
    })

    await vi.waitFor(() => {
      expect(editDialog.vm.dialog).toBe(true)
    })
  })

  it('當編輯組件觸發新增事件時，頁面要送出新增請求', async () => {
    let createRequestData = null
    // MOCK 送出新增請求的回應
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
      http.post('/api/product/categories', async ({ request }) => {
        createRequestData = await request.json()
        return HttpResponse.json({
          code: 200,
          category: { id: 1, name: createRequestData.name },
        })
      }),
    )

    const wrapper = createWrapper()
    const editDialog = wrapper.findComponent({
      name: 'EditDialog',
    })
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    editDialog.vm.$emit('create-action', { name: '新分類' })

    await vi.waitFor(() => {
      expect(createRequestData).toEqual({ name: '新分類' })
    })
  })

  it('當編輯組件觸發編輯事件時，頁面要送出更新請求', async () => {
    let updateRequestData = null
    // MOCK 送出新增請求的回應
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
      http.put('/api/product/categories/:id', async ({ request }) => {
        updateRequestData = await request.json()
        return HttpResponse.json({
          code: 200,
          category: { id: updateRequestData.id, name: updateRequestData.name },
        })
      }),
    )

    const wrapper = createWrapper()
    const editDialog = wrapper.findComponent({
      name: 'EditDialog',
    })
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    editDialog.vm.$emit('update-action', { id: 1, name: '新分類' })

    await vi.waitFor(() => {
      expect(updateRequestData).toEqual({ id: 1, name: '新分類' })
    })
  })

  it('當刪除組件觸發刪除事件時，頁面要送出刪除請求', async () => {
    let deleteRequestId = null
    // MOCK 送出刪除請求的回應
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機' },
            { id: 2, name: '電腦' },
          ],
          total: 2,
        })
      }),
      http.delete('/api/product/categories/:id', async ({ params }) => {
        deleteRequestId = Number(params.id)
        return HttpResponse.json({
          code: 200,
        })
      }),
    )

    const wrapper = createWrapper()
    const deleteDialog = wrapper.findComponent({
      name: 'MainDeleteDialog',
    })
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    deleteDialog.vm.$emit('delete-action', 1)

    await vi.waitFor(() => {
      expect(deleteRequestId).toBe(1)
    })
  })

  it('點擊儲存排序時，頁面要送出排序請求', async () => {
    let sortOrderRequestData = null
    // MOCK 送出排序請求的回應
    server.use(
      http.get('*/api/product/categories', () => {
        return HttpResponse.json({
          items: [
            { id: 1, name: '手機', sortOrder: 1 },
            { id: 2, name: '電腦', sortOrder: 2 },
          ],
          total: 2,
        })
      }),
      http.put('/api/product/categories/sort', async ({ request }) => {
        sortOrderRequestData = await request.json()
        return HttpResponse.json({
          code: 200,
        })
      }),
    )

    const wrapper = createWrapper()
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    wrapper.vm.toggleSortMode()
    wrapper.vm.sendSortOrderRequest()

    await vi.waitFor(() => {
      expect(sortOrderRequestData).toEqual([
        { id: 1, sortOrder: 1 },
        { id: 2, sortOrder: 2 },
      ])
    })
  })
})
