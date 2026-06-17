import { createPinia, mapState } from 'pinia'
import { useUserStore } from './userStoreOption.js'

const pinia = createPinia()

export default {
  beforeCreate() {
    this.$.appContext.app.use(pinia)

    // 安装 pinia 后立刻订阅 state 变化
    const store = useUserStore()
    store.$subscribe((mutation, state) => {
      this.log.unshift({
        time: new Date().toLocaleTimeString(),
        type: mutation.type,
        snapshot: `name="${state.name}" isAdmin=${state.isAdmin} items=[${state.items.join(',')}] age=${state.profile.age}`
      })
    })
  },
  data() {
    return { log: [] }
  },
  computed: {
    ...mapState(useUserStore, ['name', 'isAdmin', 'items', 'profile'])
  },
  methods: {
    changeName() {
      useUserStore().name = '小红'
    },
    patchObj() {
      useUserStore().$patch({
        name: '小刚',
        isAdmin: false
      })
    },
    patchFn() {
      useUserStore().$patch((state) => {
        state.items.push('apple')
        state.items.push('banana')
        state.profile.age++
      })
    },
    resetAll() {
      useUserStore().$reset()
    },
    clearLog() {
      this.log = []
    }
  }
}
