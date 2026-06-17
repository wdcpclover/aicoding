import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useActivityStore } from './store.js'

export default {
  // 路由表里写了 props: true，所以 :id 直接作为 prop 进来
  props: {
    id: { type: [String, Number], required: true }
  },
  setup(props) {
    const router = useRouter()
    const store = useActivityStore()
    const { current, myList, loading } = storeToRefs(store)
    const { fetchOne, register } = store

    function onRegister() {
      register(props.id)
    }
    function back() {
      router.push('/')
    }

    // 进入详情页就按 id 拉数据
    onMounted(() => fetchOne(props.id))

    return { current, myList, loading, onRegister, back }
  }
}
