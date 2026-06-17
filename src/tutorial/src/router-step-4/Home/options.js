export default {
  data() {
    return {
      inputId: ''
    }
  },
  methods: {
    goToUser(id, replace = false) {
      if (!id) return
      // 选项式：通过 this.$router 访问
      if (replace) {
        this.$router.replace(`/users/${id}`)
      } else {
        this.$router.push(`/users/${id}`)
      }
    }
  }
}
