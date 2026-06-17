import { ref, reactive } from 'vue'

export default {
  setup() {
    // 1. ref：适用于任何值类型
    const message = ref('Hello Vue 3!')
    const rawHtml = ref('<span style="color: red">这是红色的 HTML</span>')
    const seen = ref(true)
    const number = ref(10)
    const ok = ref(true)

    // 2. reactive：适用于对象
    const counter = reactive({ count: 0 })
    const objectOfAttrs = reactive({
      id: 'my-container',
      class: 'wrapper',
      style: 'background-color: #e8f5e9; padding: 8px; border-radius: 4px'
    })

    // 3. Attribute 绑定
    const dynamicId = ref('special-id')
    const isButtonDisabled = ref(false)
    const url = ref('https://vuejs.org')

    // 4. 方法
    function toggleSeen() {
      seen.value = !seen.value
    }

    function toggleButton() {
      isButtonDisabled.value = !isButtonDisabled.value
    }

    function increment() {
      counter.count++
    }

    return {
      message,
      rawHtml,
      seen,
      number,
      ok,
      counter,
      objectOfAttrs,
      dynamicId,
      isButtonDisabled,
      url,
      toggleSeen,
      toggleButton,
      increment
    }
  }
}
