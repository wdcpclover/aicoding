export default {
  methods: {
    goNext() {
      const nextId = Number(this.$route.params.id) + 1
      this.$router.push(`/users/${nextId}`)
    }
  }
}
