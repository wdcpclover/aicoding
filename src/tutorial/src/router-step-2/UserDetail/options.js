const database = {
  1: { name: '张三' },
  2: { name: '李四' },
  3: { name: '王五' }
}

export default {
  data() {
    return {
      visitCount: 1
    }
  },
  computed: {
    // 选项式：直接用 this.$route 访问
    id() {
      return this.$route.params.id
    },
    user() {
      return database[this.id]
    }
  },
  watch: {
    // 同一个路由复用组件时，需要监听 $route 来响应参数变化
    '$route.params.id'() {
      this.visitCount++
    }
  }
}
