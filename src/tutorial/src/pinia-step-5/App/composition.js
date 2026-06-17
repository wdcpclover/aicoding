import { getCurrentInstance, ref } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { useCounterStore } from './counterStoreSetup.js'

const pinia = createPinia()

export default {
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const store = useCounterStore()
    const { count, advice, loading, error } = storeToRefs(store)

    // $onAction 拦截每次 action 调用
    const log = ref([])
    store.$onAction(({ name, args, after, onError }) => {
      log.value.unshift(`▶ ${name}(${args.join(', ')})`)
      after(() => log.value.unshift(`  ✓ ${name} 完成`))
      onError((err) => log.value.unshift(`  ✗ ${name} 出错：${err.message}`))
    })

    return {
      count, advice, loading, error, log,
      increment: () => store.increment(),
      incrementBy5: () => store.incrementBy(5),
      randomize: () => store.randomize(),
      loadAdvice: () => store.loadAdvice(),
      failOnPurpose: () => store.failOnPurpose()
    }
  }
}
