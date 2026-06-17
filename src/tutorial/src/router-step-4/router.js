import { createRouter, createMemoryHistory } from 'vue-router'
import Home from './Home.vue'
import Search from './Search.vue'
import UserDetail from './UserDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/search', component: Search },
  { path: '/users/:id', component: UserDetail }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
