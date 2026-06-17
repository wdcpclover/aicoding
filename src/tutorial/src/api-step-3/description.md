# 错误处理三态：404 / 500 / 网络断了 {#api-step-3}

> 上一节我们走通了 CRUD 五件套——**前提是后端一切正常**。真实业务里**错误才是常态**：用户填错参数、后端崩了、网线被踢了……每一种错的"形态"不一样，处理方式也不一样。
> 这一节专门拆"错"——`err.response` / `err.request` / 配置错误**三种形态**，配 `try / catch / finally` 模板，**之后所有 axios 调用都按这套写**。

## 〇、依然是同一个后端 {#prep}

```bash
cd server && npm start
```

server.js 内置了**两个"故意出错"开关**，方便演示：

- `?_error=1` → 后端故意返回 500
- `?_slow=1` → 后端故意延迟 2 秒（看 loading）

## 一、错误的"三种形态"（必背） {#three-shapes}

axios 抛出来的 `err` 一定属于这三种之一。这套判断**所有项目都用**：

```js
try {
  await axios.get('/api/users')
} catch (err) {

  if (err.response) {
    // —— 形态 ①：服务器有响应，但状态码是 4xx / 5xx ——
    //    意味着：请求送到了、后端处理了、只是说"不行"
    err.response.status      // 404 / 500 / ...
    err.response.data        // 后端返回的错误体（{ message: '...' }）
    err.response.headers
  }

  else if (err.request) {
    // —— 形态 ②：请求发出去了，但根本没收到响应 ——
    //    场景：后端没启动 / 网线断了 / CORS 被拦 / 域名解析失败 / 超时
    //    err.request 是底层的 XHR 对象
  }

  else {
    // —— 形态 ③：请求都没发出去，配置阶段就错了 ——
    //    场景：URL 写法错了、调用前自己 throw 了
    err.message              // 一句话错误描述
  }

  // 三种形态都有的字段
  err.config              // 本次请求的完整配置
  err.message             // 一句话错误描述
  axios.isAxiosError(err) // 类型守卫（TS 项目特别常用）
}
```

**判断顺序固定**：先看 `err.response`（最常见），再看 `err.request`（网络层），最后兜底（配置）。

## 二、形态 ① 详解：服务器返回了错误状态码 {#err-response}

> "请求是通了，是后端不让"。

最常见的几个状态码，到这一节为止你都应该能见招拆招：

| 状态码 | 含义 | 你该做什么 |
|---|---|---|
| `400 Bad Request` | 参数不对、字段缺失 | 检查你 `data` / `params` 里发了什么 |
| `401 Unauthorized` | 没登录 / token 过期 | 跳登录页 |
| `403 Forbidden` | 登录了但**没权限** | 提示"无权访问" |
| `404 Not Found`   | 路径错了 / 资源不存在 | 检查 URL，或显示"该用户不存在" |
| `409 Conflict`    | 状态冲突（如重复邮箱） | 把后端给的 message 告诉用户 |
| `500 Internal Server Error` | 后端崩了 | 提示用户"稍后重试"，**自己看后端日志** |
| `502 / 503 / 504` | 网关 / 服务不可用 / 超时 | 多半是部署问题，看运维 |

### 拿到后端给的错误消息

按约定，后端在错误响应里通常会塞一个 `message` 字段：

```js
catch (err) {
  if (err.response) {
    // server.js 里 res.status(404).json({ message: `用户 ${id} 不存在` })
    const msg = err.response.data?.message || `HTTP ${err.response.status}`
    alert(msg)
  }
}
```

> 右边的 **GET 不存在的用户** 按钮就是触发这个 —— 后端返回 `404 + { message: '用户 999 不存在' }`，我们把它显示在红色错误条里。

## 三、形态 ② 详解：网络层错误 {#err-request}

> "请求都没到后端就挂了"。

常见情况：

| 场景 | 现象 | 怎么判断 |
|---|---|---|
| **后端没启动** | `connect ECONNREFUSED 127.0.0.1:3001` | `err.request` 有，`err.response` 没 |
| **域名解析失败** | `getaddrinfo ENOTFOUND xxx.com` | 同上 |
| **CORS 被拦** | 浏览器 console：`...blocked by CORS policy` | 同上（浏览器把响应屏蔽掉了） |
| **超时** | `timeout of 5000ms exceeded` | `err.code === 'ECONNABORTED'` |

```js
try {
  await axios.get('/api/users', { timeout: 5000 })
} catch (err) {
  if (!err.response && err.code === 'ECONNABORTED') {
    alert('请求超时，请检查网络')
  } else if (!err.response) {
    alert('网络错误：后端没启动？')
  }
}
```

