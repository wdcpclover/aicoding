# 在组件外使用 Store {#pinia-step-6}

> Store 不只能在 Vue 组件里使用 —— **任何 JavaScript 模块**都可以使用它。本节介绍组件外使用的常见场景与必须遵守的规则。

## 一、组件外使用的典型场景

| 场景 | 用途 |
|---|---|
| **路由守卫**（router.beforeEach） | 根据登录态决定是否放行 |
| **HTTP 拦截器**（axios.interceptors） | 自动给每个请求带上 token |
| **工具函数 / composable** | 把"读 store + 处理"的逻辑封装到普通函数里复用 |
| **WebSocket 消息处理** | 收到推送时直接更新 store |
| **业务模块的独立单元测试** | 不依赖组件，直接对 store 调用断言 |

## 二、唯一的核心规则

`useXxxStore()` 内部依赖**全局已激活的 pinia 实例**。这意味着调用它**必须在 `app.use(pinia)` 之后**。

由于 JavaScript 模块加载是同步的、发生在 `createApp().mount()` 之前，下面这种**模块顶层调用**必然失败：

```js
// auth-utils.js
import { useAuthStore } from './stores/auth'

// ❌ 错误：模块加载时执行 —— 此时 pinia 还没安装
const authStore = useAuthStore()

export function isLoggedIn() {
  return authStore.isLoggedIn
}
```

正确做法：把 `useXxxStore()` 调用**延迟到函数内部**。函数被调用的那一刻 pinia 早已安装好。

```js
// auth-utils.js  ✅
import { useAuthStore } from './stores/auth'

export function isLoggedIn() {
  // 函数体内调用，此时 pinia 已就绪
  const authStore = useAuthStore()
  return authStore.isLoggedIn
}
```

## 三、在路由守卫中

```js
// router.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [/* ... */]
})

router.beforeEach((to) => {
  // ✅ 守卫每次触发时调用，pinia 已就绪
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export { router }
```

要点：

- **不能**在路由文件顶层调用 `useAuthStore()`（路由模块比 pinia 更早加载）
- 在 `beforeEach` 回调函数内调用 —— 此时 Vue 应用已挂载，pinia 已激活

## 四、在 axios 拦截器中

```js
// axios-instance.js
import axios from 'axios'
import { useAuthStore } from './stores/auth'

const http = axios.create({ baseURL: '/api' })

// 请求拦截器：自动塞 token
http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// 响应拦截器：401 时自动登出
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
    }
    return Promise.reject(error)
  }
)

export { http }
```

每次请求 / 响应触发拦截器时，回调函数被调用，此时 `useAuthStore()` 能正常拿到 store 实例。

## 五、在工具函数中（最常见）

把"读 store + 处理"的逻辑抽成普通 JavaScript 函数，组件、其他工具、测试都能复用：

<div class="composition-api">

```js
// utils/auth.js
import { useAuthStore } from './stores/auth'

export function requireAuth(action) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return `❌ 拒绝：「${action}」需要登录`
  }
  return `✅ 允许：${auth.user.name} 执行了「${action}」`
}

export function getAuthHeader() {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}
```

组件里直接调：

```vue
<script setup>
import { requireAuth } from './utils/auth'

function tryDelete() {
  const result = requireAuth('删除文章')
  console.log(result)
}
</script>
```

</div>

<div class="options-api">

```js
// utils/auth.js  —— 与组合式版本完全一样
import { useAuthStore } from './stores/auth'

export function requireAuth(action) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return `❌ 拒绝：「${action}」需要登录`
  }
  return `✅ 允许：${auth.user.name} 执行了「${action}」`
}
```

组件里：

```js
import { requireAuth } from './utils/auth'

export default {
  methods: {
    tryDelete() {
      const result = requireAuth('删除文章')
      console.log(result)
    }
  }
}
```

</div>

> 💡 注意工具函数的代码**不区分组合式 / 选项式** —— 工具函数本来就跟组件无关，对它而言只有"调用 store"这件事。

## 六、SSR：必须显式传 pinia

服务端渲染时，**每个请求都要用独立的 pinia 实例**（避免请求间数据污染）。这时不能依赖全局，必须显式传：

```js
import { createPinia } from 'pinia'
import { useStore } from './stores/main'

export default function ssrHandler() {
  const pinia = createPinia()
  // 显式传 pinia，否则 SSR 中拿不到默认全局实例
  const store = useStore(pinia)
  // ...
}
```

学生项目（CSR、单一 Vue 应用）一般用不到，了解即可。详见 Pinia 官方 SSR 章节。

## 七、组件外使用的几个常见错误

| 错误 | 原因 | 修复 |
|---|---|---|
| 模块顶层 `const store = useXxxStore()` | pinia 未激活 | 移到函数内 |
| 在 router.js 顶层调用 store | router 比 pinia 更早加载 | 在守卫回调内调 |
| SSR 中多个请求看到对方的数据 | 共用了同一个全局 pinia | 每个请求 `createPinia()` 并显式传给 `useStore()` |
| `store` 在 setup 外使用 ref 但没解构出来 | 直接解构会丢响应性 | 用 `storeToRefs` |

## 看右边 →

REPL 里有一个**迷你登录系统**：

- `authStoreSetup.js` / `authStoreOption.js`：保存 `token` / `user` / 提供 `login()` / `logout()`
- **`authUtils.js`**：**这是普通 JS 模块**，里面写了两个工具函数 `requireAuth(action)` 和 `getAuthHeader()`。注意函数体内才调 `useAuthStore()`。
- 右侧组件调用工具函数 —— 工具函数内部读 store 状态返回判断结果

依次点：登录 → 尝试删除文章 → 登出 → 再次尝试，观察工具函数怎么根据 store 状态返回不同结果。
