# 【实战 6】考前速查：文件清单 + 后端 {#review-step-10}

> 最后一步：把整张卷子**摊开**。前 5 步演练的是前端，这一步补**后端**（`server/index.js` 15 分 + `config/database.js` 10 分），并给一份**默写级文件清单**。

## 一、整套项目目录 {#layout}

```
src/
├─ main.js                       应用入口（5 分）
├─ App.vue                       根组件 + <router-view>（5 分）
├─ store/activity.js             Pinia 状态（15 分）
├─ router/index.js               路由表 + 守卫（10 分）
├─ utils/request.js              axios 实例 + 拦截器
├─ views/
│   ├─ LoginView.vue             登录页（10 分）
│   ├─ ActivityView.vue          列表 + 搜索（10 分）
│   └─ ActivityDetailView.vue    详情 + 报名（10 分）
└─ components/
    └─ ActivityCard.vue          活动卡片（10 分）

server/index.js                  Express 后端（15 分）
config/database.js               MySQL 配置（10 分）
```

## 二、Express 后端骨架（server/index.js，15 分） {#express}

```js
const express = require('express')
const cors = require('cors')
const app = express()

// —— 三个中间件 ——
app.use(cors())            // 允许前端跨域调用
app.use(express.json())    // 解析 JSON 请求体到 req.body

// —— 简易 token 校验中间件（登录接口除外）——
app.use((req, res, next) => {
  if (req.path === '/api/login') return next()
  const token = req.headers['token']        // A 卷：Token；B 卷：auth-token
  if (token !== 'zzu123456') {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  next()
})

// —— 路由 ——
app.post('/api/login', (req, res) => {
  const { student_id, password } = req.body
  res.json({ code: 200, message: '登录成功',
    data: { token: 'zzu123456', user: { id: 1001, student_id, name: '张三' } } })
})

app.get('/api/activities', (req, res) => {
  const { keyword = '' } = req.query
  // 真实里这里查 MySQL：SELECT * FROM activities WHERE title LIKE ?
  res.json({ code: 200, message: '获取成功', data: /* 过滤后的列表 */ [] })
})

app.get('/api/activities/:id', (req, res) => {
  const id = Number(req.params.id)   // 动态段在 req.params
  res.json({ code: 200, data: /* 一条详情 */ {} })
})

app.post('/api/activities/:id/register', (req, res) => {
  res.json({ code: 200, message: '报名成功', data: { register_id: 305 } })
})

app.get('/api/my-activities', (req, res) => {
  res.json({ code: 200, data: [] })
})

app.listen(3000, () => console.log('🚀 后端启动 http://localhost:3000'))
```

> 📌 后端三件套必背：**`cors()`（跨域）+ `express.json()`（解析 body）+ 路由**。
> `req.body`（POST 数据）/ `req.query`（?keyword=）/ `req.params`（:id）三个取值口要分清。

## 三、MySQL 配置（config/database.js，10 分） {#mysql}

```js
const mysql = require('mysql2')

// 连接池（试卷给的就是连接池配置）
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'zzu_activities',
  connectionLimit: 10,
  waitForConnections: true
})

// 导出 promise 版，方便 await
module.exports = pool.promise()
```

后端里查库：

```js
const db = require('../config/database')
const [rows] = await db.query(
  'SELECT * FROM activities WHERE title LIKE ?',
  [`%${keyword}%`]   // 用 ? 占位防 SQL 注入
)
```

## 四、A 卷 / B 卷对照（换皮就行） {#a-vs-b}

| | A 卷（校园活动） | B 卷（二手交易） |
|---|---|---|
| 业务 | 活动 activity | 商品 product |
| Header | `Token` | `Auth-Token` |
| 固定 token | `zzu123456` | `zzu666888` |
| 登录字段 | `student_id` | `phone` |
| store | `store/activity.js` | `store/product.js` |
| 列表页 | `ActivityView` | `ProductsView` |
| 详情/特色 | 报名 register | 我的发布 publish |

> **两套卷子结构完全一样**，掌握 A 卷 = 掌握 B 卷。

## 五、考场时间分配建议 {#time}

1. 先搭**骨架**：main.js / App.vue / router / request.js（10 分钟，拿稳 25 分）
2. 再写 **store**（数据流核心，15 分）
3. 然后**页面**：Login → List → Detail（套前几步的模板）
4. 最后**后端** server + database（结构对就给分）

> 右边是**自查清单**：写完一个勾一个，实时看分数。考前过一遍，心里有底。
>
> 祝考试顺利 💪
