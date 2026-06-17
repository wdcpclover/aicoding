import { onMounted, onBeforeUnmount, onUnmounted } from 'vue'

export default {
  props: {
    addLog: Function
  },
  setup(props) {
    console.log('[\u5b50\u7ec4\u4ef6] setup() \u6267\u884c')

    // 子组件的创建+挂载日志统一在 onMounted 中写入
    // 避免在父组件渲染期间修改父组件的响应式状态
    onMounted(function () {
      props.addLog('\u5b50\u7ec4\u4ef6', 'setup() (= beforeCreate + created)')
      props.addLog('\u5b50\u7ec4\u4ef6', 'onBeforeMount')
      props.addLog('\u5b50\u7ec4\u4ef6', 'onMounted \u2705 DOM \u5df2\u5c31\u7eea')
    })

    onBeforeUnmount(function () {
      props.addLog('\u5b50\u7ec4\u4ef6', 'onBeforeUnmount \u26a0\ufe0f \u5373\u5c06\u5378\u8f7d')
    })

    onUnmounted(function () {
      props.addLog('\u5b50\u7ec4\u4ef6', 'onUnmounted \u274c \u5df2\u9500\u6bc1')
    })
  }
}
