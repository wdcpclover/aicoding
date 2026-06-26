// =============================================================
//  chatbox/server/server.js
//  教学用 Chatbox 后端 —— Express + SQLite + JWT + LLM 转发
//  端口：3002
// =============================================================

const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

require('./db')
const { PORT } = require('./config')

const { globalLimiter, authLimiter, messageLimiter } = require('./middleware/rateLimit')

const authRoutes          = require('./routes/auth')
const settingsRoutes      = require('./routes/settings')
const conversationsRoutes = require('./routes/conversations')
const messagesRoutes      = require('./routes/messages')

const app = express()

// 信任反向代理（部署到 nginx / vercel 后才能拿到真实 client IP）
app.set('trust proxy', 1)

// —— 安全头 + CORS + JSON 解析 + 日志 ——
app.use(helmet({
  contentSecurityPolicy: false      // 教学版禁用 CSP，否则 vite 静态资源会被拦
}))
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(globalLimiter)
app.use((req, _res, next) => {
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  console.log(`[${ts}] ${req.method} ${req.url}`)
  next()
})

// —— 健康检查 ——
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// —— 业务路由 ——
app.use('/api/auth',                            authLimiter, authRoutes)
app.use('/api/settings',                        settingsRoutes)
app.use('/api/conversations',                   conversationsRoutes)
app.use('/api/conversations/:id/messages',      messageLimiter, messagesRoutes)

// —— 生产环境：托管前端 vite build 出来的静态文件 ——
//   开发时用 vite dev server（:5173）；
//   生产时 `cd web && npm run build` 后把 dist/ 整目录交给这里 serve
const WEB_DIST = path.resolve(__dirname, '../web/dist')
if (fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(WEB_DIST, 'index.html'))
  })
}

// —— 404（API）兜底 ——
app.use((req, res) => {
  res.status(404).json({ message: `路由不存在: ${req.method} ${req.url}` })
})

// —— 错误兜底 ——
app.use((err, _req, res, _next) => {
  console.error('🔥 unhandled:', err)
  res.status(500).json({ message: err.message || '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`\n🤖 Chatbox 后端已启动: http://localhost:${PORT}`)
  console.log(`   健康检查:  http://localhost:${PORT}/api/health`)
  if (fs.existsSync(WEB_DIST)) {
    console.log(`   前端已托管: http://localhost:${PORT}/`)
  } else {
    console.log(`   前端开发:   cd web && npm run dev  (http://localhost:5173)`)
  }
  console.log()
})
