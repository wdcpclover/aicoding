import { ref, computed } from 'vue'
import request from './request.js'

export default {
  setup() {
    // 登录表单（学号 + 密码）
    const form = ref({ student_id: '202205010001', password: '123456' })

    // 关键：token / user 从 localStorage 读初始值 —— 这就是「刷新后自动保持登录」
    const token = ref(localStorage.getItem('token') || '')
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const isLoggedIn = computed(() => !!token.value)

    const error = ref('')
    const loading = ref(false)
    const probe = ref('') // 验证「受保护接口」用

    async function login() {
      error.value = ''
      loading.value = true
      try {
        // request 实例 + 拦截器：这里只关心业务，不碰 axios 细节
        const data = await request.post('/login', {
          student_id: form.value.student_id,
          password: form.value.password
        })
        // data = { token, user }
        // 存进 localStorage：下次刷新页面，上面的初始值就能读到 → 保持登录
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        token.value = data.token
        user.value = data.user
        probe.value = ''
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    function logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      token.value = ''
      user.value = null
      probe.value = ''
    }

    // 调一个受保护接口，证明请求拦截器真的把 token 带上了
    async function callProtected() {
      probe.value = '请求中...'
      try {
        const list = await request.get('/activities')
        probe.value = `✅ 成功！拿到 ${list.length} 个活动 —— 请求头自动带上了 token`
      } catch (e) {
        probe.value = '❌ ' + e.message
      }
    }

    // 演示「没带 token 会被拦」：临时清掉 token 再请求
    async function callWithoutToken() {
      const saved = localStorage.getItem('token')
      localStorage.removeItem('token')
      probe.value = '用「没有 token」的状态请求中...'
      try {
        await request.get('/activities')
        probe.value = '✅ 居然成功了？'
      } catch (e) {
        probe.value = '❌ ' + e.message + '（这正是「访问控制」要拦的情况）'
      } finally {
        if (saved) localStorage.setItem('token', saved)
      }
    }

    return {
      form, token, user, isLoggedIn, error, loading, probe,
      login, logout, callProtected, callWithoutToken
    }
  }
}
