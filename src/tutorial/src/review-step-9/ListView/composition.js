import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useActivityStore } from './store.js'
import ActivityCard from './ActivityCard.vue'

export default {
  components: { ActivityCard },
  setup() {
    const router = useRouter()
    const store = useActivityStore()
    const { list, keyword, loading } = storeToRefs(store)
    const { fetchList } = store

    // 编程式导航：点卡片 → 跳到 /activities/:id
    function goDetail(id) {
      router.push(`/activities/${id}`)
    }

    onMounted(fetchList)

    return { list, keyword, loading, fetchList, goDetail }
  }
}
