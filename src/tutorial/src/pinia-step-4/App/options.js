import { createPinia, mapState, mapActions } from 'pinia'
import { useCounterStore } from './counterStoreOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    this.$.appContext.app.use(pinia)
  },
  data() {
    return { queryId: 1 }
  },
  computed: {
    ...mapState(useCounterStore, ['count', 'doubleCount', 'doublePlusOne']),
    queriedUser() {
      // 带参数的 getter 不能直接 mapState，自己写 computed
      return useCounterStore().getUserById(Number(this.queryId))
    }
  },
  methods: {
    ...mapActions(useCounterStore, ['increment'])
  }
}
