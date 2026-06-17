import { auth } from './auth.js'

export default {
  data() {
    return {
      username: ''
    }
  },
  methods: {
    doLogin() {
      if (!this.username) return
      auth.login(this.username)
      // 登录成功后：有 redirect query 就跳回去，否则回首页
      const target = this.$route.query.redirect || { name: 'home' }
      this.$router.replace(target)
    }
  }
}
