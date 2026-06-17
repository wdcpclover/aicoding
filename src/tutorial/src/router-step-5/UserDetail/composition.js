import { computed } from 'vue'

const database = {
  1: { name: '张三' },
  2: { name: '李四' }
}

export default {
  // 通过 props 接收路由参数（router.js 里配了 props: true）
  props: {
    id: String
  },
  setup(props) {
    const user = computed(() => database[props.id])
    return { user }
  }
}
