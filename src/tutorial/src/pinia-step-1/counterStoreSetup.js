// Setup 语法 store —— 像 Vue 3 setup 函数那样写
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)

  // getter
  const doubleCount = computed(() => count.value * 2)

  // action
  function increment() {
    count.value++
  }

  // 必须 return，外部才能访问
  return { count, doubleCount, increment }
})
