import axios from 'axios'

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
  data() {
    return {
      loading: false,
      reqInfo: null,
      resInfo: null,
      health: { status: 'checking', label: '检查后端中...', hint: '' }
    }
  },
  mounted() {
    this.checkHealth()
  },
  methods: {
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        this.health = {
          status: 'ok',
          label: '后端在线',
          hint: `${BASE} —— 可以开始打请求`
        }
      } catch (e) {
        this.health = {
          status: 'down',
          label: '后端没启动',
          hint: '在终端跑：cd server && npm start'
        }
      }
    },
    async loadUsers() {
      this.loading = true
      this.reqInfo = null
      this.resInfo = null
      try {
        const res = await axios.get(`${BASE}/api/users`)
        this.reqInfo = {
          method:  res.config.method.toUpperCase(),
          url:     res.config.url,
          headers: pretty(res.config.headers),
          body:    pretty(res.config.data)
        }
        this.resInfo = {
          status:      res.status,
          statusText:  res.statusText,
          headers:     pretty(res.headers),
          data:        pretty(res.data),
          statusClass: statusClass(res.status),
          errored:     false
        }
      } catch (e) {
        if (e.config) {
          this.reqInfo = {
            method:  (e.config.method || '').toUpperCase(),
            url:     e.config.url,
            headers: pretty(e.config.headers),
            body:    pretty(e.config.data)
          }
        }
        if (e.response) {
          this.resInfo = {
            status:      e.response.status,
            statusText:  e.response.statusText,
            headers:     pretty(e.response.headers),
            data:        pretty(e.response.data),
            statusClass: statusClass(e.response.status),
            errored:     true
          }
        } else {
          this.resInfo = {
            status: 0, statusText: '网络错误',
            headers: '', data: e.message,
            statusClass: 'err', errored: true
          }
        }
      } finally {
        this.loading = false
      }
    }
  }
}
