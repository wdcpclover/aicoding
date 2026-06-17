import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
import User from './User.vue'

const routes = [
  { name: 'home',  path: '/',          component: Home },
  { name: 'about', path: '/about',     component: About },
  {
    name: 'user',
    path: '/users/:id',  // 动态参数 :id
    component: User,
    props: true          // :id 作为 props 传进组件
  }
]

export const router = createRouter({
  history: createMemoryHistory(), // 真实项目：createWebHistory()
  routes
})

// 路由守卫示例（这里只打日志，实战篇会用它做登录拦截）
router.beforeEach((to) => {
  console.log('导航到：', to.fullPath)
})
