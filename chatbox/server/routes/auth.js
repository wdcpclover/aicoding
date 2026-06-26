// =============================================================
//  routes/auth.js
//  注册 / 登录 / 当前用户信息
// =============================================================

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// 工具：根据 user 生成 token
function sign(user) {
  return jwt.sign(
    { uid: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// POST /api/auth/register   { username, password }
router.post('/register', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ message: 'username 和 password 必填' })
  }
  if (username.length < 2 || password.length < 4) {
    return res.status(400).json({ message: '用户名 ≥ 2 位，密码 ≥ 4 位' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ message: '用户名已存在' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const now = Date.now()
  const info = db.prepare(
    'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)'
  ).run(username, hash, now)

  // 默认 mock 设置
  db.prepare(
    'INSERT INTO user_settings (user_id, provider, updated_at) VALUES (?, ?, ?)'
  ).run(info.lastInsertRowid, 'mock', now)

  const user = { id: info.lastInsertRowid, username }
  res.status(201).json({ token: sign(user), user })
})

// POST /api/auth/login   { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ message: 'username 和 password 必填' })
  }

  const row = db.prepare(
    'SELECT id, username, password_hash FROM users WHERE username = ?'
  ).get(username)
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ message: '用户名或密码错误' })
  }

  const user = { id: row.id, username: row.username }
  res.json({ token: sign(user), user })
})

// GET /api/auth/me   —— 拿当前登录用户（用来"刷新页面后恢复登录态"）
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
