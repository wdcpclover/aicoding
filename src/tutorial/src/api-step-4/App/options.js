import axios from 'axios'
import { userApi } from '../userApi.js'

const BASE = 'http://localhost:3001'

let randSeq = 0
function randomUser() {
  randSeq++
  const id = Math.floor(Math.random() * 9000) + 1000
  return {
    name:  `用户${id}`,
    email: `u${id}@example.com`,
    age:   20 + (randSeq % 30)
  }
}

export default {
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      users: [],
      busy: false,
      errMsg: '',
      logs: [],
      _timer: null
    }
  },
  async mounted() {
    await this.checkHealth()
    if (this.health.status === 'ok') this.load()
    this._timer = setInterval(() => this.syncLogs(), 200)
  },
  beforeUnmount() {
    if (this._timer) clearInterval(this._timer)
  },
  methods: {
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        this.health = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        this.health = { status: 'down', label: '后端没启动', hint: 'cd server && npm start' }
      }
    },
    syncLogs() {
      this.logs = [...(window.__interceptorLogs || [])]
    },
    clearLog() {
      if (window.__interceptorLogs) window.__interceptorLogs.length = 0
      this.logs = []
    },
    async load() {
      this.busy = true
      this.errMsg = ''
      try {
        this.users = await userApi.list()
      } catch (e) {
        this.errMsg = e.response?.data?.message || e.message
      } finally {
        this.busy = false
      }
    },
    async create() {
      this.busy = true
      try {
        await userApi.create(randomUser())
        await this.load()
      } catch (e) {
        this.errMsg = e.response?.data?.message || e.message
      } finally {
        this.busy = false
      }
    },
    async bumpAge() {
      if (!this.users.length) return
      const u = this.users[0]
      this.busy = true
      try {
        await userApi.update(u.id, { age: (u.age || 0) + 1 })
        await this.load()
      } catch (e) {
        this.errMsg = e.response?.data?.message || e.message
      } finally {
        this.busy = false
      }
    },
    async remove() {
      if (!this.users.length) return
      const u = this.users[0]
      this.busy = true
      try {
        await userApi.remove(u.id)
        await this.load()
      } catch (e) {
        this.errMsg = e.response?.data?.message || e.message
      } finally {
        this.busy = false
      }
    },
    async boom() {
      this.busy = true
      try {
        await userApi.boom()
      } catch (e) {
        this.errMsg = e.response?.data?.message || '后端崩了，详见日志'
      } finally {
        this.busy = false
      }
    },
    lineClass(line) {
      if (line.startsWith('→'))   return 'req'
      if (line.startsWith('←'))   return 'res'
      if (line.startsWith('💥') || line.startsWith('🌐')) return 'err'
      if (line.startsWith('🔒') || line.startsWith('⛔') || line.startsWith('🔍')) return 'warn'
      return ''
    }
  }
}
