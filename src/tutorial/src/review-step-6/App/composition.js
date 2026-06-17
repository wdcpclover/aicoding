import { getCurrentInstance, onMounted } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import request from './request.js'
import { useActivityStore } from './store.js'

const pinia = createPinia()

export default {
  setup() {
    // 真实项目在 main.js：createApp(App).use(createPinia()).mount('#app')
    // REPL 没有 main.js，这里在根组件挂 Pinia
    getCurrentInstance().appContext.app.use(pinia)

    const store = useActivityStore()
    // state / getter 用 storeToRefs 保留响应式；action 直接解构
    const { list, keyword, loading, error, total } = storeToRefs(store)
    const { fetchList } = store

    onMounted(async () => {
      // demo 自动登录拿 token（上一步学过）；真实考试是用户在登录页登录
      if (!localStorage.getItem('token')) {
        const data = await request.post('/login', { student_id: 'demo', password: 'demo' })
        localStorage.setItem('token', data.token)
      }
      fetchList()
    })

    return { list, keyword, loading, error, total, fetchList }
  }
}
