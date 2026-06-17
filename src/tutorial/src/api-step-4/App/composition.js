import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  setup() {
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })
    const users = ref([])
    const busy = ref(false)
    const errMsg = ref('')
    const logs = ref([])
    let timer

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        health.value = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        health.value = { status: 'down', label: '后端没启动', hint: 'cd server && npm start' }
      }
    }

    function syncLogs() {
      logs.value = [...(window.__interceptorLogs || [])]
    }

    function clearLog() {
      if (window.__interceptorLogs) window.__interceptorLogs.length = 0
      logs.value = []
    }

    async function load() {
      busy.value = true
      errMsg.value = ''
      try {
        users.value = await userApi.list()    // ⭐ 没有 .data，因为拦截器已经剥过
      } catch (e) {
        errMsg.value = e.response?.data?.message || e.message
      } finally {
        busy.value = false
      }
    }

    async function create() {
      busy.value = true
      try {
        await userApi.create(randomUser())
        await load()
      } catch (e) {
        errMsg.value = e.response?.data?.message || e.message
      } finally {
        busy.value = false
      }
    }

    async function bumpAge() {
      if (!users.value.length) return
      const u = users.value[0]
      busy.value = true
      try {
        await userApi.update(u.id, { age: (u.age || 0) + 1 })
        await load()
      } catch (e) {
        errMsg.value = e.response?.data?.message || e.message
      } finally {
        busy.value = false
      }
    }

    async function remove() {
      if (!users.value.length) return
      const u = users.value[0]
      busy.value = true
      try {
        await userApi.remove(u.id)
        await load()
      } catch (e) {
        errMsg.value = e.response?.data?.message || e.message
      } finally {
        busy.value = false
      }
    }

    async function boom() {
      busy.value = true
      try {
        await userApi.boom()
      } catch (e) {
        // 拦截器已经打过 💥，组件这里通常什么都不用做
        errMsg.value = e.response?.data?.message || '后端崩了，详见日志'
      } finally {
        busy.value = false
      }
    }

    function lineClass(line) {
      if (line.startsWith('→'))   return 'req'
      if (line.startsWith('←'))   return 'res'
      if (line.startsWith('💥') || line.startsWith('🌐')) return 'err'
      if (line.startsWith('🔒') || line.startsWith('⛔') || line.startsWith('🔍')) return 'warn'
      return ''
    }

    onMounted(async () => {
      await checkHealth()
      if (health.value.status === 'ok') load()
      timer = setInterval(syncLogs, 200)
    })
    onUnmounted(() => clearInterval(timer))

    return {
      health, users, busy, errMsg, logs,
      checkHealth, load, create, bumpAge, remove, boom, clearLog, lineClass
    }
  }
}
