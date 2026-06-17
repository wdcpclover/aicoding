import { getCurrentInstance } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
// 组合式模式：用 Setup 语法 store
import { useCounterStore } from './counterStoreSetup.js'

const pinia = createPinia()

export default {
  setup() {
    // 真实项目里在 main.js：createApp(App).use(createPinia()).mount('#app')
    // 教程 REPL 没有独立 main.js，所以在根组件 setup 里安装 Pinia
    getCurrentInstance().appContext.app.use(pinia)

    const counter = useCounterStore()

    // state 和 getter 用 storeToRefs 解构以保持响应性
    const { count, doubleCount } = storeToRefs(counter)

    // action 是普通函数，直接解构即可
    const { increment } = counter

    return { count, doubleCount, increment }
  }
}
