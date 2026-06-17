import { ref, reactive, nextTick } from 'vue'

export default {
  setup() {
    // ============================
    // 一、ref() — 声明响应式变量
    // ============================
    // ref() 可以持有任意类型的值
    // JS 中通过 .value 读写，模板中自动解包
    const count = ref(0)
    const message = ref('Hello Vue!')

    function increment() {
      // JS 中必须用 .value
      count.value++
    }

    // ============================
    // 二、reactive() — 对象响应式
    // ============================
    // reactive() 只能用于对象类型
    // 直接修改属性，不需要 .value
    const state = reactive({
      name: 'Vue 3',
      version: 3
    })

    function updateState() {
      // 直接修改属性即可
      state.name = state.name === 'Vue 3' ? 'Vue.js' : 'Vue 3'
      state.version++
    }

    // ============================
    // 三、深层响应性
    // ============================
    // ref 内部的嵌套对象和数组也是响应式的
    const obj = ref({
      nested: { count: 0 },
      arr: ['foo', 'bar']
    })

    function mutateDeeply() {
      // 嵌套属性变化 → 自动触发更新
      obj.value.nested.count++
      // 数组变化 → 也会触发更新
      obj.value.arr.push('item-' + obj.value.arr.length)
    }

    function resetObj() {
      // 整体替换 ref 的值（这是 ref 相比 reactive 的优势）
      obj.value = {
        nested: { count: 0 },
        arr: ['foo', 'bar']
      }
    }

    // ============================
    // 四、DOM 更新时机 — nextTick
    // ============================
    const domMsg = ref('点击按钮测试')
    const domLogs = ref([])

    async function testNextTick() {
      domLogs.value = []

      // 步骤1：修改数据
      domMsg.value = '已更新! (' + new Date().toLocaleTimeString() + ')'

      // 步骤2：立即读取 DOM（此时 DOM 还未更新）
      const el = document.getElementById('dom-msg')
      const beforeText = el ? el.textContent : ''
      domLogs.value.push({
        text: '① 修改后立即读取 DOM: "' + beforeText + '"',
        color: '#e65100'
      })

      // 步骤3：等待 nextTick
      await nextTick()

      // 步骤4：再次读取 DOM（此时 DOM 已更新）
      const afterText = el ? el.textContent : ''
      domLogs.value.push({
        text: '② nextTick 后读取 DOM: "' + afterText + '"',
        color: '#2e7d32'
      })

      domLogs.value.push({
        text: '→ 结论：修改数据后 DOM 不会立即更新，需要 await nextTick()',
        color: '#1565c0'
      })
    }

    return {
      count,
      message,
      increment,
      state,
      updateState,
      obj,
      mutateDeeply,
      resetObj,
      domMsg,
      domLogs,
      testNextTick
    }
  }
}
