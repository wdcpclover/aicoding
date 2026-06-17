import { getCurrentInstance, reactive, ref, onMounted } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStoreSetup.js'

const BASE = 'http://localhost:3001'
const pinia = createPinia()

export default {
  setup() {
    // REPL 没有独立 main.js，在根组件挂载 Pinia
    // 真实项目里：createApp(App).use(createPinia()).mount('#app')
    getCurrentInstance().appContext.app.use(pinia)

    const userStore = useUserStore()
    const { list, current, loading, error, total } = storeToRefs(userStore)
    const { fetchList, fetchOne, addOne, updateOne, removeOne } = userStore

    const form = reactive({ name: '', email: '', age: 20 })
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        health.value = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        health.value = { status: 'down', label: '后端没启动', hint: 'cd server && npm start' }
      }
    }

    async function onCreate() {
      const created = await addOne({ ...form })
      if (created) {
        form.name = ''
        form.email = ''
        form.age = 20
      }
    }
    const onView    = id => fetchOne(id)
    const onAgePlus = u  => updateOne(u.id, { age: (u.age || 0) + 1 })
    const onRemove  = u  => removeOne(u.id)

    onMounted(async () => {
      await checkHealth()
      if (health.value.status === 'ok') fetchList()
    })

    return {
      health, list, current, loading, error, total, form,
      checkHealth, fetchList, onCreate, onView, onAgePlus, onRemove
    }
  }
}
