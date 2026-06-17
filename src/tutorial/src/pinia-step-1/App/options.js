import { createPinia, mapState, mapActions } from 'pinia'
// 选项式模式：用 Options 语法 store
import { useCounterStore } from './counterStoreOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    // 真实项目里在 main.js：createApp(App).use(createPinia()).mount('#app')
    // 教程 REPL 没有独立 main.js，所以在根组件 beforeCreate 里安装 Pinia
    this.$.appContext.app.use(pinia)
  },
  computed: {
    // mapState 同时映射 state 字段和 getter
    ...mapState(useCounterStore, ['count', 'doubleCount'])
  },
  methods: {
    // mapActions 把 action 映射成组件方法
    ...mapActions(useCounterStore, ['increment'])
  }
}
