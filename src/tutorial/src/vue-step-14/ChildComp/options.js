export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['response', 'increment', 'submit', 'update:modelValue'],
  data() {
    return {
      formName: '张三',
      formScore: 85
    }
  },
  created() {
    // 一、创建时自动触发
    this.$emit('response', '你好，我是子组件！')
  },
  methods: {
    handleSubmit: function () {
      var level = this.formScore >= 90 ? '优秀' : this.formScore >= 70 ? '良好' : this.formScore >= 60 ? '及格' : '需努力'
      this.$emit('submit', this.formName, this.formScore, level)
    }
  }
}
