import { createPinia, mapState, mapActions } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStoreOptions.js'

const BASE = 'http://localhost:3001'
const pinia = createPinia()

export default {
  beforeCreate() {
    // REPL 没有独立 main.js，所以在根组件 beforeCreate 里挂载 Pinia
    this.$.appContext.app.use(pinia)
  },
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      form: { name: '', email: '', age: 20 }
    }
  },
  computed: {
    ...mapState(useUserStore, ['list', 'current', 'loading', 'error', 'total'])
  },
  async mounted() {
    await this.checkHealth()
    if (this.health.status === 'ok') this.fetchList()
  },
  methods: {
    ...mapActions(useUserStore, ['fetchList', 'fetchOne', 'addOne', 'updateOne', 'removeOne']),
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        this.health = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        this.health = { status: 'down', label: '后端没启动', hint: 'cd server && npm start' }
      }
    },
    async onCreate() {
      const created = await this.addOne({ ...this.form })
      if (created) {
        this.form.name = ''
        this.form.email = ''
        this.form.age = 20
      }
    },
    onView(id)   { this.fetchOne(id) },
    onAgePlus(u) { this.updateOne(u.id, { age: (u.age || 0) + 1 }) },
    onRemove(u)  { this.removeOne(u.id) }
  }
}
