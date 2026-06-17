# 前端 ↔ 后端 —— axios 工程化封装 {#proj-step-4}

> 第 3 节后端已经签好 token 验好身份。这一节回到前端，走 **需求 → 详细设计 → 实现**——
> 把"所有用户故事都要走的请求层"做出来。

## 🎯 第一步：需求

[第 1 节用户故事表](#proj-step-1) 里**所有需要"发请求"的故事**——其实是全部 10 条——都依赖一件事：

> 「**前端怎么发 HTTP 请求给后端**」

把这件事拆细，得到几条**隐式要求**：

```
A. 后端地址（开发 vs 上线不一样）── 怎么不写死？
B. 每个需要登录的请求都要带 token ── 怎么不每次手写？
C. 后端返回 401（token 过期）── 怎么统一处理（清 token + 跳登录）？
D. 后端约定响应格式 { data, message, ... } ── 业务代码怎么少写 .data？
E. 接口 URL 散落在组件里 ── 后端改路径就要全项目搜？
F. 调用超时 / 网络挂 ── 错误信息怎么对用户友好？
```

**这一节就是把这 6 条变成代码**。

## 🔍 第二步：详细设计

### 设计 1 — 三层分离

按"职责"把 axios 调用切三层：

```
┌──────────────────────────────────────────────────────┐
│ 组件层（ChatView / LoginView / SettingsView ...）     │
│                                                      │
│   const list = await conversationsApi.list()         │
│            ↑                                          │
│            └── 看到的只是业务方法名                    │
└─────────┬────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────┐
│ 业务 API 模块（src/api/*.js）                          │
│   authApi          ─── register / login / me         │
│   conversationsApi ─── list / create / rename / remove│
│   messagesApi      ─── list / send                   │
│   settingsApi      ─── get / update                  │
└─────────┬────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────┐
│ 传输层（src/api/request.js）                          │
│                                                      │
│   axios.create({ baseURL: import.meta.env.VITE_API_BASE })│
│       ├─ 请求拦截器：自动加 Authorization              │
│       └─ 响应拦截器：剥 .data + 401 自动登出           │
└──────────────────────────────────────────────────────┘
```

**每层一件事**：

- **request.js**：网络 / 认证 / 错误 ── 项目里**只此一份**
- **api/*.js**：接口语义 / URL 路径 ── 一个业务对象一个文件
- **组件**：UI / 交互 ── 只 `import xxxApi`，不直接碰 axios

这 6 条隐式要求**分别落在**：

| 需求 | 落在哪一层 |
|---|---|
| A. baseURL 不写死 | request.js（实例配置） |
| B. 自动带 token | request.js（请求拦截器） |
| C. 401 统一处理 | request.js（响应拦截器） |
| D. 少写 .data | request.js（响应拦截器） |
| E. URL 集中 | api/*.js |
| F. 错误友好 | 业务代码用 try/catch 拆 |

### 设计 2 — baseURL 用环境变量切

```
开发态                              生产态
──────                              ──────
后端在本机 :3002                    前后端同域部署，相对路径
                                    （vite build → Express 一并 serve）

VITE_API_BASE=                      VITE_API_BASE=
  http://localhost:3002               ← 留空 → 走 /api/* 相对路径
```

```js
// 代码里
baseURL: import.meta.env.VITE_API_BASE || ''
```

**Vite 的环境变量规则**：

```
.env.development   → npm run dev 自动加载
.env.production    → npm run build 自动加载

⚠️ 只有 VITE_ 开头的变量才会注入到前端 bundle
   → 防止你把后端密钥不小心打进前端
```

### 设计 3 — 请求拦截器自动带 token

每个请求 axios **先经过**这个函数：

```js
request.interceptors.request.use(config => {
  const token = localStorage.getItem('chatbox_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

→ 业务代码再也不用写 `headers: { Authorization: ... }`。

### 设计 4 — 响应拦截器剥 .data + 401 自动登出

```js
request.interceptors.response.use(
  res => res.data,             // ① 剥 .data
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chatbox_token')
      onUnauthorized?.()        // ② 通知路由跳登录
    }
    return Promise.reject(err)
  }
)
```

**两件事**：

```js
// 剥 .data 之前：
const res = await axios.get('/api/users')
const list = res.data

// 剥 .data 之后：
const list = await request.get('/api/users')   // ✓ 直接是数据
```

### 设计 5 — 解循环依赖：401 处理为什么不直接 import router

最 naive 的写法：

```js
// ❌ request.js
import router from '../router'
if (err.response?.status === 401) router.push('/login')
```

**问题——循环依赖陷阱**：

```
router/index.js  → import useAuthStore
stores/auth.js   → import authApi
api/auth.js      → import request
api/request.js   → 如果 import router ...
   ↑
   回到 router/index.js   ← 死循环！
```

**解法：依赖倒置**——request.js **暴露一个钩子**让外部"注册"回调：

```js
// request.js
let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

// router/index.js（在 router 创建之后）
setUnauthorizedHandler(() => {
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})
```

→ request.js **不知道**router 的存在 = 没循环依赖 = 干净。

### 设计 6 — 业务 API 模块的写法

每个业务对象（auth / conversations / messages / settings）一个文件：

```js
// api/conversations.js
import request from './request'

export const conversationsApi = {
  list:   ()         => request.get('/api/conversations'),
  create: (title)    => request.post('/api/conversations', { title }),
  rename: (id, title)=> request.patch(`/api/conversations/${id}`, { title }),
  remove: (id)       => request.delete(`/api/conversations/${id}`)
}
```

**好处**：

- 接口 URL **只在 api/ 目录出现** → 后端改路径搜一处
- 组件里 `import { conversationsApi } from '@/api/conversations'` → 看名字就知道在调什么
- 业务方法名 **不暴露 HTTP 细节**（list 不需要写"GET"）

⚠️ **铁律**：组件里**绝对不能** `import axios from 'axios'`——一旦出现就有漏网之鱼，它没自动带 token 没自动处理 401，调试一脸懵。

### 设计 7 — 封装前 vs 封装后

```js
// ❌ 封装前 —— 13 行
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref([])

onMounted(async () => {
  try {
    const token = localStorage.getItem('chatbox_token')
    const res = await axios.get('http://localhost:3002/api/conversations', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 30000
    })
    users.value = res.data
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('chatbox_token')
      router.push('/login')
    }
  }
})
```

```js
// ✅ 封装后 —— 3 行
import { conversationsApi } from '@/api/conversations'

const users = ref([])
onMounted(async () => { users.value = await conversationsApi.list() })
```

**baseURL / token / 超时 / 401** 全部在 `request.js` 一处管。后端换域名 → 改一个 `.env`。

## 💻 第三步：实现

```
chatbox/web/
├── .env.development       # VITE_API_BASE=http://localhost:3002
├── .env.production        # VITE_API_BASE=（空）→ 同域
└── src/api/
    ├── request.js              # ⭐ 核心：实例 + 拦截器
    ├── auth.js                 # authApi
    ├── conversations.js        # conversationsApi
    ├── messages.js             # messagesApi
    └── settings.js             # settingsApi
```

### request.js 完整结构

```js
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 30000           // LLM 调用慢，给 30 秒
})

// 设计 3：请求拦截器
request.interceptors.request.use(config => {
  const token = localStorage.getItem('chatbox_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 设计 5：401 钩子
let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

// 设计 4：响应拦截器
request.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chatbox_token')
      onUnauthorized?.()
    }
    return Promise.reject(err)
  }
)

export default request
```

完整代码看右边 →

## ✅ 本节学完，你应该能：

- ❓ 把"前端发请求"拆成三层职责 → [设计 1](#)
- ❓ 解释为什么环境变量必须 `VITE_` 开头 → [设计 2](#)
- ❓ 描述请求拦截器和响应拦截器各干什么 → [设计 3 + 4](#)
- ❓ 解释为什么 401 处理用回调而不是直接 import router → [设计 5](#)
- ❓ 看到组件代码出现 `import axios` 知道这是错的 → [设计 6 铁律](#)

## 看右边 →

| 文件 | 看什么 |
|---|---|
| `web/.env.development` | 开发态 baseURL |
| `web/.env.production`  | 生产态留空 = 同域 |
| `src/api/request.js`   | **核心** —— 实例 + 拦截器 + 401 钩子 |
| `src/api/auth.js`      | authApi |
| `src/api/conversations.js` | conversationsApi |
| `src/api/messages.js`  | messagesApi |
| `src/api/settings.js`  | settingsApi |

下一节解决「**用户故事 #8 + #9 + #10：关浏览器还认得他、换电脑还认得他、退出登录**」——store + 路由守卫。
