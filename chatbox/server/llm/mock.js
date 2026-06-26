// =============================================================
//  llm/mock.js
//  纯本地"AI"——按关键词匹配几条回复
//  教学版默认 provider，确保学生没 API key 也能跑通
// =============================================================

const RULES = [
  { match: /^你好|^hi$|^hello/i,
    reply: '你好！我是教学版 chatbox 的内置 Mock 助手。\n\n要切换成真实大模型，去**设置**页填一个 OpenAI / DeepSeek / Claude 的 API key。' },

  { match: /(谁|你是).*(写|做|开发)/,
    reply: '我是给本教程演示用的 mock 回复器，**没有真模型**。在设置里配置 provider 和 api_key 之后，这里会替换成真正的 AI。' },

  { match: /api[\s_-]?key|怎么配|怎么用|设置/i,
    reply: '点左下角设置按钮 ⚙️，选 provider（openai / deepseek / claude），填上你的 api_key，回到聊天页就接真模型了。' },

  { match: /markdown|代码|code/i,
    reply: '消息支持 Markdown：\n\n```js\nconst greeting = "hello"\nconsole.log(greeting)\n```\n\n- 列表也 OK\n- *斜体* / **加粗** / `行内代码`' },

  { match: /笑话|讲个笑话|joke/i,
    reply: '程序员的浪漫：\n\n> 「Hello, World!」\n\n（讲完了。）' },

  { match: /.+/, // 兜底
    reply: '我是 mock 助手，只能识别几条预置规则。试试问我「你好」「markdown」「笑话」「api key 怎么配」。' }
]

async function chat({ messages /* [{role, content}] */ }) {
  const last = messages[messages.length - 1]
  const userText = last?.content || ''
  const rule = RULES.find(r => r.match.test(userText)) || RULES[RULES.length - 1]
  // 模拟一点"思考"延迟，让 loading 状态可见
  await new Promise(r => setTimeout(r, 350 + Math.random() * 400))
  return rule.reply
}

module.exports = { chat }
