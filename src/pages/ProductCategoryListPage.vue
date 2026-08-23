<script setup>
  import { mdiContentSave, mdiDelete, mdiMagnify, mdiPlus, mdiSort, mdiSquareEditOutline } from '@mdi/js'
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { createProductCategory, deleteProductCategory, getProductCategory, sortProductCategory, updateProductCategory } from '@/api/productCategory'
  import DeleteDialog from '@/components/MainDeleteDialog.vue'
  import MainDragList from '@/components/MainDragList.vue'
  import EditDialog from '@/components/ProductCategories/EditDialog.vue'
  import { useAppStore } from '@/stores/app'

  const route = useRoute()
  const router = useRouter()
  const appStore = useAppStore()
  const dragListRef = ref(null)
  const editDialogRef = ref(null)
  const deleteDialogRef = ref(null)
  const headers = ref([
    {
      title: '分類標題',
      align: 'start',
      sortable: false,
      key: 'name',
    },
    {
      title: '動作',
      key: 'actions',
      sortable: false,
      align: 'end',
    },
  ])
  const keyword = ref(route.query.keyword || '')
  const itemsPerPage = ref(route.query.itemsPerPage || '10')
  const page = ref(route.query.page || '1')
  const serverItems = ref([])
  const loading = ref(false)
  const totalItems = ref(0)
  const sortMode = ref(false)

  function toggleSortMode () {
    if (loading.value) return
    if (sortMode.value) {
      sortMode.value = false
    } else {
      sortMode.value = true
      dragListRef.value.setSortData(serverItems.value)
    }
  }

  function openEditDialog (item) {
    editDialogRef.value.openDialog(item)
  }

  function openDeleteDialog (id) {
    deleteDialogRef.value.openDialog('刪除商品分類', '確定要刪除這個商品分類嗎？', id)
  }

  function loadItems ({ page: currentPage, itemsPerPage: currentItemsPerPage }) {
    if (loading.value) return
    loading.value = true

    const query = {
      ...route.query,
      page: String(currentPage),
      itemsPerPage: String(currentItemsPerPage),
    }
    if (keyword.value === '') {
      delete query.keyword
    } else {
      query.keyword = keyword.value
    }
    router.push({ query })

    getProductCategory({ page: currentPage, itemsPerPage: currentItemsPerPage, keyword: keyword.value }).then(({ items, total }) => {
      serverItems.value = items
      totalItems.value = total
      loading.value = false
    }).catch(error => {
      appStore.setSnackbar({
        show: true,
        message: error?.message || '載入商品分類失敗',
        type: 'error',
      })
    }).finally(() => {
      loading.value = false
    })
  }

  function sendSortOrderRequest () {
    if (loading.value) return
    const sortIndexList = dragListRef.value.sortItems.map((item, index) => {
      return item.sortOrder
    })
    sortIndexList.sort((a, b) => a - b)
    const updatedSortData = dragListRef.value.sortItems.map((item, index) => {
      return {
        id: item.id,
        sortOrder: sortIndexList[index],
      }
    })
    loading.value = true
    sortProductCategory(updatedSortData)
      .then(response => {
        console.log(response)
        appStore.setSnackbar({ show: true, message: '成功更新商品分類排序', type: 'success' })
      })
      .catch(error => {
        appStore.setSnackbar({ show: true, message: error.message || '發生錯誤', type: 'error' })
        console.error('更新排序失敗', error)
      })
      .finally(() => {
        loading.value = false
        toggleSortMode()
        loadItems({ page: page.value, itemsPerPage: itemsPerPage.value })
      })
  }

  function sendCreateRequest (data) {
    if (loading.value) return
    loading.value = true
    createProductCategory(data)
      .then(response => {
        console.log(response)
        appStore.setSnackbar({ show: true, message: '成功新增商品分類', type: 'success' })
        editDialogRef.value.closeDialog()
      })
      .catch(error => {
        appStore.setSnackbar({ show: true, message: error.message || '發生錯誤', type: 'error' })
        console.error('新增商品分類失敗', error)
      })
      .finally(() => {
        loading.value = false
        loadItems({ page: page.value, itemsPerPage: itemsPerPage.value })
      })
  }

  function sendUpdateRequest (data) {
    if (loading.value) return
    loading.value = true
    updateProductCategory(data.id, data)
      .then(response => {
        console.log(response)
        appStore.setSnackbar({ show: true, message: '成功更新商品分類', type: 'success' })
        editDialogRef.value.closeDialog()
      })
      .catch(error => {
        appStore.setSnackbar({ show: true, message: error.message || '發生錯誤', type: 'error' })
        console.error('更新商品分類失敗', error)
      })
      .finally(() => {
        loading.value = false
        loadItems({ page: page.value, itemsPerPage: itemsPerPage.value })
      })
  }

  function sendDeleteRequest (id) {
    if (loading.value) return
    loading.value = true
    deleteProductCategory(id)
      .then(response => {
        console.log(response)
        appStore.setSnackbar({ show: true, message: '成功刪除商品分類', type: 'success' })
      })
      .catch(error => {
        appStore.setSnackbar({ show: true, message: error.message || '發生錯誤', type: 'error' })
        console.error('刪除商品分類失敗', error)
      })
      .finally(() => {
        loading.value = false
        loadItems({ page: page.value, itemsPerPage: itemsPerPage.value })
      })
  }

