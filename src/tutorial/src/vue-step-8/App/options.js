export default {
  data() {
    return {
      // 一、内联处理器
      count: 0,
      // 二、方法处理器
      greetInfo: '',
      // 三、传参
      sayInfo: '',
      // 四、事件修饰符
      bubbleLog: [],
      formText: '',
      submitInfo: '',
      onceMsg: '',
      selfMsg: '',
      // 五、按键修饰符
      keyMsg: '',
      // 六、鼠标修饰符
      mouseMsg: ''
    }
  },
  methods: {
    // 二、方法处理器：event 自动传入
    greet(event) {
      this.greetInfo = [
        'Hello Vue.js!',
        '触发元素: ' + event.target.tagName,
        '坐标: (' + event.clientX + ', ' + event.clientY + ')'
      ].join(' | ')
    },

    // 三、传参
    say(message) {
      this.sayInfo = '收到消息: ' + message
    },
    sayWithEvent(message, event) {
      this.sayInfo = message + ' | 元素: ' + event.target.tagName + ' | 坐标: (' + event.clientX + ', ' + event.clientY + ')'
    },

    // 四、事件修饰符
    onBubble(source) {
      this.bubbleLog.push('→ ' + source + ' 触发了 click')
    },
    onSubmit() {
      this.submitInfo = '表单已提交，内容: "' + this.formText + '"（.prevent 阻止了页面刷新）'
    }
  }
}
