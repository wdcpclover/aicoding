import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  data() {
    return {
      // 一、基础事件
      childMsg: '等待子组件消息...',
      // 二、交互触发
      count: 0,
      // 三、多参数
      submitResult: null,
      // 四、v-model 双向绑定
      text: '试试在子组件中修改我'
    }
  },
  methods: {
    handleSubmit: function (name, score, level) {
      this.submitResult = { name: name, score: score, level: level }
    }
  }
}
