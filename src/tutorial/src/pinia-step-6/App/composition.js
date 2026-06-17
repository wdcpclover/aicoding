import { getCurrentInstance, ref } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { useAuthStore } from './authStoreSetup.js'
import { requireAuth, getAuthHeader } from './authUtilsSetup.js'

const pinia = createPinia()

export default {
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const auth = useAuthStore()
    const { token, user, isLoggedIn } = storeToRefs(auth)

    const log = ref([])
    function tryAction(name) {
      // 调用普通 JS 模块的工具函数
      // 它内部从 store 读登录态返回判断结果
      log.value.unshift(requireAuth(name))
    }
    function showHeader() {
      const h = getAuthHeader()
      log.value.unshift('请求头：' + JSON.stringify(h))
    }

    return {
      token, user, isLoggedIn, log,
      login: () => auth.login('小明'),
      logout: () => auth.logout(),
      tryAction,
      showHeader
    }
  }
}
