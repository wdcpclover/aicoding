import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
import Contact from './Contact.vue'

// 路由表：每个 path 对应一个组件
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
]

// 创建并导出 router 实例
// 教程中用 memory 模式（URL 不变），真实项目用 createWebHashHistory() 或 createWebHistory()
export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
