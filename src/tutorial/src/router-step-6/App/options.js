import { router } from './router.js'
import { auth } from './auth.js'

export default {
  beforeCreate() {
    this.$.appContext.app.use(router)
  },
  data() {
    return { auth }
  }
}
