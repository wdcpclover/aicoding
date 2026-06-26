// =============================================================
//  routes/conversations.js
//  对话 CRUD（仅限当前用户的对话）
// =============================================================

const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()
router.use(requireAuth)

function getOwnedConv(convId, userId) {
  return db.prepare(
    'SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ?'
  ).get(convId, userId)
}

// GET /api/conversations  —— 列表（按 updated_at 倒序）
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT
      c.id, c.title, c.created_at, c.updated_at,
      (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count,
      (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY id DESC LIMIT 1) AS last_message
    FROM conversations c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC
  `).all(req.user.id)
  res.json(rows)
})

// POST /api/conversations   { title? }
router.post('/', (req, res) => {
  const title = (req.body?.title || '新对话').slice(0, 60)
  const now = Date.now()
  const info = db.prepare(
    'INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, title, now, now)
  res.status(201).json({
    id: info.lastInsertRowid,
    title,
    created_at: now,
    updated_at: now,
    message_count: 0,
    last_message: null
  })
})

// PATCH /api/conversations/:id  { title }
router.patch('/:id', (req, res) => {
  const conv = getOwnedConv(Number(req.params.id), req.user.id)
  if (!conv) return res.status(404).json({ message: '对话不存在' })

  const title = (req.body?.title || '').trim().slice(0, 60)
  if (!title) return res.status(400).json({ message: 'title 不能为空' })

  const now = Date.now()
  db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?')
    .run(title, now, conv.id)

  res.json({ ...conv, title, updated_at: now })
})

// DELETE /api/conversations/:id
router.delete('/:id', (req, res) => {
  const conv = getOwnedConv(Number(req.params.id), req.user.id)
  if (!conv) return res.status(404).json({ message: '对话不存在' })

  db.prepare('DELETE FROM conversations WHERE id = ?').run(conv.id)
  res.json({ id: conv.id })
})

module.exports = router
