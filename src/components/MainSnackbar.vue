<script setup>
  import { mdiAlertCircleOutline, mdiAlertOutline, mdiCheckCircleOutline, mdiClose } from '@mdi/js'
  import { computed } from 'vue'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  const snackbar = computed(() => appStore.snackbar)

  const typeList = {
    success: {
      title: '操作成功',
      color: 'success',
      icon: mdiCheckCircleOutline,
    },
    error: {
      title: '發生錯誤',
      color: 'error',
      icon: mdiAlertCircleOutline,
    },
    warning: {
      title: '警告',
      color: 'warning',
      icon: mdiAlertOutline,
    },
  }

</script>

<template>
  <v-snackbar
    :color="typeList[snackbar.type].color"
    contained
    location="top end"
    :model-value="snackbar.show"
    :prepend-icon="typeList[snackbar.type].icon"
    :text="snackbar.message"
    timeout="5000"
    timer="top"
    :timer-color="typeList[snackbar.type].color"
    :title="typeList[snackbar.type].title"
    variant="tonal"
  >
    <template #actions>
      <v-btn
        class="px-3"
        density="comfortable"
        :icon="mdiClose"
        rounded="full"
        variant="tonal"
        @click="snackbar.show = false"
      />
    </template>
  </v-snackbar>
</template>
