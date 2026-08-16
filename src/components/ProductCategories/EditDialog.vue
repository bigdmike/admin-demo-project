<script setup>
  import { mdiSquareEditOutline } from '@mdi/js'
  import { ref } from 'vue'

  const emits = defineEmits(['update-action', 'create-action'])

  const formRef = ref(null)
  const dialog = ref(false)
  const name = ref('')
  const id = ref('')
  const nameRules = [
    value => {
      if (!value) return '請輸入名稱.'
      return true
    },
  ]

  function openDialog (item) {
    if (item) {
      name.value = item.name
      id.value = item.id
    } else {
      name.value = ''
      id.value = ''
    }
    dialog.value = true
  }

  function closeDialog () {
    dialog.value = false
    name.value = ''
    id.value = ''
  }

  async function save () {
    await formRef.value.validate()
    if (formRef.value.errors.length > 0) return

    if (id.value) {
      emits('update-action', { id: id.value, name: name.value })
    } else {
      emits('create-action', { name: name.value })
    }
  }

  defineExpose({
    openDialog,
    closeDialog,
  })

</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="400"
  >
    <v-card
      :prepend-icon="mdiSquareEditOutline"
      :title="id?'編輯商品分類':'新增商品分類'"
    >
      <v-card-text class="py-4">
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="name"
            density="comfortable"
            label="商品分類名稱"
            placeholder="請輸入名稱"
            required
            :rules="nameRules"
            variant="outlined"
          />
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          text="取消"
          variant="plain"
          @click="closeDialog"
        />

        <v-btn
          color="lime"
          text="儲存"
          variant="tonal"
          @click="save"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
