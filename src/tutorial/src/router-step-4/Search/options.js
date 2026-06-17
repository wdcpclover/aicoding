export default {
  data() {
    return {
      keyword: this.$route.query.q || ''
    }
  },
  methods: {
    search() {
      // 传对象形式：可以同时指定 path 和 query
      this.$router.push({
        path: '/search',
        query: { q: this.keyword }
      })
    }
  }
}
