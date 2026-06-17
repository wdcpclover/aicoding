import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    function go(id) {
      // 用 name 跳转：就算后面改了 path（/users/:id → /u/:id），代码也不用改
      router.push({ name: 'user-detail', params: { id } })
    }

    return { go }
  }
}
