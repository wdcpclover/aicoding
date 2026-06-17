# 工程化封装：request + userApi + 拦截器 {#api-step-4}

> 到这一节为止，你已经会**调接口**（第 2 节）+ **处理错误**（第 3 节）了。但真实项目里**没有人这么裸写 axios**——会被痛点磨疯。
> 这一节做一件事：**把 axios 用工程化的方式包起来**，让组件层从今往后**只看 API 名字，不看 axios 长什么样**。

## 〇、依然是同一个后端 {#prep}

```bash
cd server && npm start
```

## 一、不封装的痛点（先看痛苦） {#pain}

回想一下，第 2 节我们 5 个按钮其实都长这样：

```js
await axios.get('http://localhost:3001/api/users')
await axios.get(`http://localhost:3001/api/users/${id}`)
await axios.post('http://localhost:3001/api/users', data)
await axios.put(`http://localhost:3001/api/users/${id}`, data)
await axios.delete(`http://localhost:3001/api/users/${id}`)
```

放到几十个组件里，问题暴露：

| 重复点 | 后果 |
|---|---|
| **`http://localhost:3001` 每处写一次** | 上线换域名要全局搜索替换 |
| **`headers / timeout` 每处写一次** | 加个 `Authorization: Bearer xxx` 要扫一遍代码 |
| **`.data` 每处剥一次** | 多写几百次，命名又乱 |
| **`try/catch + 三态判断` 每个组件写一遍** | 第 3 节那段判断要写无数次 |
| **接口 URL 散落组件里** | 找一个接口要全项目搜 |

**目标**：组件只关心"调哪个 API、传什么参、拿到什么数据"，**剩下的全部交给底层一处管**。

## 二、三层架构 {#layers}

```
组件层（App.vue）
   │ 只 import userApi，看不到 axios
   ▼
API 层（userApi.js）          ← 业务接口：list / get / create / update / remove
   │ 内部调 request
   ▼
传输层（request.js）          ← axios 实例 + 拦截器
   │ HTTP
   ▼
后端 (Express @ :3001)
```

每一层只关心一件事：

- **request.js**：HTTP 通讯的"管道" —— baseURL、timeout、token、统一错误
- **userApi.js**：业务接口的"名片" —— 一个对象列出全部用户相关接口
- **App.vue**：UI 逻辑 —— 只调 `userApi.xxx()`

> 真实项目就是这样分的。**右边的 REPL 把这三层文件全摆出来**——你能切到 `request.js` 看拦截器、切到 `userApi.js` 看接口列表、切到 `App.vue` 看组件只剩纯业务。

## 三、`request.js` —— axios 实例 + 拦截器 {#request-js}

### 1）创建实例（不污染全局 axios）

```js
import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3001',      // 真实项目用 import.meta.env.VITE_API_BASE
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})
```

`request` 是一个**全新的 axios 实例**，跟全局 `axios` 完全隔离。它支持所有跟 `axios` 一样的方法（`request.get / post / put / delete / ...`）。

> **为什么不直接改 `axios.defaults`？**
> 你的项目要调自家后端 → 拦截器会加 token、跳登录；但某个第三方 SDK 内部也用了 axios → 不希望被你的拦截器影响。
> **`axios.create()` 让你和第三方各拥有"小 axios"，互不打架。**

### 2）请求拦截器：发出去之前过一遍

每个请求**发出去之前**都会被请求拦截器处理。最常见的三个用途：

```js
request.interceptors.request.use(
  config => {
    // 用途 1：自动加 token
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    // 用途 2：加请求 ID，便于前后端日志对得上
    config.headers['X-Request-Id'] = Math.random().toString(36).slice(2, 10)

    // 用途 3：打日志（教学/调试用，生产可关）
    console.log(`→ ${config.method.toUpperCase()} ${config.url}`)

    return config       // ⚠️ 必须 return config，否则请求被吞掉
  },
  err => Promise.reject(err)
)
```

**最常踩的坑**：忘记 `return config` —— 请求直接没了，调试半天。

### 3）响应拦截器：拿到响应之后过一遍

这是**封装收益最大的地方** —— 把"剥 `.data`"和"统一错误处理"一次搞定：

```js
request.interceptors.response.use(
  // —— 成功路径：把 response.data 直接 return 出去 ——
  response => {
    console.log(`← ${response.status} ${response.config.url}`)
    return response.data            // ⭐ 全项目少写无数次 .data
  },
  // —— 失败路径：第 3 节的三种形态在这里统一处理 ——
  error => {
    if (!error.response) {
      console.error('🌐 网络错误（后端没启动？）')
    } else {
      const { status, data } = error.response
      switch (status) {
        case 401: console.warn('🔒 未登录 (401)，应跳登录页'); break
        case 403: console.warn('⛔ 无权限 (403)'); break
        case 404: console.warn('🔍 资源不存在 (404)'); break
        case 500: console.error('💥 服务器错误 (500)', data); break
        default:  console.warn(`❓ HTTP ${status}`, data)
      }
    }
    return Promise.reject(error)    // 继续往业务层抛
  }
)
```

#### 剥 `.data` 的魔法

`response => response.data` 这一行让全项目少写无数次 `.data`：

```js
// 封装前
const res  = await axios.get('/api/users')
const list = res.data                  // 注意 .data

// 封装后
const list = await request.get('/api/users')   // ✅ 直接是数据本身
```

