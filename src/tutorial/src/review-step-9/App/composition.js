import { getCurrentInstance, ref, computed } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router.js'

const pinia = createPinia()

export default {
  setup() {
    // main.js 的事：装 Pinia + 路由
    const app = getCurrentInstance().appContext.app
    app.use(pinia)
    app.use(router)

    // 顶部栏显示登录态（演示守卫用）
    const token = ref(localStorage.getItem('token') || '')
    const isLoggedIn = computed(() => !!token.value)

    function logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      token.value = ''
      router.push('/login') // 退出后回登录页
    }

    // 路由跳转后同步一下顶部栏的登录态
    router.afterEach(() => {
      token.value = localStorage.getItem('token') || ''
    })

    return { isLoggedIn, logout }
  }
}
