import { router } from './router.js'

export default {
  beforeCreate() {
    const app = this.$.appContext.app
    app.use(router)

    // REPL 环境下路由首次解析前会偶发访问 id 的警告，屏蔽之（真实项目不需要）
    app.config.warnHandler = (msg, instance, trace) => {
      if (msg.includes('Property "id"')) return
      console.warn(msg, trace)
    }
  }
}
