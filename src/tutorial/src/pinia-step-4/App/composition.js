import { getCurrentInstance, ref, computed } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { useCounterStore } from './counterStoreSetup.js'

const pinia = createPinia()

export default {
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const store = useCounterStore()
    const { count, doubleCount, doublePlusOne } = storeToRefs(store)
    const { increment } = store

    // 带参数的 getter：包成 computed 让模板能响应式
    const queryId = ref(1)
    const queriedUser = computed(() => store.getUserById(Number(queryId.value)))

    return { count, doubleCount, doublePlusOne, increment, queryId, queriedUser }
  }
}
