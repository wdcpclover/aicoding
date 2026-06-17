import { router } from './router.js'

export default {
  // 真实项目里请在 main.js 中写 createApp(App).use(router).mount('#app')
  // 教程 REPL 没有独立 main.js，所以通过 this.$ 在根组件里安装
  beforeCreate() {
    this.$.appContext.app.use(router)
  }
}
