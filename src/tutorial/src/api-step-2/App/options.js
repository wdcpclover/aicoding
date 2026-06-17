import axios from 'axios'

const BASE = 'http://localhost:3001'

function pretty(v) {
  if (v == null) return ''
  if (typeof v === 'string') {
    try { return JSON.stringify(JSON.parse(v), null, 2) } catch { return v }
  }
  return JSON.stringify(v, null, 2)
}

export default {
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      loading: false,
      error: null,
      users: [],
      detail: null,
      rawRes: null,
      form: { name: '', email: '', age: 20 }
    }
  },
  async mounted() {
    await this.checkHealth()
    if (this.health.status === 'ok') this.loadList()
  },
  methods: {
    snapshot(res) {
      this.rawRes = {
        status:     res.status,
        statusText: res.statusText,
        data:       pretty(res.data),
        config: {
          method: (res.config.method || '').toUpperCase(),
          url:    (res.config.baseURL || '') + (res.config.url || ''),
          data:   pretty(res.config.data)
        }
      }
    },
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        this.health = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        this.health = {
          status: 'down',
          label: '后端没启动',
          hint: 'cd server && npm start'
        }
      }
    },
    async loadList() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`${BASE}/api/users`)
        this.users = res.data
        this.snapshot(res)
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async loadDetail(id) {
      try {
        const res = await axios.get(`${BASE}/api/users/${id}`)
        this.detail = res.data
        this.snapshot(res)
      } catch (e) {
        this.error = e.message
      }
    },
    async create() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post(`${BASE}/api/users`, {
          name:  this.form.name,
          email: this.form.email,
          age:   Number(this.form.age) || 0
        })
        this.snapshot(res)
        this.form = { name: '', email: '', age: 20 }
        await this.loadList()
      } catch (e) {
        this.error = e.response?.data?.message || e.message
      } finally {
        this.loading = false
      }
    },
    async bumpAge(user) {
      try {
        const res = await axios.put(`${BASE}/api/users/${user.id}`, {
          age: (user.age || 0) + 1
        })
        this.snapshot(res)
        await this.loadList()
        if (this.detail && this.detail.id === user.id) this.detail = res.data
      } catch (e) {
        this.error = e.message
      }
    },
    async remove(id) {
      try {
        const res = await axios.delete(`${BASE}/api/users/${id}`)
        this.snapshot(res)
        if (this.detail && this.detail.id === id) this.detail = null
        await this.loadList()
      } catch (e) {
        this.error = e.message
      }
    }
  }
}
