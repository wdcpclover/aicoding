export default {
  props: {
    msg: {
      type: String,
      default: '没有传入消息'
    },
    score: {
      type: Number,
      default: 0
    }
  },
  computed: {
    level: function () {
      if (this.score >= 90) return '优秀 🌟'
      if (this.score >= 70) return '良好 👍'
      if (this.score >= 60) return '及格 ✅'
      return '需努力 💪'
    }
  }
}
