import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import UserDetail from './UserDetail.vue'

const routes = [
  // 每条路由都给一个 name，跳转时用 name 代替硬编码 path
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'user-detail',
    path: '/users/:id',
    component: UserDetail,
    // props: true —— 把 route.params 作为 props 传给组件
    // 组件就不用依赖 $route / useRoute 了，复用性更好
    props: true
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
