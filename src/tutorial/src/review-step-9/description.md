# 【实战 5】路由守卫 + 整合（访问控制） {#review-step-9}

> 对应试卷 **`router/index.js` 的守卫部分（10 分）** + **`main.js`（5 分）** + **`App.vue`（5 分）**。
>
> 这一步把前四步**全部串起来**，并补上考题里的「**访问控制：未登录访问活动页 → 自动重定向到登录页**」。

## 一、路由守卫：未登录就拦截 {#guard}

```js
// 给需要登录的路由打 meta 标记
const routes = [
  { name: 'login', path: '/login', component: LoginView },
  { name: 'list',  path: '/', component: ActivityView,
    meta: { requiresAuth: true } },          // ★ 要登录
  { name: 'detail', path: '/activities/:id', component: ActivityDetailView,
    props: true, meta: { requiresAuth: true } }
]

// 全局前置守卫：每次跳转前检查
router.beforeEach(to => {
  const isLoggedIn = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }  // 踢回登录页
  }
})
```

> 📌 三个记忆点：
> 1. 用 **`meta: { requiresAuth: true }`** 标记哪些页面要登录
> 2. **`beforeEach`** 里判断「要登录 && 没登录」→ 返回登录路由
> 3. 把目标地址塞进 **`query.redirect`**，登录后跳回去

## 二、登录后跳回原目标 {#redirect-back}

```js
// LoginView 里
const route = useRoute()
async function login() {
  const data = await request.post('/login', { ... })
  localStorage.setItem('token', data.token)
  router.push(route.query.redirect || '/')   // 回到守卫记下的页面
}
```

## 三、main.js 把一切装起来 {#main-js}

试卷的 `main.js`（5 分）就这几行：

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(createPinia())   // 装 Pinia
  .use(router)          // 装路由
  .mount('#app')
```

`App.vue`（5 分）核心就一个 `<RouterView />`：

```vue
<template>
  <header><RouterLink to="/">校园活动</RouterLink></header>
  <RouterView />   <!-- 路由匹配到的页面在这里渲染 -->
</template>
```

## 看右边 → 完整应用 {#try}

右边现在是**跑通的完整应用**：登录 → 列表 → 搜索 → 详情 → 报名。重点试这个：

1. 点右上角 **「退出登录」**（清掉 token）
2. 此时它**自动跳到登录页**——因为守卫发现 `/` 需要登录但你没登录
3. 重新登录 → 跳回列表

> ✅ 这就是试卷 A 卷要求的全部前端功能。**B 卷（二手交易）一模一样**，只是把「活动」换成「商品」、Header 从 `Token` 换成 `Auth-Token`、token 换成 `zzu666888`。

➡️ 最后一步：对着试卷**逐个文件清单速查** + 讲 **Express 后端 + MySQL**。
