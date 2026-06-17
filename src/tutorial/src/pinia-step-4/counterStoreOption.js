// Options 语法 store
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    users: [
      { id: 1, name: '小明' },
      { id: 2, name: '小红' },
      { id: 3, name: '小刚' }
    ]
  }),
  getters: {
    // 1. 基础 getter（箭头函数 + state 参数）
    doubleCount: (state) => state.count * 2,

    // 2. 依赖另一个 getter（普通函数 + this）
    doublePlusOne() {
      return this.doubleCount + 1
    },

    // 3. 返回函数的 getter（参数化查询）
    getUserById: (state) => {
      return (id) => state.users.find(u => u.id === id)
    }
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
