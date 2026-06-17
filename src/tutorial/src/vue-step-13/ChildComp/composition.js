import { computed } from 'vue'

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
  setup(props) {
    var level = computed(function () {
      if (props.score >= 90) return '优秀 🌟'
      if (props.score >= 70) return '良好 👍'
      if (props.score >= 60) return '及格 ✅'
      return '需努力 💪'
    })

    return {
      level
    }
  }
}
