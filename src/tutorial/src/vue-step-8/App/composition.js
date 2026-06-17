import { ref } from 'vue'

export default {
  setup() {
    // ============================
    // 一、内联事件处理器
    // ============================
    const count = ref(0)

    // ============================
    // 二、方法事件处理器
    // ============================
    const greetInfo = ref('')

    // 方法处理器：只写方法名，event 自动传入
    function greet(event) {
      greetInfo.value = [
        'Hello Vue.js!',
        '触发元素: ' + event.target.tagName,
        '坐标: (' + event.clientX + ', ' + event.clientY + ')'
      ].join(' | ')
    }

    // ============================
    // 三、传递参数与 $event
    // ============================
    const sayInfo = ref('')

    function say(message) {
      sayInfo.value = '收到消息: ' + message
    }

    function sayWithEvent(message, event) {
      sayInfo.value = message + ' | 元素: ' + event.target.tagName + ' | 坐标: (' + event.clientX + ', ' + event.clientY + ')'
    }

    // ============================
    // 四、事件修饰符
    // ============================

    // .stop 冒泡演示
    const bubbleLog = ref([])
    function onBubble(source) {
      bubbleLog.value.push('→ ' + source + ' 触发了 click')
    }

    // .prevent 表单提交
    const formText = ref('')
    const submitInfo = ref('')
    function onSubmit() {
      submitInfo.value = '表单已提交，内容: "' + formText.value + '"（.prevent 阻止了页面刷新）'
    }

    // .once
    const onceMsg = ref('')

    // .self
    const selfMsg = ref('')

    // ============================
    // 五、按键修饰符
    // ============================
    const keyMsg = ref('')

    // ============================
    // 六、鼠标按键修饰符
    // ============================
    const mouseMsg = ref('')

    return {
      count,
      greetInfo,
      greet,
      sayInfo,
      say,
      sayWithEvent,
      bubbleLog,
      onBubble,
      formText,
      submitInfo,
      onSubmit,
      onceMsg,
      selfMsg,
      keyMsg,
      mouseMsg
    }
  }
}
