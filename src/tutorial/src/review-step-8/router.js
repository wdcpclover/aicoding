import { createRouter, createMemoryHistory } from 'vue-router'
import ListView from './ListView.vue'
import DetailView from './DetailView.vue'

// ===== router/index.js（路由表）=====
const routes = [
  { name: 'list', path: '/', component: ListView },
  {
    name: 'detail',
    path: '/activities/:id', // :id 是动态参数
    component: DetailView,
    props: true              // 把 :id 作为 props 传给 DetailView（组件更干净）
  }
]

export const router = createRouter({
  // REPL 用内存路由；真实项目用 createWebHistory()
  history: createMemoryHistory(),
  routes
})
