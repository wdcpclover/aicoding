import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    // 一、基础 props
    var greeting = ref('你好，我是来自父组件的消息！')

    // 二、动态 props
    var dynamicMsg = ref('试试修改这段文字')

    // 三、带默认值的 props
    var score = ref(85)
    var showScore = ref(true)

    return {
      greeting,
      dynamicMsg,
      score,
      showScore
    }
  }
}
