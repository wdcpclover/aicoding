// =============================================================
//  src/stores/user.js  —— Setup 语法（组合式）
//  收纳：用户列表 + 当前选中详情 + 共享 loading + 5 个 CRUD action
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from './userApi.js'

export const useUserStore = defineStore('user', () => {
  // —— state ——
  const list = ref([])
  const current = ref(null)         // 当前选中的用户（详情）
  const loading = ref(false)        // 全局 loading（所有 action 共享）
  const error = ref('')
  const started = ref(true)         // 后端是否启动（首次拉取失败 → false）

  // —— getters ——
  const total = computed(() => list.value.length)

  // —— internal helper：包一层 try/catch/finally + 错误友好提示 ——
  async function call(fn) {
    loading.value = true
    error.value = ''
    try {
      return await fn()
    } catch (e) {
      if (!e.response) {
        started.value = false
        error.value = '连接不到后端，请确认 http://localhost:3001 已启动'
      } else {
        error.value = `${e.response.status} ${e.response.data?.message || '请求失败'}`
      }
    } finally {
      loading.value = false
    }
  }

  // —— actions ——
  async function fetchList() {
    const data = await call(() => userApi.list())
    if (data) {
      list.value = data
      started.value = true
    }
  }

  async function fetchOne(id) {
    const data = await call(() => userApi.get(id))
    if (data) current.value = data
  }

  async function addOne(form) {
    const created = await call(() => userApi.create(form))
    if (created) list.value.push(created)
    return created
  }

  async function updateOne(id, patch) {
    const updated = await call(() => userApi.update(id, patch))
    if (updated) {
      const idx = list.value.findIndex(u => u.id === id)
      if (idx > -1) list.value[idx] = updated
      if (current.value?.id === id) current.value = updated
    }
  }

  async function removeOne(id) {
    const removed = await call(() => userApi.remove(id))
    if (removed) {
      list.value = list.value.filter(u => u.id !== id)
      if (current.value?.id === id) current.value = null
    }
  }

  return {
    list, current, loading, error, started, total,
    fetchList, fetchOne, addOne, updateOne, removeOne
  }
})
