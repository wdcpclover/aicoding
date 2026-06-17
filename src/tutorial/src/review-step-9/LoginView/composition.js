import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from './request.js'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()

    const form = ref({ student_id: '202205010001', password: '123456' })
    const error = ref('')
    const loading = ref(false)

    async function login() {
      error.value = ''
      loading.value = true
      try {
        const data = await request.post('/login', {
          student_id: form.value.student_id,
          password: form.value.password
        })
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // 登录成功 → 回到守卫记下的目标页（没有就回首页）
        router.push(route.query.redirect || '/')
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    return { form, error, loading, login }
  }
}
