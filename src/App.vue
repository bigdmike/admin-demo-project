<template>
  <v-app id="inspire">
    <v-navigation-drawer v-if="!isLoginPage" v-model="drawer">
      <v-sheet
        class="px-4 pt-4"
      >
        <div
          class="d-flex align-center"
        >
          <v-avatar
            class="mr-4"
            rounded="0"
            size="28px"
          >
            <v-img
              alt="Avatar"
              src="@/assets/logo.svg"
            />
          </v-avatar>

          <h6 class="text-title-medium font-weight-bold my-0">後台管理系統</h6>
        </div>
      </v-sheet>

      <v-divider class="my-5" />

    </v-navigation-drawer>

    <v-app-bar v-if="!isLoginPage">
      <div class="d-flex align-center">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <!-- <v-app-bar-title>Application</v-app-bar-title> -->
      </div>

      <v-spacer />

      <div class="pr-3">
        <AccountMenu />
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <MainSnackbar />
    <MainDialog />
  </v-app>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import MainDialog from '@/components/MainDialog.vue'
  import AccountMenu from '@/components/MainHeader/AccountMenu.vue'
  import MainSnackbar from '@/components/MainSnackbar.vue'

  const router = useRouter()
  const drawer = ref(null)
  console.log(router.currentRoute)
  const isLoginPage = computed(() => router.currentRoute.value.name === 'LoginPage')
</script>
