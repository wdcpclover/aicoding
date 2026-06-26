// =============================================================
//  llm/claude.js
//  调用 Anthropic Claude messages API
// =============================================================

const DEFAULT_BASE  = 'https://api.anthropic.com/v1'
const DEFAULT_MODEL = 'claude-sonnet-4-5'

async function chat({ apiKey, apiBase, model, systemPrompt, messages }) {
  const base = (apiBase || DEFAULT_BASE).replace(/\/$/, '')
  const useModel = model || DEFAULT_MODEL

  const body = {
    model: useModel,
    max_tokens: 1024,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  }

  const resp = await fetch(`${base}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`claude ${resp.status}: ${text.slice(0, 200)}`)
  }
  const json = await resp.json()
  const part = json.content?.find(p => p.type === 'text')
  return part?.text || '(空回复)'
}

module.exports = { chat }
