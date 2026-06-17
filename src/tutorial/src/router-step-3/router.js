import { createRouter, createMemoryHistory } from 'vue-router'
import UserList from './UserList.vue'
import User from './User.vue'
import Profile from './Profile.vue'
import Posts from './Posts.vue'

const routes = [
  { path: '/', component: UserList },
  {
    path: '/users/:id',
    component: User,
    // 子路由：渲染在 User.vue 内部的 <RouterView> 里
    children: [
      // 空 path 表示父路由默认子路由：/users/1 直接显示 Profile
      { path: '', component: Profile },
      // /users/1/posts
      { path: 'posts', component: Posts }
    ]
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