</script>

<template>

  <v-container class="fill-height d-flex flex-column justify-center">
    <v-row>
      <v-col cols="12">
        <v-card elevation="0">

          <v-card-text v-show="!sortMode">
            <v-row class="w-full">
              <v-col>
                <v-text-field
                  v-model="keyword"
                  :append-inner-icon="mdiMagnify"
                  color="lime"
                  data-testid="keyword-input"
                  density="compact"
                  hide-details
                  label="搜尋"
                  single-line
                  variant="outlined"
                  width="300"
                  @change="loadItems({ page: 1, itemsPerPage })"
                />
              </v-col>

              <v-spacer />

              <v-col class="d-flex justify-end" md="3">
                <v-btn class="mr-4" color="black" :prepend-icon="mdiSort" @click="toggleSortMode">調整排序</v-btn>
                <v-btn color="lime" data-testid="add-button" :prepend-icon="mdiPlus" @click="openEditDialog(null)">新增分類</v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text v-show="sortMode" class="bg-grey-darken-3">
            <v-row class="w-full d-flex align-center ">
              <v-col>
                <p class="text-title-large font-weight-bold my-0">調整排序</p>
              </v-col>

              <v-spacer />

              <v-col class="d-flex justify-end" md="3">
                <v-btn class="mr-4" color="lime" variant="tonal" @click="toggleSortMode">取消</v-btn>
                <v-btn color="lime" :prepend-icon="mdiContentSave" @click="sendSortOrderRequest">儲存排序</v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-data-table-server
            v-show="!sortMode"
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            :headers="headers"
            item-value="name"
            :items="serverItems"
            :items-length="totalItems"
            :loading="loading"
            @update:options="loadItems"
          >
            <template #item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  data-testid="edit-button"
                  elevation="0"
                  icon
                  size="small"
                  @click="openEditDialog(item)"
                >
                  <v-icon color="medium-emphasis" :icon="mdiSquareEditOutline" />
                </v-btn>

                <v-btn
                  data-testid="delete-button"
                  elevation="0"
                  icon
                  size="small"
                  @click="openDeleteDialog(item.id)"
                >
                  <v-icon color="medium-emphasis" :icon="mdiDelete" />
                </v-btn>
              </div>
            </template>
          </v-data-table-server>

          <MainDragList v-show="sortMode" ref="dragListRef" />
        </v-card>

      </v-col>
    </v-row>

    <EditDialog ref="editDialogRef" @create-action="sendCreateRequest" @update-action="sendUpdateRequest" />
    <DeleteDialog ref="deleteDialogRef" @delete-action="sendDeleteRequest" />
  </v-container>
</template>
