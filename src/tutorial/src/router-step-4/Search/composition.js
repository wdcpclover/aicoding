import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    const keyword = ref(route.query.q || '')

    function search() {
      // 传对象形式：可以同时指定 path 和 query
      router.push({
        path: '/search',
        query: { q: keyword.value }
      })
    }

    return { keyword, search }
  }
}
