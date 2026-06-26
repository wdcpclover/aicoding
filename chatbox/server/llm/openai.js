// =============================================================
//  llm/openai.js
//  调用 OpenAI 兼容协议（OpenAI / DeepSeek / 任何走 OpenAI 协议的网关）
//  使用 Node 18+ 内置 fetch，不引第三方依赖
// =============================================================

const DEFAULTS = {
  openai:   { base: 'https://api.openai.com/v1',     model: 'gpt-4o-mini' },
  deepseek: { base: 'https://api.deepseek.com/v1',   model: 'deepseek-chat' }
}

async function chat({ provider, apiKey, apiBase, model, systemPrompt, messages }) {
  const def = DEFAULTS[provider] || DEFAULTS.openai
  const base = (apiBase || def.base).replace(/\/$/, '')
  const useModel = model || def.model

  const body = {
    model: useModel,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ]
  }

  const resp = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`${provider} ${resp.status}: ${text.slice(0, 200)}`)
  }
  const json = await resp.json()
  return json.choices?.[0]?.message?.content || '(空回复)'
}

module.exports = { chat }
