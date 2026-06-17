import { ref, onMounted } from 'vue'
import axios from 'axios'

// 自家 Express 后端，监听在 3001
// 启动方式：cd server && npm start
const BASE = 'http://localhost:3001'

function pretty(v) {
  if (v == null) return ''
  if (typeof v === 'string') {
    try { return JSON.stringify(JSON.parse(v), null, 2) } catch { return v }
  }
  return JSON.stringify(v, null, 2)
}

function statusClass(s) {
  if (s >= 200 && s < 300) return 'ok'
  if (s >= 300 && s < 400) return 'redir'
  if (s >= 400 && s < 500) return 'warn'
  return 'err'
}

export default {
  setup() {
    const loading = ref(false)
    const reqInfo = ref(null)
    const resInfo = ref(null)
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })

    // —— 健康检查：访问 /api/health ——
    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        health.value = {
          status: 'ok',
          label: '后端在线',
          hint: `${BASE} —— 可以开始打请求`
        }
      } catch (e) {
        health.value = {
          status: 'down',
          label: '后端没启动',
          hint: '在终端跑：cd server && npm start'
        }
      }
    }

    // —— 主流程：GET /api/users ——
    async function loadUsers() {
      loading.value = true
      reqInfo.value = null
      resInfo.value = null
      try {
        const res = await axios.get(`${BASE}/api/users`)

        // 请求侧 4 个字段（HTTP 请求报文的四段）
        reqInfo.value = {
          method:  res.config.method.toUpperCase(),
          url:     res.config.url,
          headers: pretty(res.config.headers),
          body:    pretty(res.config.data)
        }
        // 响应侧 4 个字段（HTTP 响应报文的四段）
        resInfo.value = {
          status:      res.status,
          statusText:  res.statusText,
          headers:     pretty(res.headers),
          data:        pretty(res.data),
          statusClass: statusClass(res.status),
          errored:     false
        }
      } catch (e) {
        if (e.config) {
          reqInfo.value = {
            method:  (e.config.method || '').toUpperCase(),
            url:     e.config.url,
            headers: pretty(e.config.headers),
            body:    pretty(e.config.data)
          }
        }
        if (e.response) {
          resInfo.value = {
            status:      e.response.status,
            statusText:  e.response.statusText,
            headers:     pretty(e.response.headers),
            data:        pretty(e.response.data),
            statusClass: statusClass(e.response.status),
            errored:     true
          }
        } else {
          resInfo.value = {
            status: 0, statusText: '网络错误',
            headers: '', data: e.message,
            statusClass: 'err', errored: true
          }
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(checkHealth)

    return { loading, reqInfo, resInfo, health, loadUsers, checkHealth }
  }
}
