import { getCurrentInstance } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
// 组合式模式：用 Setup 语法 store
import { useCounterStore } from './counterStoreSetup.js'

const pinia = createPinia()

export default {
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const counter = useCounterStore()
    const { count, name, doubleCount } = storeToRefs(counter)
    const { increment } = counter

    return { count, name, doubleCount, increment }
  }
}