> 右边的 **假装后端没启动** 按钮把 baseURL 暂时切到一个**不存在的端口** `:39999` —— 你能看到 axios 直接进 `catch`，`err.response` 是 `undefined`，`err.request` 才有。

## 四、形态 ③ 详解：配置错误 {#err-config}

> "你的代码就没让请求发出去"。

最常见的场景：URL 拼错前面少了 `http://`、或在请求拦截器里自己 `throw`。

```js
try {
  await axios.get('not-a-real-url')   // URL 不合法
} catch (err) {
  // err.response 没有、err.request 也没有
  // err.message: "URL is required"  之类
}
```

实际项目里这种错相对少，**主要靠 `err.response` / `err.request` 区分前两种**，剩下的都进兜底。

## 五、`try / catch / finally` 三态模板（背下来） {#template}

任何一次 axios 调用都涉及 **加载中 / 出错 / 拿到数据** 三种 UI 状态。固定写法：

```js
import { ref } from 'vue'
import axios from 'axios'

const loading  = ref(false)
const error    = ref(null)
const users    = ref([])

async function loadUsers() {
  loading.value = true             // ① 进 loading
  error.value = null               //   清掉上次错误
  try {
    const res = await axios.get('http://localhost:3001/api/users')
    users.value = res.data         // ② 成功 → 数据进 ref
  } catch (err) {
    // ③ 用三态判断，拼一句人类可读的错误
    if (err.response) {
      error.value = err.response.data?.message
                 || `HTTP ${err.response.status}`
    } else if (err.request) {
      error.value = '网络错误：后端没启动或被防火墙拦了'
    } else {
      error.value = `请求配置错误：${err.message}`
    }
  } finally {
    loading.value = false          // ④ 不管成败都要停 loading
  }
}
```

```vue
<p v-if="loading">加载中...</p>
<p v-else-if="error" class="error">⚠️ {{ error }}</p>
<ul v-else>
  <li v-for="u in users" :key="u.id">{{ u.name }}</li>
</ul>
```

**重点**：

- `loading` 的关 / 开放在 `try` 外面的 **`finally`** ——成功失败都要关，否则页面永远转圈
- `error` 在 `try` 开头**先清空**——不然上次的错会一直显示
- 错误信息**优先用 `err.response.data.message`**——后端给的最准；没有再降级

下一节会把这套模板**收进响应拦截器**——之后业务代码再也不用自己写错误判断。

## 六、几个常踩的小坑 {#pitfalls}

### 坑 1：`catch` 漏写就被全局吞掉

```js
// ❌ 不写 catch，错误会被 Vue 默默吞掉，控制台只有红字看不到 UI 反馈
async function load() {
  const res = await axios.get('/api/users')
  users.value = res.data
}
```

虽然能跑，但**用户看不到任何反馈**——一直转圈或一片空白。永远写 `try/catch`。

### 坑 2：把 `axios.get` 直接 `.catch` 但忘了 `.finally`

```js
// ⚠️ loading 在出错时不会关
loading.value = true
axios.get('/api/users')
  .then(res => users.value = res.data)
  .catch(err => error.value = err.message)
loading.value = false   // ❌ 在 Promise 之外，立刻就跑完了
```

要么写在 `.finally(() => loading.value = false)` 里，要么用 `async/await + try/catch/finally`（更清晰，推荐）。

### 坑 3：4xx 默认进 `.catch`（跟 fetch 不一样）

fetch 只在网络层挂了才 reject，4xx / 5xx 都走 `.then`。**axios 不一样**——`status >= 400` 默认进 `.catch`，所以 `try/catch` 才能抓到。如果偶尔需要 4xx 不算错（比如 401 想自己处理而不弹 toast）：

```js
await axios.get('/api/auth/me', {
  validateStatus: s => s < 500   // 4xx 算"成功"，仍走 .then
})
```

## 看右边 →

右边三个按钮一一对应三种形态：

| 按钮 | 触发 | err 长什么样 |
|---|---|---|
| **404 找不到用户** | `GET /api/users/999` | `err.response.status === 404` + `err.response.data.message === '用户 999 不存在'` |
| **500 后端崩了** | `GET /api/users?_error=1`（后端故意 500） | `err.response.status === 500` |
| **网络断了** | baseURL 临时切到 `http://localhost:39999`（不存在的端口） | `err.response === undefined`，`err.request` 有值 |

下方的"错误展开"面板，对照「第一节」的三种形态表，能看到：

- `err.response?.status / .data / .headers`
- `err.request` 有还是没有
- `err.message`
- `err.code`（超时是 `ECONNABORTED`，连接被拒是 `ERR_NETWORK`）

**重点观察**：三种错产生的 `err` 结构**完全不同**——这就是为什么我们要按"三种形态"分支判断。

下一节把这套错误处理**收进响应拦截器**，组件层从此**不用再写 try/catch 里的 if-else**。
