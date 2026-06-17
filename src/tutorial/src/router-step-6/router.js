import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import Login from './Login.vue'
import Admin from './Admin.vue'
import { auth } from './auth.js'

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'login', path: '/login', component: Login },
  {
    name: 'admin',
    path: '/admin',
    component: Admin,
    // meta：附加到路由上的自定义数据，守卫里可读
    meta: { requiresAuth: true }
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// ★ 全局前置守卫：每次导航前都会执行
// 返回 false 或路由对象 → 取消 / 重定向
// 返回 true 或不返回  → 放行
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    // 未登录访问需要登录的页面 → 重定向到登录页
    // 把目标路径带在 query 里，登录成功后跳回去
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }
  // 已登录用户访问登录页 → 直接去首页
  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'home' }
  }
})
