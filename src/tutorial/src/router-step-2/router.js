import { createRouter, createMemoryHistory } from 'vue-router'
import UserList from './UserList.vue'
import UserDetail from './UserDetail.vue'
import NotFound from './NotFound.vue'

// 动态段用冒号前缀声明：:id 会被提取为 route.params.id
const routes = [
  { path: '/', component: UserList },
  { path: '/users/:id', component: UserDetail },
  // 兜底路由（放最后）：任何未匹配的路径都落到 NotFound
  // :pathMatch(.*)* —— pathMatch 是参数名，(.*) 匹配任意字符，末尾 * 表示 0 次以上分段
  { path: '/:pathMatch(.*)*', component: NotFound }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
