// Setup 语法 store —— getter 用 computed 实现
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const users = ref([
    { id: 1, name: '小明' },
    { id: 2, name: '小红' },
    { id: 3, name: '小刚' }
  ])

  // 1. 基础 getter
  const doubleCount = computed(() => count.value * 2)

  // 2. 依赖另一个 getter
  const doublePlusOne = computed(() => doubleCount.value + 1)

  // 3. 返回函数的 getter（参数化查询）
  const getUserById = computed(() => {
    return (id) => users.value.find(u => u.id === id)
  })

  // action
  function increment() {
    count.value++
  }

  return { count, users, doubleCount, doublePlusOne, getUserById, increment }
})
