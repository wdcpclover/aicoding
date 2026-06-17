# 【知识 4】Express 后端复习 {#review-step-4}

> 前端讲完了，补后端。考题要求 **`server/index.js`（15 分）+ `config/database.js`（10 分）**。Express 的活就三件：**收请求 → 取数据 → 回 JSON**。

## 一、一个最小后端 {#minimal}

```js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())           // ① 允许前端跨域调用（不加前端报 CORS 错）
app.use(express.json())   // ② 把 JSON 请求体解析进 req.body

app.get('/api/products', (req, res) => {
  res.json({ code: 200, data: [], message: 'ok' })  // ③ 回 JSON
})

app.listen(3000, () => console.log('后端启动 :3000'))
```

> 📌 **三件套背牢**：`cors()` + `express.json()` + 路由。少了 `cors()` 前端调不通；少了 `express.json()` 拿不到 `req.body`。

## 二、从请求里取数据的三个口 {#req}

| 取值口 | 来自哪 | 例子 |
|---|---|---|
| `req.params` | 路径里的 `:id` | `/products/:id` → `req.params.id` |
| `req.query` | URL 的 `?` 后面 | `/products?keyword=book` → `req.query.keyword` |
| `req.body` | POST/PUT 的请求体 | `{ phone, password }` → `req.body.phone` |

> 右边的模拟器就是让你**亲手看清**这三个口分别装什么。

## 三、登录校验中间件 {#middleware}

考题要求「所有 API 请求 Header 带 token」，后端这样验：

```js
app.use((req, res, next) => {
  if (req.path === '/api/login') return next()   // 登录接口放行
  const token = req.headers['token']             // 取请求头（小写）
  if (token !== 'zzu666888') {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  next()  // 放行到下一个处理函数
})
```

## 四、连 MySQL（config/database.js，10 分） {#mysql}

```js
const mysql = require('mysql2')
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: '123456',
  database: 'campus', connectionLimit: 10, waitForConnections: true
})
module.exports = pool.promise()
```

查库（注意用 `?` 占位防注入）：

```js
const db = require('./config/database')
const [rows] = await db.query(
  'SELECT * FROM products WHERE title LIKE ?', [`%${keyword}%`]
)
res.json({ code: 200, data: rows })
```

## 看右边 → {#try}

右边是**路由匹配模拟器**：

- 切换方法（GET/POST…）、改路径、加 `?query`、填 body
- 实时看：命中哪条路由、`req.params` / `req.query` / `req.body` 各是什么
- 试试 `GET /api/products/2?keyword=book`，再试个不存在的路径看 404

➡️ 知识点复习完毕！**下一节起进入「考试实战」**：用真题把这四块串成完整项目。
