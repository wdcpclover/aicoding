# 【知识 2】路由（Vue Router）复习 {#review-step-2}

> 路由 = **在不刷新页面的前提下，根据 URL 切换显示哪个组件**。右边是一个能点的小型多页应用。

## 一、三个核心 {#core}

```js
// router/index.js —— ① 路由表
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { name: 'home',  path: '/',          component: Home },
  { name: 'user',  path: '/users/:id', component: User, props: true }
]
export default createRouter({ history: createWebHistory(), routes })
```

```vue
<!-- ② RouterLink 导航  ③ RouterView 出口 -->
<RouterLink to="/users/7">用户 7</RouterLink>
<RouterView />
```

```js
// main.js 里装上
createApp(App).use(router).mount('#app')
```

## 二、动态参数 :id {#params}

```js
{ path: '/users/:id', component: User, props: true }
```

组件里两种拿法：

```js
// 方式 A（推荐）：props: true 后直接当 prop
const props = defineProps({ id: String })

// 方式 B：useRoute
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.params.id, route.query.keyword)
```

## 三、编程式导航 {#navigate}

```js
import { useRouter } from 'vue-router'
const router = useRouter()

router.push('/about')                       // 字符串路径
router.push({ name: 'user', params: { id: 9 } })  // 命名路由 + 参数
router.push({ path: '/list', query: { kw: 'vue' } }) // 带 query
router.back()                               // 后退
```

## 四、路由守卫（实战篇重点） {#guard}

```js
router.beforeEach((to) => {
  // 每次跳转前都先过这里；返回路由对象 = 重定向，不返回 = 放行
  if (to.meta.requiresAuth && !已登录) {
    return { name: 'login' }
  }
})
```

> 📌 守卫 + `meta.requiresAuth` 就是考题「未登录自动跳登录页」的标准答案，**实战篇第 9 节**会完整用到。

## 看右边 → {#try}

- 点导航在「首页 / 关于 / 用户」间切换，看 **URL 和高亮**变化
- 进「用户 #7」页：演示**动态参数 `:id`**（props 和 `route.params` 两种读法）
- 点「下一个用户」「回首页」：**编程式导航 `router.push`**
- 控制台能看到 `beforeEach` 守卫的日志

➡️ 下一节：**Pinia 复习**。
