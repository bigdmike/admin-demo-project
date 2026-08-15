<script setup>
  import { mdiEye, mdiEyeOff } from '@mdi/js'
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { loginApi } from '@/api/user'
  import { useAppStore } from '@/stores/app'
  import { setAccessToken } from '@/utils/request'

  const appStore = useAppStore()
  const router = useRouter()

  const loginFormRef = ref(null)
  const account = ref('admin@example.com')
  const password = ref('admin123')
  const errorMessage = ref('')
  const showPassword = ref(false)
  const rememberAccount = ref(false)

  const accountRules = [
    value => {
      if (!value) return '請輸入帳號.'
      if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value)) return '帳號必須是 Email.'
      return true
    },
  ]
  const passwordRules = [
    value => {
      if (!value) return '請輸入密碼.'
      if (value.length < 6) return '密碼長度至少 6 個字元.'
      return true
    },
  ]

  async function sendLoginRequest () {
    await loginFormRef.value.validate()
    if (loginFormRef.value.hasError) return

    loginApi({ account: account.value, password: password.value })
      .then(response => {
        errorMessage.value = ''
        if (rememberAccount.value) {
          localStorage.setItem('rememberedAccount', account.value)
        }
        setAccessToken(response.authToken)
        appStore.setUserData(response.user)
        router.push({ name: 'HomePage' })
      })
      .catch(error => {
        console.error('登入失敗', error)
        errorMessage.value = `登入失敗: ${error.message}`
      })
  }

  function openForgetPwdDialog () {
    appStore.setDialog({ show: true, title: '忘記密碼', message: '忘記了我也沒辦法', type: 'warning' })
  }

  watch(rememberAccount, newValue => {
    if (!newValue) {
      localStorage.removeItem('rememberedAccount')
    }
  })

  if (localStorage.getItem('rememberedAccount')) {
    account.value = localStorage.getItem('rememberedAccount')
    rememberAccount.value = true
  }

</script>

<template>
  <v-container class="fill-height d-flex flex-column justify-center" max-width="1100">
    <v-card
      class="mx-auto pa-5"
      max-width="100%"
      width="480"
    >
      <v-card-item>
        <div>
          <h1 class="mt-0 mb-2 font-weight-bold text-lime">
            系統登入
          </h1>

          <p class="text-body-medium mt-0 mb-8 text-grey">請登入您的帳號已開始進行網站內容編輯與管理</p>

          <v-form ref="loginFormRef" @submit.prevent>
            <v-text-field
              v-model.trim="account"
              class="mb-3"
              density="comfortable"
              label="帳號"
              placeholder="example@gmail.com"
              :rules="accountRules"
              variant="outlined"
            />

            <v-text-field
              v-model.trim="password"
              :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
              density="comfortable"
              label="密碼"
              placeholder="請輸入密碼"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <div class="d-flex justify-space-between align-center">
              <v-checkbox
                v-model="rememberAccount"
                color="lime"
                density="compact"
                hide-details
                label="記住帳號"
              />

              <p class="cursor-pointer text-body-medium text-lime font-weight-medium link-hover" @click="openForgetPwdDialog">忘記密碼</p>
            </div>

            <v-btn
              block
              class="mt-2 font-weight-bold"
              color="lime"
              size="large"
              type="submit"
              @click="sendLoginRequest"
            >登入</v-btn>

            <v-alert
              v-if="errorMessage"
              class="mt-5"
              :text="errorMessage"
              type="error"
              variant="tonal"
            />
          </v-form>

        </div>
      </v-card-item>
    </v-card>
  </v-container>
</template>
