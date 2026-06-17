# 第一次握手：看清一次 HTTP 对话 {#api-step-1}

> 本篇 5 节**全部对着同一个后端**——仓库根目录的 `server/`（一个最简 Express），监听 `http://localhost:3001`。换后端、换公共 mock 这种事一次都不会发生。
> 这一节做一件最朴素的事：**点一下按钮 → 看清这次 HTTP 对话里前端发了什么、后端回了什么**。HTTP 协议、axios 是什么，全部围绕这个按钮展开。

## 〇、上课之前：把后端跑起来 {#prep}

打开一个**新终端**，跑：

```bash
cd server
npm install        # 第一次需要
npm start          # 后端常驻在 http://localhost:3001
```

控制台打印 `🚀 Express 后端已启动: http://localhost:3001` 就 OK。**这个终端不能关**——关了后端就停了。

> 右上角的 🟢/🔴 圆点是**实时健康检查**——绿了再继续。红的话回去看终端是不是没启动 / 端口被占。

## 一、我们要打的"自家后端"长什么样 {#what-backend}

这一节你只需要知道**两件事**——后端代码本身留到[第 5 节](#api-step-5)逐行讲。

```
后端地址：http://localhost:3001
能拿到什么：GET /api/users  →  [
                                  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 22 },
                                  { id: 2, name: '李四', ... },
                                  { id: 3, name: '王五', ... }
                               ]
```

打开浏览器，地址栏直接输 `http://localhost:3001/api/users` —— 你会看到上面这个 JSON 数组。**这就是后端**：监听一个端口，按 URL 返回数据。

> 浏览器地址栏发的是 GET 请求 —— 浏览器内置就能发 HTTP。我们之后用 axios 干的，**本质就是同一件事**，只是 axios 让 JS 代码也能发。

## 二、HTTP 协议：前后端在说什么话 {#http-protocol}

任何一次"前端 ↔ 后端"对话都长这样：

```
   浏览器                              服务器
 ┌────────┐    Request (请求报文)    ┌────────┐
 │ Vue    │ ───────────────────────▶ │Express │
 │ 前端   │                          │ 后端   │
 │        │ ◀───────────────────────  │        │
 └────────┘    Response (响应报文)   └────────┘
```

记牢几个核心事实：

| 事实 | 含义 |
|---|---|
| **客户端 / 服务器** | 永远前端**主动发**、后端**被动应**；服务器不会主动找浏览器 |
| **一问一答** | 一次请求 → 一次响应（出错也会有响应） |
| **无状态** | 服务器默认不记得你上次是谁，要识别身份靠 Cookie / Token |
| **基于 TCP** | HTTP 跑在 TCP 上保证传输可靠；HTTPS 多加一层 TLS 加密 |

### 请求 = 四段

```http
GET /api/users HTTP/1.1            ← ① 请求行：方法 + 路径 + 协议版本
Host: localhost:3001               ← ② 请求头（一行一对 Key: Value）
Accept: application/json
User-Agent: Mozilla/5.0 ...
                                   ← ③ 空行（标记 headers 结束）
                                   ← ④ 请求体（GET 通常没有）
```

### 响应 = 四段（跟请求对称）

```http
HTTP/1.1 200 OK                    ← ① 状态行：协议 + 状态码 + 状态文本
Content-Type: application/json     ← ② 响应头
Content-Length: 142
                                   ← ③ 空行
[{"id":1,"name":"张三",...},...]   ← ④ 响应体（真正的数据）
```

### 状态码：必须背熟的五类

| 区段 | 含义 | 常见 |
|---|---|---|
| **2xx** 成功      | 请求成功 | `200 OK` / `201 Created`（POST 成功后） |
| **3xx** 重定向    | 去另一个地方 | `301 Moved Permanently` / `304 Not Modified` |
| **4xx** **前端错**| 你（请求方）的问题 | `400` 参数不对 / `401` 没登录 / `403` 无权限 / `404` 路径错了 |
| **5xx** **后端错**| 服务器的问题 | `500 Internal Server Error` / `502` / `503` |

**口诀**：2xx 顺利 / 4xx 你（前端）错 / 5xx 后端错。调试时看到 4xx 检查你发的 URL/参数/token；看到 5xx 找后端同学。

> 这些字段在右边的演示里**全部能一一对照得上**——下一段就看。

## 三、axios 是什么 {#what-is-axios}

> [axios](https://axios-http.com/) = **基于 Promise 的 HTTP 客户端**。你给它一个 URL，它发请求、拿到响应、转成 JS 对象交给你。

最朴素的用法就一行：

```js
import axios from 'axios'

const res = await axios.get('http://localhost:3001/api/users')
console.log(res.data)   // [{ id:1, name:'张三', ... }, ...]
```

`res.data` 就是后端响应体（已经自动 JSON.parse 过的数组）。整篇前后端教程的核心也就是把这一行**用稳、用好、用工程化**。

### axios 不是黑盒：HTTP 协议的字段全在 `res` 上

|`res` 上的字段 | 对应 HTTP 协议里的哪段 |
|---|---|
| `res.config.method` / `res.config.url`     | 请求行（你发出去的方法 + URL） |
| `res.config.headers`                       | 请求头（axios 自动加的 + 你手动设的） |
| `res.config.data`                          | 请求体（GET 没有；POST/PUT 才有） |
| `res.status` / `res.statusText`            | 响应状态行（如 `200 OK`） |
| `res.headers`                              | 响应头 |
| **`res.data`**                             | **响应体**（业务关心的就是这个） |

> ⚠️ **最常踩的坑**：直接 `console.log(res)` 看到一坨对象，把整个 `res` 当数据。
> **数据永远在 `res.data` 里。**

## 看右边 →

右边只有**一个按钮**：`GET /api/users`。

- 点一下 → 一次真实的 HTTP 请求打到 `http://localhost:3001/api/users`
- 下方左栏列出**请求侧 4 个字段**（`config.method` / `config.url` / `config.headers` / `config.data`）
- 右栏列出**响应侧 4 个字段**（`status` / `statusText` / `headers` / `data`）
- 拿这两栏对照「第二节」的请求/响应四段、「第三节」的字段表——**你说的每个名词，右边都能指到一个具体的值**

打几次，把每个字段都看一眼。看清"一次握手"长什么样后，下一节我们把后端 5 个动作（GET 详情 / POST 新增 / PUT 改 / DELETE 删）一次性见全。
