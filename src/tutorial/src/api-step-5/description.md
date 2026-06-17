# Pinia 收纳 + Express 完整闭环 {#api-step-5}

> 上一节我们封装出 `request → userApi → 组件`，组件里看不到 axios 了。但**数据**还在组件自己手里——多个组件想看同一份用户列表，要么各调各的，要么把数据当 props 一层层透传。
> 这一节再往上一层：**把"数据 + 请求 + loading"全部收进 Pinia store**。同时把后端的 `server.js` 翻出来一行行讲——你将看到**完整的前后端闭环**。

## 〇、依然是同一个后端 {#prep}

```bash
cd server && npm start
```

> 👉 这一节[需要 Pinia 基础](#pinia-step-1)。没学过 Pinia 的话先看「Pinia 篇」——本节不会重复讲 `defineStore` / state / actions / storeToRefs 的语法。

## 一、为什么再封装一层"store" {#why-store}

只用第 4 节的 `userApi` 时，两个组件要展示同一个用户列表会变成这样：

```js
// 组件 A
const users = ref([])
onMounted(async () => { users.value = await userApi.list() })

// 组件 B —— 一字不差，又发了一次相同请求
const users = ref([])
onMounted(async () => { users.value = await userApi.list() })
```

问题：

| 问题 | 表现 |
|---|---|
| **重复请求** | 两个组件挂载 → 同一接口被打两次 |
| **状态不一致** | A 新增了一条，B 不知道 |
| **loading 各管各** | 顶部进度条得每个组件自己维护一份 |
| **缓存做不到** | 路由切走再回来又是从头加载 |

把"数据 + 操作"收进 **Pinia store**：

```js
// 任何组件
const userStore = useUserStore()
const { list, loading } = storeToRefs(userStore)
onMounted(userStore.fetchList)
```

A、B 组件**共用同一份 list 和 loading**——单一数据源，缓存自动有，A 改 B 立刻看到。

## 二、四层架构（含 Express） {#layers}

```
┌──────────────────────────────────────────────────┐
│  组件层（App.vue）                                │
│  const { list, loading } = useUserStore()         │
└────────────────┬─────────────────────────────────┘
                 │ 调 action / 读 state
┌────────────────▼─────────────────────────────────┐
│  状态层（stores/user.js）—— 本节                  │
│  state:  list / loading / current                 │
│  actions: fetchList / fetchOne / addOne / ...     │
│            └─ 内部调 userApi                       │
└────────────────┬─────────────────────────────────┘
                 │ 调业务 API
┌────────────────▼─────────────────────────────────┐
│  API 层（api/user.js）—— 第 4 节                  │
│  userApi.list / get / create / update / remove    │
│            └─ 内部调 request                       │
└────────────────┬─────────────────────────────────┘
                 │ HTTP
┌────────────────▼─────────────────────────────────┐
│  传输层（utils/request.js）—— 第 4 节             │
│  axios.create() + 拦截器（token / 剥 .data / 错处理）│
└────────────────┬─────────────────────────────────┘
                 │ HTTP
┌────────────────▼─────────────────────────────────┐
│  后端（server/server.js）—— 本节第 6 节           │
│  Express + cors + json + 5 个 RESTful 路由         │
└──────────────────────────────────────────────────┘
```

**每一层只关心自己的事**：

- **组件** = UI + 交互
- **store** = 数据 + 业务流程
- **api** = 接口路径
- **request** = 网络配置
- **后端** = 资源真正存放的地方

## 三、设计一个 user store {#design-store}

最常见的"列表 + 详情 + 增删改"五件套：

<div class="composition-api">

```js
// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', () => {
  // —— state ——
  const list = ref([])
  const current = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // —— getters ——
  const total = computed(() => list.value.length)

  // —— actions ——（内部直接调 userApi）
  async function fetchList() {
    loading.value = true
    error.value = null
    try {
      list.value = await userApi.list()      // 拦截器剥过 .data，这里直接是数组
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    current.value = await userApi.get(id)
  }

  async function addOne(form) {
    const created = await userApi.create(form)
    list.value.push(created)              // ⭐ 后端成功了才更新本地
    return created
  }

  async function updateOne(id, patch) {
    const updated = await userApi.update(id, patch)
    const idx = list.value.findIndex(u => u.id === id)
    if (idx > -1) list.value[idx] = updated
  }

  async function removeOne(id) {
    await userApi.remove(id)
    list.value = list.value.filter(u => u.id !== id)
    if (current.value?.id === id) current.value = null
  }

  return { list, current, loading, error, total,
           fetchList, fetchOne, addOne, updateOne, removeOne }
})
```

</div>

<div class="options-api">

```js
// src/stores/user.js
import { defineStore } from 'pinia'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    list: [], current: null, loading: false, error: null
  }),
  getters: {
    total: state => state.list.length
  },
  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try { this.list = await userApi.list() }
      catch (e) { this.error = e.message }
      finally { this.loading = false }
    },
    async fetchOne(id) { this.current = await userApi.get(id) },
    async addOne(form) {
      const created = await userApi.create(form)
      this.list.push(created)
      return created
    },
    async updateOne(id, patch) {
      const updated = await userApi.update(id, patch)
      const idx = this.list.findIndex(u => u.id === id)
      if (idx > -1) this.list[idx] = updated
    },
    async removeOne(id) {
      await userApi.remove(id)
      this.list = this.list.filter(u => u.id !== id)
      if (this.current?.id === id) this.current = null
    }
  }
})
```

</div>

## 四、组件里怎么用（三行起步） {#component-usage}

<div class="composition-api">

```vue
<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// state / getters 用 storeToRefs（保留响应式）
const { list, current, loading, total } = storeToRefs(userStore)

// actions 直接解构（普通函数）
const { fetchList, fetchOne, removeOne } = userStore

onMounted(fetchList)
</script>
```

</div>

<div class="options-api">

```vue
<script>
import { mapState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'

export default {
  computed: {
    ...mapState(useUserStore, ['list', 'current', 'loading', 'total'])
  },
  methods: {
    ...mapActions(useUserStore, ['fetchList', 'fetchOne', 'removeOne'])
  },
  mounted() { this.fetchList() }
}
</script>
```

</div>

> ⚠️ `storeToRefs` 这一步**不能省**——`const { list } = userStore` 会丢响应性。**state / getters 用 storeToRefs，actions 普通解构**。

## 五、共享状态的威力 {#shared-state}

把 `loading` 放在 store 里——**任何引用 store 的组件都能拿到同一个 loading**。

```vue
<!-- NavBar 顶部进度条 -->
<script setup>
const { loading } = storeToRefs(useUserStore())
</script>
<template><ProgressBar v-show="loading" /></template>

<!-- 列表组件 UserList -->
<script setup>
const { list, loading } = storeToRefs(useUserStore())
</script>

<!-- 详情组件 UserDetail -->
<script setup>
const { current, loading } = storeToRefs(useUserStore())
</script>
```

在 `UserList` 里点"刷新"时，**顶部进度条、详情面板的"加载中..."同时出现**——它们读的是同一个 `loading.value`。**这就是 store 的核心价值：单一数据源**。

> 右边的 REPL 就是这样的双栏 demo：左栏列表 + 右栏详情，两栏共享 `loading`、共享 `list`。

## 六、Express 后端到底在干什么 {#express-explained}

之前 4 节我们一直把 `localhost:3001` 当黑盒——这一节把它打开。`server/server.js` 一共 100 行不到，分四块：

### 1) 引入 + 建 app

```js
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001
```

- `express()` 返回一个 **app 对象**，整个后端的所有路由都注册在它上面
- 选 3001 是为了避开前端 vitepress 的 3000

### 2) 三个中间件

```js
app.use(cors())                           // 1) 跨域
app.use(express.json())                   // 2) 解析 JSON 请求体
app.use((req, _res, next) => {            // 3) 简单日志
  console.log(`${req.method} ${req.url}`)
  next()
})
```

`app.use(...)` 注册的函数叫**中间件**，每个请求**按顺序经过这几个中间件**，最后才走到业务路由：

| 中间件 | 作用 |
|---|---|
| `cors()` | 给响应加 `Access-Control-Allow-Origin: *`，告诉浏览器"允许跨域调用我" |
| `express.json()` | 自动把请求体 JSON 字符串解析成 `req.body` 对象（否则你拿到 `undefined`） |
| 自定义日志 | 打印每个请求；`next()` 表示"放行交给下一个中间件" |

#### CORS 为什么必须开

浏览器有个安全规则：**前端页面只能向同源（同协议+同域名+同端口）的接口发请求**。

- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001`

端口都不一样，**就是不同源**，浏览器默认会报：

```
Access to XMLHttpRequest at 'http://localhost:3001/api/users' from origin
'http://localhost:3000' has been blocked by CORS policy: ...
```

**关键事实**：CORS 是**浏览器的安全策略**——不是 axios 或 fetch 的限制。axios 把请求正常发了出去、**后端也正常处理了**，但浏览器**主动把响应屏蔽**，除非后端通过 `Access-Control-Allow-Origin` 这个响应头明确说"我允许你跨域"。

`app.use(cors())` 一行就是干这件事。

### 3) 内存"数据库" + 五个路由

```js
let nextId = 4
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 22 },
  { id: 2, name: '李四', ... },
  { id: 3, name: '王五', ... }
]

