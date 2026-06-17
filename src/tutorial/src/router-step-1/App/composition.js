import { getCurrentInstance } from 'vue'
import { router } from './router.js'

export default {
  setup() {
    // 真实项目里请在 main.js 中写 createApp(App).use(router).mount('#app')
    // 教程 REPL 没有独立 main.js，所以通过 getCurrentInstance 在根组件里安装
    getCurrentInstance().appContext.app.use(router)
    return {}
  }
}
