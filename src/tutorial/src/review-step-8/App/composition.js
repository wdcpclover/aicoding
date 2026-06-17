import { getCurrentInstance, onMounted } from 'vue'
import { createPinia } from 'pinia'
import request from './request.js'
import { router } from './router.js'

const pinia = createPinia()

export default {
  setup() {
    // 真实项目在 main.js：createApp(App).use(createPinia()).use(router).mount('#app')
    const app = getCurrentInstance().appContext.app
    app.use(pinia)
    app.use(router)

    onMounted(async () => {
      // demo 自动登录（真实考试是登录页登录）
      if (!localStorage.getItem('token')) {
        const data = await request.post('/login', { student_id: 'demo', password: 'demo' })
        localStorage.setItem('token', data.token)
      }
    })

    return {}
  }
}
