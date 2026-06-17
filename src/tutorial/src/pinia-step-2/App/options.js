import { createPinia, mapState, mapActions } from 'pinia'
// 选项式模式：用 Options 语法 store
import { useCounterStore } from './counterStoreOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    this.$.appContext.app.use(pinia)
  },
  computed: {
    ...mapState(useCounterStore, ['count', 'name', 'doubleCount'])
  },
  methods: {
    ...mapActions(useCounterStore, ['increment'])
  }
}
