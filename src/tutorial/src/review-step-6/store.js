import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from './request.js'

// ===== 考点：store/activity.js（试卷 15 分）—— 组合式写法 =====
export const useActivityStore = defineStore('activity', () => {
  // —— state ——
  const list = ref([])        // 活动列表
  const keyword = ref('')     // 搜索关键词
  const loading = ref(false)  // 加载中
  const error = ref('')       // 错误信息

  // —— getter ——
  const total = computed(() => list.value.length)

  // —— actions ——
  // 拉列表：把搜索词作为 query 交给后端（也可前端本地过滤，二选一）
  async function fetchList() {
    loading.value = true
    error.value = ''
    try {
      list.value = await request.get('/activities', {
        params: { keyword: keyword.value }
      })
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { list, keyword, loading, error, total, fetchList }
})
