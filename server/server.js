// =============================================================
//  教学用 Express 后端（mobile2026 / server）
//  端口：3001
//  路由：用户(users) 的增删改查 + 健康检查
//  说明：所有数据存内存数组，重启清零，专给课堂演示用
// =============================================================

const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// ---- 中间件 ------------------------------------------------------
// 1) CORS：教学环境直接全开，允许 vue3 课件 / REPL iframe 等所有来源
app.use(cors())
// 2) 解析 JSON 请求体
app.use(express.json())
// 3) 简单的访问日志（便于课堂演示请求经过了后端）
app.use((req, _res, next) => {
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  console.log(`[${ts}] ${req.method} ${req.url}`)
  next()
})

// ---- 内存"数据库" -----------------------------------------------
let nextId = 4
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 22 },
  { id: 2, name: '李四', email: 'lisi@example.com',     age: 25 },
  { id: 3, name: '王五', email: 'wangwu@example.com',   age: 28 }
]

// 模拟一点网络延迟，让学生看清 loading 状态
function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ---- 路由 --------------------------------------------------------

// 健康检查（验证后端是否启动）
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 列表：GET /api/users
//   ?_error=1   人为触发 500，演示错误拦截
//   ?_slow=1    人为加 2s 延迟，演示 loading
app.get('/api/users', async (req, res) => {
  if (req.query._error) {
    return res.status(500).json({ message: '服务器内部错误（人为触发，用于演示）' })
  }
  await delay(req.query._slow ? 2000 : 200)
  res.json(users)
})

// 详情：GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  await delay()
  const id = Number(req.params.id)
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: `用户 ${id} 不存在` })
  res.json(user)
})

// 新增：POST /api/users   body: { name, email, age }
app.post('/api/users', async (req, res) => {
  await delay()
  const { name, email, age } = req.body || {}
  if (!name || !email) {
    return res.status(400).json({ message: 'name 和 email 必填' })
  }
  const user = { id: nextId++, name, email, age: Number(age) || 0 }
  users.push(user)
  res.status(201).json(user)
})

// 更新：PUT /api/users/:id   body: { name?, email?, age? }
app.put('/api/users/:id', async (req, res) => {
  await delay()
  const id = Number(req.params.id)
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: `用户 ${id} 不存在` })
  Object.assign(user, req.body)
  res.json(user)
})

// 删除：DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
  await delay()
  const id = Number(req.params.id)
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ message: `用户 ${id} 不存在` })
  const [removed] = users.splice(idx, 1)
  res.json(removed)
})

// 404 兜底
app.use((req, res) => {
  res.status(404).json({ message: `路由不存在: ${req.method} ${req.url}` })
})

// ---- 启动 --------------------------------------------------------
app.listen(PORT, () => {
  console.log(`\n🚀 Express 后端已启动: http://localhost:${PORT}`)
  console.log(`   健康检查:  http://localhost:${PORT}/api/health`)
  console.log(`   用户列表:  http://localhost:${PORT}/api/users\n`)
})
