import { createPinia, mapState, mapActions } from 'pinia'
import { useAuthStore } from './authStoreOption.js'
import { requireAuth, getAuthHeader } from './authUtilsOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    this.$.appContext.app.use(pinia)
  },
  data() {
    return { log: [] }
  },
  computed: {
    ...mapState(useAuthStore, ['token', 'user', 'isLoggedIn'])
  },
  methods: {
    login() {
      useAuthStore().login('小明')
    },
    logout() {
      useAuthStore().logout()
    },
    tryAction(name) {
      this.log.unshift(requireAuth(name))
    },
    showHeader() {
      this.log.unshift('请求头：' + JSON.stringify(getAuthHeader()))
    }
  }
}
