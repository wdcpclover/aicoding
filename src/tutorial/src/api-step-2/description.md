# RESTful 五件套：用 axios 完整 CRUD {#api-step-2}

> 上一节我们看清了"一次"HTTP 对话——一个 GET 拉列表。但真实的业务有**五种动作**：列表、详情、新增、修改、删除。这一节把它们一次性见全，**全部对着同一个自家 Express 后端**，下面所有的 axios 语法（5 种写法 / params vs data / 响应对象字段）都围绕这五个按钮展开。

## 〇、依然是同一个后端 {#prep}

```bash
cd server && npm start    # http://localhost:3001
```

右上角圆点是绿的再继续。

## 一、RESTful 是什么 {#what-restful}

RESTful 是一种**约定**：用 **HTTP 方法 + URL 路径**来表达"对哪个资源做什么操作"。

| 想做的事 | HTTP 方法 | URL | 后端代码 |
|---|---|---|---|
| 拿用户**列表** | `GET`    | `/api/users`       | `app.get('/api/users', ...)` |
| 拿某个用户**详情** | `GET`    | `/api/users/:id`   | `app.get('/api/users/:id', ...)` |
| **新增**一个用户 | `POST`   | `/api/users`       | `app.post('/api/users', ...)` |
| **修改**某个用户 | `PUT`    | `/api/users/:id`   | `app.put('/api/users/:id', ...)` |
| **删除**某个用户 | `DELETE` | `/api/users/:id`   | `app.delete('/api/users/:id', ...)` |

记住三个套路：

- **列表**：方法+集合路径（`GET /api/users`）
- **单个**：方法+集合路径+`:id`（`GET/PUT/DELETE /api/users/123`）
- **新增**：`POST` 到集合，**带 body**

几乎所有现代后端都长这样——React / Vue / iOS / Android 各路前端调的 API 90% 都是这套。

## 二、五件套用 axios 怎么写 {#five-actions}

```js
import axios from 'axios'
const BASE = 'http://localhost:3001'

// 1) 列表
const list = await axios.get(`${BASE}/api/users`)
// list.data → [{ id:1, name:'张三', ... }, ...]

// 2) 详情
const one = await axios.get(`${BASE}/api/users/1`)
// one.data → { id:1, name:'张三', email:'...', age:22 }

// 3) 新增 —— ⚠️ 第二个参数是 body 数据
const created = await axios.post(`${BASE}/api/users`, {
  name: '赵六', email: 'zhao@example.com', age: 30
})
// created.data → { id:4, name:'赵六', ... }   ← 后端给的新 id

// 4) 修改 —— 同样第二个参数是 body
await axios.put(`${BASE}/api/users/1`, { age: 99 })

// 5) 删除 —— 没有 body
await axios.delete(`${BASE}/api/users/1`)
```

**规律**：

| 方法 | 第二个参数 |
|---|---|
| `axios.get(url, config)`    | 配置对象（如 `{ params: {...} }`） |
| `axios.post(url, data, config)`  | **请求体数据**（自动 JSON 序列化）|
| `axios.put(url, data, config)`   | **请求体数据** |
| `axios.delete(url, config)` | 配置对象 |

GET 跟 DELETE 没 body，所以第二个参数都是 config；POST / PUT / PATCH 有 body，所以第二个参数是 data。**这个差异是新手最容易混的**。

## 三、params vs data：最容易混的两个字段 {#params-vs-data}

两者都是"传数据给后端"，但**位置完全不同**：

| 字段 | 放在哪 | 长什么样 | 哪些方法用 |
|---|---|---|---|
| `params` | URL 的**查询字符串** | `?page=1&size=10` | 所有方法 |
| `data`   | HTTP **请求体** | 真正的 JSON / form / 文件 | POST / PUT / PATCH |

```js
// ✅ 查询参数 → params
await axios.get('/api/users', { params: { page: 1, size: 10 } })
// 实际请求：GET /api/users?page=1&size=10

// ✅ 请求体 → 用 post 的第二个参数（等价于 { data: {...} }）
await axios.post('/api/users', { name: '张三' })
// 实际请求：POST /api/users   body: {"name":"张三"}

// ❌ 把 params 用错成 data：URL 上没参数
await axios.get('/api/users', { data: { page: 1 } })   // GET 没有 body 还自己加

// ✅ 同一个请求既要 params 又要 data：第三个参数放 config
await axios.post('/api/users', { name: '张三' }, { params: { source: 'web' } })
// 实际请求：POST /api/users?source=web   body: {"name":"张三"}
```

**口诀**：**`params` 拼 URL，`data` 放 body**。

## 四、调用 axios 的 5 种写法 {#five-styles}

下面 5 种**完全等价**，全是 GET 列表：

