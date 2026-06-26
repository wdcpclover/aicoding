// =============================================================
//  routes/messages.js
//  GET  /api/conversations/:id/messages   —— 拿对话历史
//  POST /api/conversations/:id/messages   —— 发用户消息 + 触发 AI 回复
// =============================================================

const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/requireAuth')
const llm = require('../llm')

const router = express.Router({ mergeParams: true })
router.use(requireAuth)

function getOwnedConv(convId, userId) {
  return db.prepare(
    'SELECT id, user_id, title FROM conversations WHERE id = ? AND user_id = ?'
  ).get(convId, userId)
}

// GET /api/conversations/:id/messages
router.get('/', (req, res) => {
  const conv = getOwnedConv(Number(req.params.id), req.user.id)
  if (!conv) return res.status(404).json({ message: '对话不存在' })

  const rows = db.prepare(
    'SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC'
  ).all(conv.id)
  res.json(rows)
})

// POST /api/conversations/:id/messages   { content }
router.post('/', async (req, res) => {
  const conv = getOwnedConv(Number(req.params.id), req.user.id)
  if (!conv) return res.status(404).json({ message: '对话不存在' })

  const content = (req.body?.content || '').trim()
  if (!content) return res.status(400).json({ message: '消息内容不能为空' })

  const now = Date.now()
  const userMsgInfo = db.prepare(
    'INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(conv.id, 'user', content, now)
  const userMessage = {
    id: userMsgInfo.lastInsertRowid,
    role: 'user',
    content,
    created_at: now
  }

  // 如果对话还是默认标题，用首条用户消息前 20 字当标题
  if (conv.title === '新对话') {
    db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?')
      .run(content.slice(0, 20), now, conv.id)
  } else {
    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now, conv.id)
  }

  // 拼上下文喂给 LLM
  const history = db.prepare(
    'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC'
  ).all(conv.id)

  const settings = db.prepare(
    'SELECT provider, api_key, api_base, model, system_prompt FROM user_settings WHERE user_id = ?'
  ).get(req.user.id)

  let assistantContent
  try {
    assistantContent = await llm.generate({ settings, messages: history })
  } catch (e) {
    assistantContent = `⚠️ 调用 ${settings?.provider || 'mock'} 失败：${e.message}\n\n回到设置页检查 api_key / api_base 是否正确，或切回 mock 模式。`
  }

  const replyTime = Date.now()
  const aiInfo = db.prepare(
    'INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)'
  ).run(conv.id, 'assistant', assistantContent, replyTime)

  db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(replyTime, conv.id)

  res.status(201).json({
    user: userMessage,
    assistant: {
      id: aiInfo.lastInsertRowid,
      role: 'assistant',
      content: assistantContent,
      created_at: replyTime
    }
  })
})

module.exports = router
