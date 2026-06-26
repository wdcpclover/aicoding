// =============================================================
//  stores/auth.js
//  登录态：token（持久化到 localStorage）+ user 信息
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

const TOKEN_KEY = 'chatbox_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t) {
    token.value = t
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  }

  // 启动时调一次：如果 token 存在 → 调 /me 拿用户信息
  async function restore() {
    if (!token.value) return
    try {
      const { user: u } = await authApi.me()
      user.value = u
    } catch {
      setToken('')
      user.value = null
    }
  }

  async function login(credentials) {
    const { token: t, user: u } = await authApi.login(credentials)
    setToken(t)
    user.value = u
    return u
  }

  async function register(credentials) {
    const { token: t, user: u } = await authApi.register(credentials)
    setToken(t)
    user.value = u
    return u
  }

  function logout() {
    setToken('')
    user.value = null
  }

  return { token, user, isLoggedIn, restore, login, register, logout }
})
