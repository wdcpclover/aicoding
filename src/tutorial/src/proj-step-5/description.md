# 保持登录态 + 路由守卫 {#proj-step-5}

> 第 4 节我们的 axios 拦截器在拿到 401 时调了 `onUnauthorized()`——这一节负责"接住"它。
> 走 **需求 → 详细设计 → 实现**——把"关浏览器还认得我"做出来。

## 🎯 第一步：需求

挑出 [第 1 节用户故事](#proj-step-1) 里跟"登录态"相关的 3 条：

```
# | 用户故事
──┼─────────────────────────────────────────────────
8 | 关闭浏览器再回来还认得他（不用重新登录）
9 | 换一台电脑登同账号，仍能看到所有对话
10| 退出登录
```

加上**业务隐含要求**：

```
A. 未登录的人访问 /chat 这种需要登录的页面 → 自动跳 /login
B. 已登录的人访问 /login → 自动跳 /chat（不让重复登录）
C. 用户访问 /settings 被踢去登录 → 登录后回到 /settings（不是默认 /chat）
D. token 过期了之后调任意接口 → 自动跳登录页
```

## 🔍 第二步：详细设计

### 设计 1 — token 存哪？

```
方案对比               持久 跨标签 XSS  CSRF 教学难度
─────────              ──── ─── ─── ──── ────
✅ localStorage         ✓    ✓    ⚠️   ✓    ⭐⭐
sessionStorage          ✗    ✗    ⚠️   ✓
httpOnly cookie         ✓    ✓    ✓    ⚠️  ⭐⭐⭐⭐

教学版选 localStorage：
  ─ 跟 axios 请求拦截器手动塞 header 一气呵成
  ─ 真上线想最安全 → 用 httpOnly cookie + SameSite + CSRF token
```

为什么 sessionStorage 不行？故事 #8 要求"关闭浏览器再回来"——sessionStorage 关标签页就清，**不满足业务**。

### 设计 2 — 启动时怎么用 token

刚打开浏览器（不论是首次还是刷新页面）：

```
┌────────────────────────────────────┐
│ 1. main.js 启动                     │
│    ├ createApp                      │
│    ├ 装 Pinia + 装 Router            │
│    └ authStore.restore() ←─ 异步     │
│         │                            │
│         ├ 读 localStorage token      │
│         │   没 token → return       │
│         │                            │
│         └ 调 /api/auth/me           │
│             成功 → store.user = u   │
│             失败 → 清 token         │
│                                    │
│ 2. .finally(() => app.mount())     │
└────────────────────────────────────┘
```

**为什么必须调 `/me` 不能直接信 localStorage**？

```
localStorage 里 token 只是字符串，它可能：
  ① 过期了（exp 到了）         → 后端验签拒收
  ② 服务端 JWT_SECRET 改了    → 全部 token 失效
  ③ 被插件 / 脚本篡改          → 验签不过

→ 必须让后端验一次 → 唯一可信的判断
```

### 设计 3 — 为什么 `isLoggedIn = token && user`（不止 token）

```
只看 token：
  刷新页面瞬间 token 已读出来，但 user 还是 null（user 不持久化）
  → 这时 UI 看到"已登录但不知道自己是谁"的怪状态

✅ 等 restore() 调完拿到 user → 才算"完整登录"
  → 状态干净
```

```js
const isLoggedIn = computed(() => !!token.value && !!user.value)
```

### 设计 4 — 路由表 + meta 标签

用**路由 meta**给每个页面打标签：

```
meta.auth = true   → 需要登录才能进
meta.guest = true  → 必须未登录才能进（防已登录用户重复看到登录页）
```

```js
const routes = [
  { path: '/',         redirect: '/chat' },
  { path: '/login',    name: 'login',    component: ...LoginView,    meta: { guest: true } },
  { path: '/register', name: 'register', component: ...RegisterView, meta: { guest: true } },
  { path: '/chat',     name: 'chat',     component: ...ChatView,     meta: { auth: true } },
  { path: '/settings', name: 'settings', component: ...SettingsView, meta: { auth: true } },
  { path: '/:catchAll(.*)', redirect: '/chat' }
]
```

⚠️ 用 `() => import(...)` **路由懒加载** —— 第一次访问该路由才下载 chunk，首屏更小。

### 设计 5 — `beforeEach` 守卫

```js
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth  && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }   // ← A + C 同时解决
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return { name: 'chat' }                                       // ← B
  }
})
```

**关键技巧 `query.redirect`**：

```
用户没登录，访问 /settings
   │
   ▼
拦到 /login?redirect=%2Fsettings
   │
   ▼
LoginView 内部：登录成功后
   router.push(route.query.redirect || { name: 'chat' })
   │
   ▼
登录成功直接到 /settings，不是默认 /chat
```

→ 故事 C "回原页面"自动满足。**省略这步用户体验直降一档**。

### 设计 6 — 把 axios 401 桥接到路由跳转

[第 4 节 设计 5](#proj-step-4) 我们留下了一个钩子 `setUnauthorizedHandler`。这一节注册它：

```js
import { setUnauthorizedHandler } from '../api/request'

setUnauthorizedHandler(() => {
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})
```

**完整链路**：

```
故事 D: token 过期之后调任意 API
   ↓
后端返回 401
   ↓
api/request.js 响应拦截器：
   ① localStorage.removeItem('chatbox_token')
   ② onUnauthorized()                            ← 调注册进来的回调
   ↓
router 注册的回调：
   if (current.name !== 'login') router.push({ name: 'login' })
```

`current.name !== 'login'` 防 **已经在登录页时反复 push**。

### 设计 7 — 启动顺序：为什么 `.finally(mount)` 不用 `.then`

```js
// main.js
const app = createApp(App)
app.use(createPinia())
app.use(router)

const authStore = useAuthStore()
authStore.restore().finally(() => app.mount('#app'))
//                  ↑
//        不管成功失败都要挂载
```

```
restore 成功 → state ready → mount → 守卫放行 (✓ 登录态)
restore 失败 → token 已清 → mount → 守卫跳登录 (✓ 未登录态)
restore 网络挂 → 仍然 mount → 用户看到登录页 (✓ 兜底)

→ 永远不能因为"后端临时挂了"就白屏不渲染
```

## 💻 第三步：实现

```
chatbox/web/src/
├── main.js              # ① 启动顺序：装 Pinia + Router → restore → mount
├── App.vue              # ② 3 行根组件，只有 <RouterView />
├── stores/auth.js       # ③ token + user + restore + login/logout
└── router/index.js      # ④ 路由表 + beforeEach 守卫 + 401 桥接
```

### stores/auth.js 核心

```js
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t) {
    token.value = t
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else   localStorage.removeItem(TOKEN_KEY)
  }

  async function restore() {                // ← 设计 2
    if (!token.value) return
    try { user.value = (await authApi.me()).user }
    catch { setToken(''); user.value = null }
  }

  async function login(c) {                 // ← 故事 #2
    const { token, user: u } = await authApi.login(c)
    setToken(token); user.value = u; return u
  }

  function logout() {                       // ← 故事 #10
    setToken(''); user.value = null
  }

  return { token, user, isLoggedIn, restore, login, logout, ... }
})
```

完整代码看右边 →

### 验证 4 个业务场景

```
1. 没登录访问 /chat              → 跳 /login?redirect=/chat        ✓
2. 已登录访问 /login              → 跳 /chat                        ✓
3. 刷新 /chat                    → restore 验证 → 直接渲染 /chat   ✓
4. token 过期后调任意 API         → 401 → 清 token + 跳登录          ✓
```

## ✅ 本节学完，你应该能：

- ❓ 解释为什么 token 存 localStorage（而不是 sessionStorage / cookie） → [设计 1](#)
- ❓ 解释为什么必须调 /me 不能直接信 localStorage → [设计 2](#)
- ❓ 解释为什么 isLoggedIn 不能只看 token → [设计 3](#)
- ❓ 解释 query.redirect 解决了什么体验问题 → [设计 5](#)
- ❓ 解释 main.js 为什么用 `.finally(mount)` 不用 `.then(mount)` → [设计 7](#)

## 看右边 →

| 文件 | 看什么 |
|---|---|
| `web/src/stores/auth.js` | **核心** —— state + restore + login/logout |
| `web/src/router/index.js`| 路由表 + beforeEach + setUnauthorizedHandler |
| `web/src/main.js`        | 启动顺序：装插件 → restore → mount |
| `web/src/App.vue`        | 三行的根组件 |

下一节解决「**用户故事 #1 + #2 的 UI：登录注册页的表单怎么做出"上线品质"？**」
