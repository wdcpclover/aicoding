import { getCurrentInstance } from 'vue'
import { router } from './router.js'

export default {
  setup() {
    // 真实项目：createApp(App).use(router).mount('#app')
    getCurrentInstance().appContext.app.use(router)
    return {}
  }
}