> ⚠️ **副作用**：`await request.get(...)` 拿到的**不再是 axios 的 res 对象，而是 res.data**。这意味着拿不到 `res.status`、`res.headers` 了。绝大多数业务用不到（拦截器已统一处理 4xx/5xx）；偶尔需要时见**第六、最常踩的坑**。

## 四、`userApi.js` —— 业务接口模块 {#user-api-js}

`request` 是"管道"，业务接口再拆一层：

```js
import request from './request.js'

export const userApi = {
  list:   ()         => request.get('/api/users'),
  get:    (id)       => request.get(`/api/users/${id}`),
  create: (data)     => request.post('/api/users', data),
  update: (id, data) => request.put(`/api/users/${id}`, data),
  remove: (id)       => request.delete(`/api/users/${id}`),

  // 演示：故意触发 500 给响应拦截器抓
  boom:   ()         => request.get('/api/users?_error=1')
}
```

**好处**：

- 接口 URL **只在 `api/` 目录里出现**，搜接口看一个目录
- 组件层只看到语义化方法名 `list / create / remove`
- 后端改路径？只动这一处，所有调用者无感

```js
// src/api/post.js —— 同样套路
import request from '../utils/request.js'
export const postApi = {
  list:    (params) => request.get('/api/posts', { params }),
  detail:  (id)     => request.get(`/api/posts/${id}`),
  publish: (data)   => request.post('/api/posts', data)
}
```

## 五、组件层：从此看不到 axios {#app-vue}

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from './userApi.js'

const users   = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    users.value = await userApi.list()    // ✅ 一行，没 baseURL 没 .data
  } catch {
    // 已经在响应拦截器里统一处理；组件这里通常无需再写
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
```

**对比封装前后**：

| 维度 | 不封装 | 封装后 |
|---|---|---|
| URL 写法 | 每个组件写完整 URL | `request.js` 一处 baseURL |
| 加 token | 每个请求写一遍 headers | 拦截器一次性加 |
| 取数据 | `res.data.xxx` | `xxx` |
| 错误处理 | 每个组件 try/catch + 状态码判断 | 拦截器统一处理 |
| 查接口 | 全项目搜 URL | 翻 `api/` 目录 |

## 六、最常踩的两个坑 {#pitfalls}

### 坑 1：剥了 `.data` 后拿不到 status

响应拦截器 `return response.data` 后，业务里拿到的就是 data 本身。**没有 `res.status` 可拿了**。

绝大多数业务无所谓（拦截器已统一处理），但偶尔需要"按状态码区别处理"的场景，常见两种解法：

```js
// 方案 A：拦截器不剥 data，业务每次写 .data（最保守，类型友好）
return response

// 方案 B：单独建一个不剥 data 的实例 rawRequest，特殊场景用
const rawRequest = axios.create({...})
```

教学用我们这套**剥了 data**，目的是直观展示拦截器价值；真实项目里**视团队规范选一个统一**。

### 坑 2：拦截器执行顺序是"洋葱"

```
请求拦截器 A (use)
  → 请求拦截器 B (use)
    → 实际发出 HTTP
  ← 响应拦截器 B (use)
← 响应拦截器 A (use)
```

请求拦截器**后注册的先执行**（栈式 LIFO）；响应拦截器**先注册的先执行**（队列 FIFO）。
绝大多数项目只挂一对拦截器，遇不到这个细节；**但出现"我加的 header 不见了"时，先想这个顺序**。

## 七、环境变量切 baseURL（生产必用） {#env}

开发指本地 `:3001`、生产指 `api.xxx.com`，**代码不能改**——靠 `.env`：

```bash
# .env.development
VITE_API_BASE=http://localhost:3001

# .env.production
VITE_API_BASE=https://api.myapp.com
```

```js
// request.js
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,    // 自动按当前环境读对应文件
  timeout: 10000
})
```

`pnpm dev` 读 `.env.development`、`pnpm build` 读 `.env.production`，**零代码改动切环境**。

## 看右边 →

右边把封装拆成了**真实项目同款的三个文件**——点上方文件名切换查看：

- **`request.js`** —— 实例 + 拦截器（**核心**，30 行）
- **`userApi.js`** —— 业务 API 对象
- **`App.vue`** —— 组件层：**只 import userApi，看不到 axios**

下方按钮一一对应 userApi 的方法：

| 按钮 | 调用 | 期望日志 |
|---|---|---|
| **列表** | `userApi.list()` | `→ GET /api/users` `← 200 /api/users` |
| **新增** | `userApi.create({...})` | `→ POST /api/users` `← 201 /api/users` |
| **第一个 +1** | `userApi.update(1, { age })` | `→ PUT /api/users/1` `← 200 /api/users/1` |
| **删第一个** | `userApi.remove(1)` | `→ DELETE /api/users/1` `← 200 /api/users/1` |
| **💥 故意 500** | `userApi.boom()` | `→ GET ...?_error=1` + `💥 服务器错误 (500)` |

下方那块"拦截器实时日志"就是 `console.log` 的可视化版本——**所有请求都先经过 `→` 拦截器，再经过 `←` 拦截器**，组件里完全没写 `console.log`。

下一节我们把**数据**也搬出组件——用 Pinia store 承接，让多组件共享同一份用户列表，看整条"组件 → store → api → request → Express"链路是怎么转的。
