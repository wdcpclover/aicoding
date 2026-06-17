const database = {
  1: { name: '张三' },
  2: { name: '李四' }
}

export default {
  // 通过 props 接收路由参数（router.js 里配了 props: true）
  props: {
    id: String
  },
  computed: {
    user() {
      return database[this.id]
    }
  }
}
