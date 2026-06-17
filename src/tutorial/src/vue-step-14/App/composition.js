import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    // 一、基础事件
    var childMsg = ref('等待子组件消息...')

    // 二、交互触发
    var count = ref(0)

    // 三、多参数
    var submitResult = ref(null)

    // 四、v-model 双向绑定
    var text = ref('试试在子组件中修改我')

    function handleSubmit(name, score, level) {
      submitResult.value = { name: name, score: score, level: level }
    }

    return {
      childMsg,
      count,
      submitResult,
      text,
      handleSubmit
    }
  }
}
