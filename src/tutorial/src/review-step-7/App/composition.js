import { getCurrentInstance, ref, onMounted } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import request from './request.js'
import { useActivityStore } from './store.js'
import ActivityCard from './ActivityCard.vue'

const pinia = createPinia()

export default {
  components: { ActivityCard },
  setup() {
    getCurrentInstance().appContext.app.use(pinia)

    const store = useActivityStore()
    const { list, keyword, loading } = storeToRefs(store)
    const { fetchList } = store

    const picked = ref('') // 模拟「点了哪张卡片」，详情页在下一步

    // 子组件 emit('view', id) 冒上来，父组件统一处理
    function onView(id) {
      const a = list.value.find(x => x.id === id)
      picked.value = `你点了「${a.title}」（#${id}）—— 下一步用路由跳到它的详情页`
    }

    onMounted(async () => {
      if (!localStorage.getItem('token')) {
        const data = await request.post('/login', { student_id: 'demo', password: 'demo' })
        localStorage.setItem('token', data.token)
      }
      fetchList()
    })

    return { list, keyword, loading, picked, fetchList, onView }
  }
}
