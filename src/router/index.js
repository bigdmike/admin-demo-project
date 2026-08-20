import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'HomePage',
      path: '',
      component: () => import('@/pages/HomePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      name: 'LoginPage',
      path: '/login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      name: 'ProductCategoryListPage',
      path: '/product/categories',
      component: () => import('@/pages/ProductCategoriesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      name: 'ProductBrandListPage',
      path: '/product/brands',
      component: () => import('@/pages/ProductBrandsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      name: 'ProductListPage',
      path: '/products',
      component: () => import('@/pages/ProductListPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

let isAppInitialized = false

router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!isAppInitialized) {
    if (!authStore.isAuthenticated) {
      await authStore.initUserSession()
    }
    isAppInitialized = true
  }

  const isRequiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (isRequiresAuth && !authStore.isAuthenticated) {
    // 踢回登入頁，並透過 query 記住原本想去的頁面
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/' }
  }

  return
})

export default router
