// 这是【普通 JS 模块】 —— 与 Setup 版本逻辑完全一致
import { useAuthStore } from './authStoreOption.js'

export function requireAuth(action) {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return `❌ 拒绝：「${action}」需要登录`
  }
  return `✅ 允许：${auth.user.name} 执行了「${action}」`
}

export function getAuthHeader() {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}
