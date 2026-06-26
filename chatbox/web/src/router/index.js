// =============================================================
//  router/index.js
//  路由 + 守卫：未登录 → /login；已登录访问 /login 或 /register → /chat
// =============================================================

import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { setUnauthorizedHandler } from '../api/request'

const routes = [
  { path: '/',          redirect: '/chat' },
  { path: '/login',     name: 'login',    component: () => import('../views/LoginView.vue'),    meta: { guest: true } },
  { path: '/register',  name: 'register', component: () => import('../views/RegisterView.vue'), meta: { guest: true } },
  { path: '/chat',      name: 'chat',     component: () => import('../views/ChatView.vue'),     meta: { auth: true } },
  { path: '/settings',  name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { auth: true } },
  { path: '/:catchAll(.*)', redirect: '/chat' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guest && auth.isLoggedIn) return { name: 'chat' }
})

// 请求拦截器里 401 → 自动跳登录
setUnauthorizedHandler(() => {
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})

export default router
