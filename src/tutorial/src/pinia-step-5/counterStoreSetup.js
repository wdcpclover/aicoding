// Setup 语法 store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const advice = ref('')
  const loading = ref(false)
  const error = ref('')

  // 同步 action
  function increment() {
    count.value++
  }
  function incrementBy(n) {
    count.value += n
  }
  function randomize() {
    count.value = Math.round(100 * Math.random())
  }

  // 异步 action
  async function loadAdvice() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch('https://api.adviceslip.com/advice')
      const data = await res.json()
      advice.value = data.slip.advice
    } catch (e) {
      error.value = '请求失败：' + e.message
    } finally {
      loading.value = false
    }
  }

  // 故意失败的 action（演示错误处理）
  async function failOnPurpose() {
    loading.value = true
    error.value = ''
    try {
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('模拟接口失败')), 500)
      )
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    count, advice, loading, error,
    increment, incrementBy, randomize, loadAdvice, failOnPurpose
  }
})
