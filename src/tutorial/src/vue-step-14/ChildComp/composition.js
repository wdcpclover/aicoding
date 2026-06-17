import { ref } from 'vue'

export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['response', 'increment', 'submit', 'update:modelValue'],
  setup(props, { emit }) {
    // 一、创建时自动触发
    emit('response', '你好，我是子组件！')

    // 三、多参数表单
    var formName = ref('张三')
    var formScore = ref(85)

    function handleSubmit() {
      var level = formScore.value >= 90 ? '优秀' : formScore.value >= 70 ? '良好' : formScore.value >= 60 ? '及格' : '需努力'
      emit('submit', formName.value, formScore.value, level)
    }

    return {
      formName,
      formScore,
      handleSubmit
    }
  }
}
