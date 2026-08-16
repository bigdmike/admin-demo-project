<script setup>
  import { mdiAlertCircleOutline, mdiAlertOutline, mdiCheckCircleOutline } from '@mdi/js'
  import { ref } from 'vue'

  const emits = defineEmits(['delete-action'])
  const show = ref(false)
  const title = ref('')
  const message = ref('')
  const data = ref(null)

  function closeDialog () {
    show.value = false
  }
  function openDialog (dialogTitle, dialogMessage, deleteData) {
    title.value = dialogTitle
    message.value = dialogMessage
    data.value = deleteData
    show.value = true
  }
  function confirmDelete () {
    emits('delete-action', data.value)
    closeDialog()
  }

  defineExpose({
    openDialog,
    closeDialog,
  })

</script>

<template>
  <v-dialog
    v-model="show"
    width="400"
  >
    <v-card
      max-width="400"
      :prepend-icon="mdiAlertCircleOutline"
      :text="message"
      :title="title"
    >
      <template #actions>
        <v-spacer />

        <v-btn
          class="ms-auto"
          text="關閉"
          @click="closeDialog"
        />

        <v-btn
          class="ms-auto"
          color="error"
          text="刪除"
          variant="tonal"
          @click="confirmDelete"
        />
      </template>
    </v-card>
  </v-dialog>
</template>
