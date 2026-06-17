import { router } from './router.js'

export default {
  beforeCreate() {
    this.$.appContext.app.use(router)
  }
}
