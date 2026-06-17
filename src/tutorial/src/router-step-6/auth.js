import { reactive } from 'vue'

// 用一个 reactive 对象模拟登录状态
// 真实项目里会用 Pinia / Vuex / localStorage
export const auth = reactive({
  isLoggedIn: false,
  username: '',
  login(name) {
    this.isLoggedIn = true
    this.username = name
  },
  logout() {
    this.isLoggedIn = false
    this.username = ''
  }
})
