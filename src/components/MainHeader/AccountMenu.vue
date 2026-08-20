<script setup>
  import { useRouter } from 'vue-router'
  import { expireRefreshToken, getUserInfo, logoutApi } from '@/api/user'
  import { useAppStore } from '@/stores/app'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const appStore = useAppStore()
  const router = useRouter()

  function getUserInfoRequest () {
    getUserInfo()
      .then(response => {
        console.log('取得使用者資訊成功', response)
      })
      .catch(error => {
        console.error('取得使用者資訊失敗', error)
      })
  }

  function sendLogoutRequest () {
    logoutApi()
      .then(response => {
        console.log('登出成功', response)
        authStore.logout()
        appStore.setSnackbar({ show: true, message: '登出成功', type: 'success' })
        router.push({ name: 'LoginPage' })
      })
      .catch(error => {
        console.error('登出失敗', error)
      })
  }

  function expireRefreshTokenRequest () {
    expireRefreshToken()
      .then(response => {
        console.log('強制 RefreshToken 過期成功', response)
      })
      .catch(error => {
        console.error('強制 RefreshToken 過期失敗', error)
      })
  }
</script>

<template>
  <v-menu
    transition="scale-transition"
  >
    <template #activator="{ props }">
      <v-btn
        v-if="authStore.isAuthenticated"
        v-bind="props"
        class="px-2"
        size="large"
      >
        <div
          class="d-flex align-center"
        >
          <v-avatar
            class="mr-4"
            size="36px"
          >
            <v-img
              alt="Avatar"
              src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
            />
          </v-avatar>

          <h6 class="text-title-medium my-0">{{ authStore.user.name }}</h6>
        </div>
      </v-btn>
    </template>

    <v-list class="px-2">
      <v-list-item value="取得資訊" @click="getUserInfoRequest">
        <v-list-item-title class="text-body-medium">取得資訊</v-list-item-title>
      </v-list-item>

      <v-list-item value="強制 RefreshToken 過期" @click="expireRefreshTokenRequest">
        <v-list-item-title class="text-body-medium">過期 RefreshToken</v-list-item-title>
      </v-list-item>

      <v-list-item value="登出" @click="sendLogoutRequest">
        <v-list-item-title class="text-body-medium text-red">登出</v-list-item-title>
      </v-list-item>

    </v-list>
  </v-menu>
</template>
