// Options 语法 store
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    login(name) {
      this.token = 'fake-token-' + Math.random().toString(36).slice(2, 8)
      this.user = { name }
    },
    logout() {
      this.token = ''
      this.user = null
    }
  }
})
