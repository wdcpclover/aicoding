import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from './request.js'

// ===== store/activity.js（含详情 + 报名）=====
export const useActivityStore = defineStore('activity', () => {
  const list = ref([])
  const keyword = ref('')
  const current = ref(null)   // 当前查看的活动详情
  const myList = ref([])      // 我报名的活动
  const loading = ref(false)

  const total = computed(() => list.value.length)

  async function fetchList() {
    loading.value = true
    try {
      list.value = await request.get('/activities', { params: { keyword: keyword.value } })
    } finally {
      loading.value = false
    }
  }

  // 详情：根据动态路由参数 id 拉一条
  async function fetchOne(id) {
    loading.value = true
    current.value = null
    try {
      current.value = await request.get(`/activities/${id}`)
    } finally {
      loading.value = false
    }
  }

  // 报名：成功后刷新「我的活动」+ 把详情标记为已报名
  async function register(id) {
    await request.post(`/activities/${id}/register`)
    if (current.value && current.value.id === id) current.value.is_registered = true
    await fetchMy()
  }

  async function fetchMy() {
    myList.value = await request.get('/my-activities')
  }

  return { list, keyword, current, myList, loading, total, fetchList, fetchOne, register, fetchMy }
})
