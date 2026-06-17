// Options 语法 store —— 自带 $reset，无需自己实现
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '小明',
    isAdmin: true,
    items: [],
    profile: { age: 25 }
  })
})