// 列表
app.get('/api/users', (req, res) => {
  res.json(users)
})

// 详情
app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)        // :id 动态段在 req.params 里
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: `用户 ${id} 不存在` })
  res.json(user)
})

// 新增
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body   // express.json() 把请求体放进 req.body
  if (!name || !email) {
    return res.status(400).json({ message: 'name 和 email 必填' })
  }
  const user = { id: nextId++, name, email, age: Number(age) || 0 }
  users.push(user)
  res.status(201).json(user)              // 201 Created
})

// 更新 & 删除略（同样的 :id 套路）
```

数据存在数组里，**重启后端就清零**——纯教学。真实项目这里换 MySQL / PostgreSQL / MongoDB。

### 4) 启动监听

```js
app.listen(PORT, () => {
  console.log(`🚀 Express 后端已启动: http://localhost:${PORT}`)
})
```

`app.listen` 是**异步常驻**——打开端口、**不停接收**客户端连接，直到 Ctrl+C 停掉。

## 七、一次点击的完整链路 {#full-trace}

右边点 **"🔄 刷新列表"**，背后发生了：

```
[组件 App.vue]
  └─ userStore.fetchList()                     ← 第 5 节
       └─ userApi.list()                       ← 第 4 节
            └─ request.get('/api/users')       ← 第 4 节
                 └─ baseURL 拼出
                    http://localhost:3001/api/users
                      └─ 请求拦截器（加 token / X-Request-Id / 打日志）
                           └─ 浏览器发出真实 HTTP 请求
                                └─ ┌───────────────────┐
                                   │ Express @ :3001   │   ← 本节
                                   │ ├─ cors 中间件     │
                                   │ ├─ json 中间件     │
                                   │ ├─ 日志中间件      │
                                   │ └─ GET /api/users  │
                                   │     return users[] │
                                   └───────────────────┘
                                ← HTTP 200 + JSON 数组
                           ← 响应拦截器（剥 .data + 统一错处理）
                      ← await 拿到数组
                 ← store.list.value = [...]    ← Pinia 更新
            ← 所有引用 store 的组件**自动重渲染**
