import { ref, computed, onMounted } from 'vue'
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
  setup() {
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })
    const idx = ref(0)
    const copied = ref(false)

    const files = computed(() => FILES)
    const current = computed(() => FILES[idx.value])
    const lineCount = computed(() => current.value.code.split('\n').length)

    function icon(f) { return iconFor(f) }

    async function copy() {
      try {
        await navigator.clipboard.writeText(current.value.code)
        copied.value = true
        setTimeout(() => copied.value = false, 1500)
      } catch {}
    }

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${CHATBOX_API}/api/health`, { timeout: 2000 })
        health.value = {
          status: 'ok',
          label: 'Chatbox 后端在线',
          hint: `${CHATBOX_API} — 配合右边代码对着读`
        }
      } catch {
        health.value = {
          status: 'down',
          label: 'Chatbox 后端没启动',
          hint: 'cd chatbox/server && npm start（不启动不影响读代码）'
        }
      }
    }

    onMounted(checkHealth)

    return { health, idx, files, current, lineCount, copied, icon, copy, checkHealth }
  }
}
