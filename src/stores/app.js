/* eslint-disable unicorn/no-this-outside-of-class */
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    snackbar: {
      show: false,
      message: '',
      type: 'success', // success, error, warning, info
    },
    dialog: {
      show: false,
      title: '',
      message: '',
      type: 'info', // info, warning, error, success
    },
    userData: {
      name: '',
      role: '',
    },
  }),
  actions: {
    setSnackbar ({ show, message, type }) {
      this.snackbar = { show, message, type }
    },
    setDialog ({ show, title, message, type }) {
      this.dialog = { show, title, message, type }
    },
    setUserData ({ name, role }) {
      this.userData = { name, role }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
}
