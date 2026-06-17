import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from './auth.js'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const username = ref('')

    function doLogin() {
      if (!username.value) return
      auth.login(username.value)
      // 登录成功后：有 redirect query 就跳回去，否则回首页
      const target = route.query.redirect || { name: 'home' }
      router.replace(target)
    }

    return { username, doLogin }
  }
}
