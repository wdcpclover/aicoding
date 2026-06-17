import { createPinia, mapState, mapActions } from 'pinia'
import { useCounterStore } from './counterStoreOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    this.$.appContext.app.use(pinia)

    // 安装 pinia 后立刻订阅 action
    const store = useCounterStore()
    store.$onAction(({ name, args, after, onError }) => {
      this.log.unshift(`▶ ${name}(${args.join(', ')})`)
      after(() => this.log.unshift(`  ✓ ${name} 完成`))
      onError((err) => this.log.unshift(`  ✗ ${name} 出错：${err.message}`))
    })
  },
  data() {
    return { log: [] }
  },
  computed: {
    ...mapState(useCounterStore, ['count', 'advice', 'loading', 'error'])
  },
  methods: {
    ...mapActions(useCounterStore, ['increment', 'randomize', 'loadAdvice', 'failOnPurpose']),
    incrementBy5() {
      useCounterStore().incrementBy(5)
    }
  }
}
