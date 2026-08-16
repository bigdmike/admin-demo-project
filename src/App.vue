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

      <v-divider class="mt-5" />

      <v-list class="pa-2">
        <template v-for="(menuItem,menuIndex) in menuList" :key="`menu_${menuIndex}`">
          <v-list-subheader>{{ menuItem.title }}</v-list-subheader>

          <v-list-item
            v-for="(item, i) in menuItem.list"
            :key="i"
            :active="$router.currentRoute.value.name == item.routeName"
            color="primary"
            rounded="shaped"
            :value="item"
            @click="$router.push({name:item.routeName})"
          >
            <template #prepend>
              <v-icon :icon="item.icon" />
            </template>

            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

    </v-navigation-drawer>

    <v-app-bar v-if="!isLoginPage">
      <div class="d-flex align-center">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
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
  import { mdiFolderMultipleOutline, mdiPackageVariantClosed, mdiTagMultipleOutline } from '@mdi/js'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import MainDialog from '@/components/MainDialog.vue'
  import AccountMenu from '@/components/MainHeader/AccountMenu.vue'
  import MainSnackbar from '@/components/MainSnackbar.vue'

  const router = useRouter()
  const drawer = ref(null)
  const isLoginPage = computed(() => router.currentRoute.value.name === 'LoginPage')
  const menuList = [
    {
      title: '商品相關',
      type: 'list',
      icon: '',
      list: [
        {
          title: '商品分類',
          icon: mdiFolderMultipleOutline,
          routeName: 'ProductCategoryListPage',
        },
        {
          title: '商品品牌',
          icon: mdiTagMultipleOutline,
          routeName: 'ProductBrandListPage',
        },
        {
          title: '商品列表',
          icon: mdiPackageVariantClosed,
          routeName: 'ProductListPage',
        },
      ],
    },
  ]
</script>
