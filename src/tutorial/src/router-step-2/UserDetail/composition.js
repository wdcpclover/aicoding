import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const database = {
  1: { name: '张三' },
  2: { name: '李四' },
  3: { name: '王五' }
}

export default {
  setup() {
    // 组合式 API：用 useRoute() 拿到响应式的路由对象
    const route = useRoute()

    const id = computed(() => route.params.id)
    const user = computed(() => database[id.value])

    // 同一个路由复用组件时，setup 不会再次执行
    // 需要监听 route.params 来响应参数变化
    const visitCount = ref(1)
    watch(() => route.params.id, () => {
      visitCount.value++
    })

    return { id, user, visitCount }
  }
}
