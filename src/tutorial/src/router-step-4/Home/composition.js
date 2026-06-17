import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    // 组合式 API：用 useRouter() 拿到 router 实例
    const router = useRouter()
    const inputId = ref('')

    function goToUser(id, replace = false) {
      if (!id) return
      // push：往历史栈里加一条记录（可以 back）
      // replace：替换当前记录（back 不会回到这里）
      if (replace) {
        router.replace(`/users/${id}`)
      } else {
        router.push(`/users/${id}`)
      }
    }

    return { inputId, goToUser }
  }
}
