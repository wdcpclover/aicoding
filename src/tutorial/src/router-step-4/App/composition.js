import { getCurrentInstance } from 'vue'
import { router } from './router.js'

export default {
  setup() {
    getCurrentInstance().appContext.app.use(router)
    return {}
  }
}
