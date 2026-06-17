import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  data() {
    return {
      // 一、基础 props
      greeting: '你好，我是来自父组件的消息！',
      // 二、动态 props
      dynamicMsg: '试试修改这段文字',
      // 三、带默认值的 props
      score: 85,
      showScore: true
    }
  }
}
