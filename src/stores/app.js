import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const snackbar = ref({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
  })

  const dialog = ref({
    show: false,
    title: '',
    message: '',
    type: 'info', // info, warning, error, success
  })

  const setSnackbar = ({ show, message, type }) => {
    snackbar.value = { show, message, type }
  }
  const setDialog = ({ show, title, message, type }) => {
    dialog.value = { show, title, message, type }
  }

  return {
    snackbar,
    dialog,
    setSnackbar,
    setDialog,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
