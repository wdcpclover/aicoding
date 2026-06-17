export default {
  props: {
    addLog: Function
  },
  beforeCreate() {
    console.log('[\u5b50\u7ec4\u4ef6] beforeCreate')
  },
  mounted() {
    this.addLog('\u5b50\u7ec4\u4ef6', 'beforeCreate + created (\u5df2\u89e6\u53d1)')
    this.addLog('\u5b50\u7ec4\u4ef6', 'beforeMount')
    this.addLog('\u5b50\u7ec4\u4ef6', 'mounted \u2705 DOM \u5df2\u5c31\u7eea')
  },
  beforeUnmount() {
    this.addLog('\u5b50\u7ec4\u4ef6', 'beforeUnmount \u26a0\ufe0f \u5373\u5c06\u5378\u8f7d')
  },
  unmounted() {
    this.addLog('\u5b50\u7ec4\u4ef6', 'unmounted \u274c \u5df2\u9500\u6bc1')
  }
}