```js
// 1) 最简形式：用快捷方法
const r1 = await axios.get(`${BASE}/api/users`)

// 2) 快捷方法 + 配置对象（带 params / headers / timeout 时常用）
const r2 = await axios.get(`${BASE}/api/users`, {
  params: { page: 1 },
  timeout: 5000
})

// 3) axios.request(config)
const r3 = await axios.request({
  method: 'get',
  url: `${BASE}/api/users`
})

// 4) 直接把 axios 当函数（跟 request 一模一样）
const r4 = await axios({
  method: 'get',
  url: `${BASE}/api/users`
})

// 5) 链式：因为返回 Promise，不用 await 也行
axios.get(`${BASE}/api/users`)
  .then(res => console.log(res.data))
  .catch(err => console.error(err))
```

**怎么选？**

- 业务代码 95% 用 **方式 1 / 2** —— 简洁
- 写**封装层、拦截器内部**常用 **方式 3 / 4** —— 一个 config 对象方便加工
- 老代码 + Vue 2 项目可能见到方式 5

## 五、响应对象 `res` 上有什么 {#response-shape}

```js
const res = await axios.get('/api/users')
```

`res` 一定有这 6 个字段：

| 字段 | 含义 |
|---|---|
| **`res.data`**       | **真正的响应体**（已自动 JSON.parse）—— 99% 业务只关心这个 |
| `res.status`         | HTTP 状态码：200 / 404 / 500 ... |
| `res.statusText`     | "OK" / "Not Found" ... |
| `res.headers`        | 响应头对象 |
| `res.config`         | **本次请求的完整配置**（method/url/params/data/headers...）—— 调试 / 拦截器常用 |
| `res.request`        | 底层 XHR（几乎用不上） |

> ⚠️ 跟[上一节](#api-step-1)的「字段对照表」对应起来：`res.config.*` 是请求侧，`res.status / .headers / .data` 是响应侧。
> 右边的演示里你会**每点一次按钮就刷出完整 `res`**——拿真实数据对着这张表过一遍。

## 六、`try / catch / finally` 三态模板 {#three-states}

任何一次 axios 调用都涉及三种 UI 状态：**加载中 / 出错 / 拿到数据**。固定写法：

```js
import { ref } from 'vue'
import axios from 'axios'

const loading = ref(false)
const error = ref(null)
const users = ref([])

async function loadUsers() {
  loading.value = true       // 1. 开转圈
  error.value = null
  try {
    const res = await axios.get(`${BASE}/api/users`)
    users.value = res.data   // 2. 成功 → 把数据放进 ref
  } catch (e) {
    error.value = e.message  // 3. 失败 → 显示错误
  } finally {
    loading.value = false    // 4. 不管成败，都要停转圈
  }
}
```

模板里根据三态切换：

```vue
<p v-if="loading">加载中...</p>
<p v-else-if="error" style="color:red">出错了：{{ error }}</p>
<ul v-else>
  <li v-for="u in users" :key="u.id">{{ u.name }}</li>
</ul>
```

**之后所有 axios 调用都长这样**——先记牢这个模板，[下一节](#api-step-3)我们会把错误的三种形态拆开讲。

## 看右边 →

右边是一个**真实可用的用户管理 CRUD**：

| 区块 | 对应的 axios 调用 |
|---|---|
| **🔄 刷新列表** | `axios.get('/api/users')` —— RESTful 第 ① 个 |
| **👁 点列表里某个用户** | `axios.get('/api/users/:id')` —— 第 ② 个，看详情 |
| **➕ 表单 + 新增** | `axios.post('/api/users', formData)` —— 第 ③ 个，演示 **data** |
| **🎂 年龄 +1** | `axios.put('/api/users/:id', { age })` —— 第 ④ 个 |
| **🗑 删除** | `axios.delete('/api/users/:id')` —— 第 ⑤ 个 |
| **📋 完整 `res` 折叠区** | 每点一次按钮都会刷新 —— 对照「第五、响应对象」字段表 |

试一下：

1. 点 **🔄 刷新列表** → 下面列出 3 个用户
2. 填表单 → **➕ 新增** → 列表多出第 4 个 → **`res.data` 里能看到后端给的真 `id: 4`**
3. 点某个用户的 **🎂 年龄 +1** → 列表里他的年龄变了 → **看 `res.config.data` 里你发的 body**
4. 点某个用户 → **👁 查看详情** → 右边出现单个用户的详情
5. 点 **🗑** → 列表里那行消失了

> 💡 后端是有真实状态的——你新增的用户在内存里**真的存进去了**。刷新前端页面后还在；**Ctrl+C 重启后端**才会恢复初始 3 条。
> 💡 还没出错？下一节专门讲错误处理——404 / 500 / 网络断了，三种错的判断方式不一样。
