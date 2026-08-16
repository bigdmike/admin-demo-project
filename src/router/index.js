/**
 * router/index.js
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'HomePage',
      path: '',
      component: () => import('@/pages/HomePage.vue'),
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
    },
  ],
})

export default router
