export default {
  methods: {
    go(id) {
      // 用 name 跳转：就算后面改了 path，代码也不用改
      this.$router.push({ name: 'user-detail', params: { id } })
    }
  }
}
