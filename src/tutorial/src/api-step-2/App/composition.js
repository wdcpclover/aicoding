import { ref, reactive, onMounted } from 'vue'
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
  setup() {
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })
    const loading = ref(false)
    const error = ref(null)
    const users = ref([])
    const detail = ref(null)
    const rawRes = ref(null)
    const form = reactive({ name: '', email: '', age: 20 })

    function snapshot(res) {
      rawRes.value = {
        status:     res.status,
        statusText: res.statusText,
        data:       pretty(res.data),
        config: {
          method: (res.config.method || '').toUpperCase(),
          url:    (res.config.baseURL || '') + (res.config.url || ''),
          data:   pretty(res.config.data)
        }
      }
    }

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        health.value = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        health.value = {
          status: 'down',
          label: '后端没启动',
          hint: 'cd server && npm start'
        }
      }
    }

    // ① 列表
    async function loadList() {
      loading.value = true
      error.value = null
      try {
        const res = await axios.get(`${BASE}/api/users`)
        users.value = res.data
        snapshot(res)
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    // ② 详情
    async function loadDetail(id) {
      try {
        const res = await axios.get(`${BASE}/api/users/${id}`)
        detail.value = res.data
        snapshot(res)
      } catch (e) {
        error.value = e.message
      }
    }

    // ③ 新增
    async function create() {
      loading.value = true
      error.value = null
      try {
        const res = await axios.post(`${BASE}/api/users`, {
          name:  form.name,
          email: form.email,
          age:   Number(form.age) || 0
        })
        snapshot(res)
        form.name = ''; form.email = ''; form.age = 20
        await loadList()
      } catch (e) {
        error.value = e.response?.data?.message || e.message
      } finally {
        loading.value = false
      }
    }

    // ④ 更新
    async function bumpAge(user) {
      try {
        const res = await axios.put(`${BASE}/api/users/${user.id}`, {
          age: (user.age || 0) + 1
        })
        snapshot(res)
        await loadList()
        if (detail.value && detail.value.id === user.id) detail.value = res.data
      } catch (e) {
        error.value = e.message
      }
    }

    // ⑤ 删除
    async function remove(id) {
      try {
        const res = await axios.delete(`${BASE}/api/users/${id}`)
        snapshot(res)
        if (detail.value && detail.value.id === id) detail.value = null
        await loadList()
      } catch (e) {
        error.value = e.message
      }
    }

    onMounted(async () => {
      await checkHealth()
      if (health.value.status === 'ok') loadList()
    })

    return {
      health, loading, error, users, detail, rawRes, form,
      checkHealth, loadList, loadDetail, create, bumpAge, remove
    }
  }
}
