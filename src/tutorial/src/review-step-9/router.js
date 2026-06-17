import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from './LoginView.vue'
import ListView from './ListView.vue'
import DetailView from './DetailView.vue'

// ===== 考点：router/index.js（10 分）—— 路由表 + 路由守卫 =====
const routes = [
  { name: 'login', path: '/login', component: LoginView },
  {
    name: 'list',
    path: '/',
    component: ListView,
    meta: { requiresAuth: true } // ★ 标记：这个页面需要登录
  },
  {
    name: 'detail',
    path: '/activities/:id',
    component: DetailView,
    props: true,
    meta: { requiresAuth: true }
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// ★★★ 全局前置守卫：每次跳转前都先过这里 ★★★
router.beforeEach(to => {
  const isLoggedIn = !!localStorage.getItem('token')

  // 1) 未登录却想进「需要登录」的页面 → 踢回登录页，并记下原本要去哪
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 2) 已登录还去登录页 → 直接回首页
  if (to.name === 'login' && isLoggedIn) {
    return { name: 'list' }
  }
  // 3) 其它情况：不返回 = 放行
})
