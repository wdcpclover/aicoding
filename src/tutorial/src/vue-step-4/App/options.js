export default {
  data() {
    return {
      // ============================
      // 一、data() — 声明响应式状态
      // ============================
      // data() 必须是函数，返回一个对象
      // 所有属性通过 this 访问
      count: 0,
      message: 'Hello Vue!',

      // ============================
      // 二、配合 methods 使用
      // ============================
      state: {
        name: 'Vue 3',
        version: 3
      },

      // ============================
      // 三、深层响应性
      // ============================
      // 嵌套对象和数组也是响应式的
      obj: {
        nested: { count: 0 },
        arr: ['foo', 'bar']
      },

      // ============================
      // 四、DOM 更新时机
      // ============================
      domMsg: '点击按钮测试',
      domLogs: []
    }
  },
  methods: {
    // methods 中的 this 自动指向组件实例
    // ⚠️ 不要用箭头函数，否则 this 不正确！

    increment() {
      this.count++
    },

    updateState() {
      this.state.name = this.state.name === 'Vue 3' ? 'Vue.js' : 'Vue 3'
      this.state.version++
    },

    mutateDeeply() {
      // 嵌套属性变化 → 自动触发更新
      this.obj.nested.count++
      // 数组变化 → 也会触发更新
      this.obj.arr.push('item-' + this.obj.arr.length)
    },

    resetObj() {
      this.obj = {
        nested: { count: 0 },
        arr: ['foo', 'bar']
      }
    },

    async testNextTick() {
      const { nextTick } = await import('vue')
      this.domLogs = []

      // 步骤1：修改数据
      this.domMsg = '已更新! (' + new Date().toLocaleTimeString() + ')'

      // 步骤2：立即读取 DOM（此时 DOM 还未更新）
      const el = document.getElementById('dom-msg')
      const beforeText = el ? el.textContent : ''
      this.domLogs.push({
        text: '① 修改后立即读取 DOM: "' + beforeText + '"',
        color: '#e65100'
      })

      // 步骤3：等待 nextTick
      await nextTick()

      // 步骤4：再次读取 DOM（此时 DOM 已更新）
      const afterText = el ? el.textContent : ''
      this.domLogs.push({
        text: '② nextTick 后读取 DOM: "' + afterText + '"',
        color: '#2e7d32'
      })

      this.domLogs.push({
        text: '→ 结论：修改数据后 DOM 不会立即更新，需要 await nextTick()',
        color: '#1565c0'
      })
    }
  }
}
