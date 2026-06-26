// =============================================================
//  routes/settings.js
//  当前用户的 LLM 设置（provider / api_key / api_base / model / system_prompt）
//  ⚠️ api_key 是敏感信息，响应里**不直接返回完整 key**，只返回 hasKey 标记
// =============================================================

const express = require('express')
const db = require('../db')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()
router.use(requireAuth)

const PROVIDERS = ['mock', 'openai', 'deepseek', 'claude']

function readSettings(userId) {
  return db.prepare(
    'SELECT user_id, provider, api_key, api_base, model, system_prompt, updated_at FROM user_settings WHERE user_id = ?'
  ).get(userId)
}

function publicView(row) {
  if (!row) return null
  return {
    provider:      row.provider,
    api_base:      row.api_base || '',
    model:         row.model || '',
    system_prompt: row.system_prompt || '',
    has_key:       !!(row.api_key && row.api_key.length > 0),
    // 只回显 key 的尾 4 位用于"已配置"提示
    key_tail:      row.api_key ? row.api_key.slice(-4) : '',
    updated_at:    row.updated_at
  }
}

// GET /api/settings
router.get('/', (req, res) => {
  let row = readSettings(req.user.id)
  if (!row) {
    // 极端情况：迁移/外部插入用户后没设置
    db.prepare(
      'INSERT INTO user_settings (user_id, provider, updated_at) VALUES (?, ?, ?)'
    ).run(req.user.id, 'mock', Date.now())
    row = readSettings(req.user.id)
  }
  res.json(publicView(row))
})

// PUT /api/settings   { provider, api_key?, api_base?, model?, system_prompt? }
//   api_key 不传 → 保留原值；传空字符串 → 清空
router.put('/', (req, res) => {
  const { provider, api_key, api_base, model, system_prompt } = req.body || {}

  if (provider && !PROVIDERS.includes(provider)) {
    return res.status(400).json({ message: `provider 只能是 ${PROVIDERS.join(' / ')}` })
  }

  const prev = readSettings(req.user.id) || {}
  const merged = {
    provider:      provider ?? prev.provider ?? 'mock',
    api_key:       api_key === undefined ? prev.api_key : api_key,
    api_base:      api_base ?? prev.api_base ?? '',
    model:         model ?? prev.model ?? '',
    system_prompt: system_prompt ?? prev.system_prompt ?? '',
    updated_at:    Date.now()
  }

  db.prepare(`
    INSERT INTO user_settings (user_id, provider, api_key, api_base, model, system_prompt, updated_at)
    VALUES (@user_id, @provider, @api_key, @api_base, @model, @system_prompt, @updated_at)
    ON CONFLICT(user_id) DO UPDATE SET
      provider      = excluded.provider,
      api_key       = excluded.api_key,
      api_base      = excluded.api_base,
      model         = excluded.model,
      system_prompt = excluded.system_prompt,
      updated_at    = excluded.updated_at
  `).run({ user_id: req.user.id, ...merged })

  res.json(publicView(readSettings(req.user.id)))
})

module.exports = router
