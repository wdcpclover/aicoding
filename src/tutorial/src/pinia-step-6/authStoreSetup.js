// Setup 语法 store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)

  // getter
  const isLoggedIn = computed(() => !!token.value)

  // action
  function login(name) {
    token.value = 'fake-token-' + Math.random().toString(36).slice(2, 8)
    user.value = { name }
  }
  function logout() {
    token.value = ''
    user.value = null
  }

  return { token, user, isLoggedIn, login, logout }
})
