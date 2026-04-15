import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tool/:id',
    name: 'ToolDetail',
    component: () => import('../pages/ToolDetail.vue')
  },
  {
    path: '/submit',
    name: 'SubmitTool',
    component: () => import('../pages/SubmitTool.vue')
  },
  {
    path: '/category/:category',
    name: 'Category',
    component: () => import('../pages/Category.vue')
  },
  {
    path: '/test-tailwind',
    name: 'TestTailwind',
    component: () => import('../pages/TestTailwind.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

export default router
