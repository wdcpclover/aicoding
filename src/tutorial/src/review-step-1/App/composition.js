import { ref, reactive, computed, watch, onMounted } from 'vue'
import TodoItem from './TodoItem.vue'

export default {
  components: { TodoItem },
  setup() {
    // ① ref：基本类型响应式
    const title = ref('Vue 复习')
    const input = ref('')

    // ② reactive：对象响应式
    const stats = reactive({ created: 0 })

    // ③ 列表数据
    const todos = ref([
      { id: 1, text: '复习响应式 ref / reactive', done: true },
      { id: 2, text: '复习 computed 计算属性', done: false },
      { id: 3, text: '复习 v-for / v-if', done: false }
    ])
    let nextId = 4

    // ④ computed：派生数据（依赖变了自动重算）
    const remaining = computed(() => todos.value.filter(t => !t.done).length)
    const allDone = computed(() => todos.value.length > 0 && remaining.value === 0)

    // ⑤ 方法 + 事件
    function add() {
      const text = input.value.trim()
      if (!text) return
      todos.value.push({ id: nextId++, text, done: false })
      stats.created++
      input.value = ''
    }
    function toggle(id) {
      const t = todos.value.find(t => t.id === id)
      if (t) t.done = !t.done
    }
    function remove(id) {
      todos.value = todos.value.filter(t => t.id !== id)
    }

    // ⑥ watch：侦听变化做副作用
    watch(remaining, (n) => {
      console.log('剩余未完成：', n)
    })

    // ⑦ 生命周期
    onMounted(() => console.log('组件挂载完成 onMounted'))

    return { title, input, stats, todos, remaining, allDone, add, toggle, remove }
  }
}
