export default {
  data() {
    return {
      // 1. 文本插值
      message: 'Hello Vue 3!',
      // 2. 原始 HTML
      rawHtml: '<span style="color: red">这是红色的 HTML</span>',
      // 3. 条件渲染
      seen: true,
      // 4. 表达式
      number: 10,
      ok: true,
      // 5. reactive 对象
      counter: { count: 0 },
      // 6. 动态绑定多个属性
      objectOfAttrs: {
        id: 'my-container',
        class: 'wrapper',
        style: 'background-color: #e8f5e9; padding: 8px; border-radius: 4px'
      },
      // 7. Attribute 绑定
      dynamicId: 'special-id',
      isButtonDisabled: false,
      url: 'https://vuejs.org'
    }
  },
  methods: {
    toggleSeen() {
      this.seen = !this.seen
    },
    toggleButton() {
      this.isButtonDisabled = !this.isButtonDisabled
    },
    increment() {
      this.counter.count++
    }
  }
}
