// Setup 语法 store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('小明')
  const isAdmin = ref(true)
  const items = ref([])
  const profile = ref({ age: 25 })

  // Setup Store 没有自带 $reset，自己写一个
  function $reset() {
    name.value = '小明'
    isAdmin.value = true
    items.value = []
    profile.value = { age: 25 }
  }

  return { name, isAdmin, items, profile, $reset }
})
