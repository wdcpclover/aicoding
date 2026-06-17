import { getCurrentInstance } from 'vue'
import { router } from './router.js'
import { auth } from './auth.js'

export default {
  setup() {
    getCurrentInstance().appContext.app.use(router)
    return { auth }
  }
}
