// Options 语法 store
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    advice: '',
    loading: false,
    error: ''
  }),
  actions: {
    // 同步 action
    increment() {
      this.count++
    },
    incrementBy(n) {
      this.count += n
    },
    randomize() {
      this.count = Math.round(100 * Math.random())
    },

    // 异步 action
    async loadAdvice() {
      this.loading = true
      this.error = ''
      try {
        const res = await fetch('https://api.adviceslip.com/advice')
        const data = await res.json()
        this.advice = data.slip.advice
      } catch (e) {
        this.error = '请求失败：' + e.message
      } finally {
        this.loading = false
      }
    },

    // 故意失败的 action
    async failOnPurpose() {
      this.loading = true
      this.error = ''
      try {
        await new Promise((_, reject) =>
          setTimeout(() => reject(new Error('模拟接口失败')), 500)
        )
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
