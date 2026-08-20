import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { refreshToken } from '@/api/user.js'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  const initUserSession = async () => {
    try {
      const res = await refreshToken()
      setAccessToken(res.authToken)
      setUser(res.user)
      return true
    } catch {
      logout()
      return false
    }
  }

  const setAccessToken = token => {
    accessToken.value = token
  }

  const setUser = userData => {
    user.value = userData
  }

  const logout = () => {
    accessToken.value = null
    user.value = null
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    setAccessToken,
    setUser,
    logout,
    initUserSession,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
