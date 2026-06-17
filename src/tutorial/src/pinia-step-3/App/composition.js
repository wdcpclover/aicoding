import { getCurrentInstance, ref } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { useUserStore } from './userStoreSetup.js'

const pinia = createPinia()

export default {
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const store = useUserStore()
    const { name, isAdmin, items, profile } = storeToRefs(store)

    // ====== $subscribe 监听日志 ======
    const log = ref([])
    store.$subscribe((mutation, state) => {
      // 每次 state 变化都被 push 到 log（一次 $patch 即使改多个字段也只触发一次）
      log.value.unshift({
        time: new Date().toLocaleTimeString(),
        type: mutation.type,                                    // 'direct' / 'patch object' / 'patch function'
        snapshot: `name="${state.name}" isAdmin=${state.isAdmin} items=[${state.items.join(',')}] age=${state.profile.age}`
      })
    })

    function changeName() {
      // 1. 直接赋值
      store.name = '小红'
    }

    function patchObj() {
      // 2. 对象式 $patch：一次改多个字段（$subscribe 只触发一次）
      store.$patch({
        name: '小刚',
        isAdmin: false
      })
    }

    function patchFn() {
      // 3. 函数式 $patch：处理集合 / 嵌套对象（$subscribe 也只触发一次）
      store.$patch((state) => {
        state.items.push('apple')
        state.items.push('banana')
        state.profile.age++
      })
    }

    function resetAll() {
      // Setup Store 没有自带 $reset，调的是 store 自己写的那个
      store.$reset()
    }

    function clearLog() {
      log.value = []
    }

    return { name, isAdmin, items, profile, log, changeName, patchObj, patchFn, resetAll, clearLog }
  }
}
