// 这是【普通 JS 模块】，不是组件
// 演示组件外正确使用 store 的姿势
import { useAuthStore } from './authStoreSetup.js'

// ❌ 错误示范：模块顶层调用 —— pinia 未就绪
// const auth = useAuthStore()

// ✅ 正确：函数体内调用，函数被调用时 pinia 已激活
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
