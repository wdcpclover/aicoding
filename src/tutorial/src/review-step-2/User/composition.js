import { useRoute, useRouter } from 'vue-router'

export default {
  // props: true → 动态参数 :id 直接作为 prop 进来
  props: {
    id: { type: [String, Number], required: true }
  },
  setup(props) {
    const route = useRoute()   // 读当前路由信息（params / query）
    const router = useRouter() // 编程式导航

    // 跳到下一个用户：router.push（编程式）
    function next() {
      router.push(`/users/${Number(props.id) + 1}`)
    }
    function goHome() {
      router.push({ name: 'home' }) // 也可用命名路由
    }

    return { props, route, next, goHome }
  }
}
