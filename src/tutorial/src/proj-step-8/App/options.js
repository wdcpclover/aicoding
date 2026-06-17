import axios from 'axios'
import { FILES } from './codes.js'

const CHATBOX_API = 'http://localhost:3002'

function iconFor(file) {
  if (file.lang === 'vue')  return '🟢'
  if (file.lang === 'json') return '📦'
  if (file.lang === 'html') return '📄'
  if (file.lang === 'css')  return '🎨'
  if (file.lang === 'env')  return '🌱'
  if (file.name.includes('routes/'))     return '🛣️'
  if (file.name.includes('middleware/')) return '🛡️'
  if (file.name.includes('llm/'))        return '🤖'
  if (file.name.includes('stores/'))     return '🗂️'
  if (file.name.includes('api/'))        return '📡'
  if (file.name.includes('router/'))     return '🗺️'
  return '📜'
}

export default {
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      idx: 0,
      copied: false,
      files: FILES
    }
  },
  computed: {
    current() { return this.files[this.idx] },
    lineCount() { return this.current.code.split('\n').length }
  },
  mounted() {
    this.checkHealth()
  },
  methods: {
    icon(f) { return iconFor(f) },
    async copy() {
      try {
        await navigator.clipboard.writeText(this.current.code)
        this.copied = true
        setTimeout(() => this.copied = false, 1500)
      } catch {}
    },
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${CHATBOX_API}/api/health`, { timeout: 2000 })
        this.health = {
          status: 'ok',
          label: 'Chatbox 后端在线',
          hint: `${CHATBOX_API} — 配合右边代码对着读`
        }
      } catch {
        this.health = {
          status: 'down',
          label: 'Chatbox 后端没启动',
          hint: 'cd chatbox/server && npm start（不启动不影响读代码）'
        }
      }
    }
  }
}
