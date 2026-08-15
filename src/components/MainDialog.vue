<script setup>
  import { mdiAlertCircleOutline, mdiAlertOutline, mdiCheckCircleOutline } from '@mdi/js'
  import { computed, ref } from 'vue'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  const show = computed(() => appStore.dialog.show)
  const title = computed(() => appStore.dialog.title ?? typeData.value.title)
  const message = computed(() => appStore.dialog.message)
  const type = computed(() => appStore.dialog.type)
  const typeData = computed(() => typeList[type.value] || {})

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

  function closeDialog () {
    appStore.setDialog({ show: false, title: title.value, message: message.value, type: type.value })
  }

</script>

<template>
  <v-dialog
    v-model="show"
    width="400"
  >
    <v-card
      max-width="400"
      :prepend-icon="typeData.icon"
      :text="message"
      :title="title"
    >
      <template #actions>
        <v-btn
          class="ms-auto"
          text="關閉"
          @click="closeDialog"
        />
      </template>
    </v-card>
  </v-dialog>
</template>
