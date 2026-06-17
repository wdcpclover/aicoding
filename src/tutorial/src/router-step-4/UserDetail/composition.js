import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    function goNext() {
      const nextId = Number(route.params.id) + 1
      router.push(`/users/${nextId}`)
    }

    return { goNext }
  }
}
