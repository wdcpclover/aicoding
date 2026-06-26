// =============================================================
//  llm/index.js
//  按用户设置分发到 mock / openai / deepseek / claude
//  没配置 api_key → 强制回落到 mock
// =============================================================

const mock = require('./mock')
const openai = require('./openai')
const claude = require('./claude')

async function generate({ settings, messages }) {
  const provider = settings?.provider || 'mock'
  const apiKey   = settings?.api_key || ''

  // 没 key 一律走 mock（教学版即开即用）
  if (provider === 'mock' || !apiKey) {
    return await mock.chat({ messages })
  }

  const args = {
    provider,
    apiKey,
    apiBase:      settings.api_base || '',
    model:        settings.model || '',
    systemPrompt: settings.system_prompt || '',
    messages
  }

  if (provider === 'openai' || provider === 'deepseek') {
    return await openai.chat(args)
  }
  if (provider === 'claude') {
    return await claude.chat(args)
  }

  // 未知 provider → mock 兜底
  return await mock.chat({ messages })
}

module.exports = { generate }