```

**整条链路的每一步**在前 4 节都学过——这一节只是**全部串起来**。

## 看右边 →

右边是用 **Pinia store + 自家 Express 后端**的完整 CRUD：

| 区块 | 调用链 |
|---|---|
| 左栏 **🔄 刷新** | `fetchList` → `userApi.list` → `GET /api/users` |
| 左栏 **➕ 新增** | `addOne` → `userApi.create` → `POST /api/users` |
| 左栏 **点某行 / 详情** | `fetchOne` → `userApi.get` → `GET /api/users/:id` |
| 左栏 **🎂 / 🗑** | `updateOne / removeOne` → `PUT / DELETE` |
| 顶部 **共享 loading 条** | 左右两栏共用 `storeToRefs(userStore).loading` |

REPL 文件清单（点上方文件名切换）：

- **`request.js`** —— 拦截器（同第 4 节）
- **`userApi.js`** —— 业务 API（同第 4 节，多了 `get(id)`）
- **`userStoreSetup.js`** —— 组合式写法的 store ⟵ 默认使用
- **`userStoreOptions.js`** —— 选项式写法的 store ⟵ 切到选项式模式时使用
- **`App.vue`** —— 组件层：**只 import store，看不到 axios 也看不到 userApi**

> 切换右上角"组合式 / 选项式"，左侧讲解 + 右侧 store 文件**双向同步切换**——同一个数据流，两种写法。

## 八、回头看：前后端篇你学到了什么 {#recap}

| 节 | 关键收获 |
|---|---|
| 1 | HTTP 协议：请求/响应四段、状态码五类、headers/body、用 axios 看清字段 |
| 2 | RESTful 五件套：GET/POST/PUT/DELETE + params vs data + try/catch/finally 三态 |
| 3 | 错误处理三态：`err.response` / `err.request` / `err.message` 的分支判断 |
| 4 | 工程化封装：`axios.create()` + 拦截器 + 业务 API 模块 = 组件层看不到 axios |
| 5 | Pinia 收纳 + Express 完整闭环：单一数据源 + 整条链路看明白 |

这套架构 **= 任何一个用 Vue 的真实项目里前端请求层长什么样**。换成 Vue Router、换成 TS、换成大型项目，**思路完全一致**——只是文件多一些、API 多几个。
