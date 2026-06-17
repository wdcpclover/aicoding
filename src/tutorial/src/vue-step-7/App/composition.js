import { ref, computed } from 'vue'

export default {
  setup() {
    // ============================
    // 一、v-for 遍历数组 — Todo List
    // ============================
    let todoId = 0
    const newTodo = ref('')
    const todos = ref([
      { id: todoId++, text: '学习 HTML', done: true },
      { id: todoId++, text: '学习 JavaScript', done: false },
      { id: todoId++, text: '学习 Vue', done: false }
    ])

    function addTodo() {
      todos.value.push({ id: todoId++, text: newTodo.value, done: false })
      newTodo.value = ''
    }

    function removeTodo(todo) {
      todos.value = todos.value.filter(t => t !== todo)
    }

    // ============================
    // 二、v-for 遍历对象
    // ============================
    const userProfile = ref({
      姓名: '张三',
      年龄: 25,
      城市: '北京',
      职业: '前端工程师'
    })

    // ============================
    // 三、key 的重要性演示
    // ============================
    let keyDemoId = 0
    const keyDemoItems = ref([
      { id: keyDemoId++, label: 'A' },
      { id: keyDemoId++, label: 'B' },
      { id: keyDemoId++, label: 'C' }
    ])

    function insertAtStart() {
      const letter = String.fromCharCode(65 + keyDemoId)
      keyDemoItems.value.unshift({ id: keyDemoId++, label: letter })
    }

    // ============================
    // 四、数组变更方法
    // ============================
    const initialFruits = ['🍎 苹果', '🍌 香蕉', '🍊 橙子']
    const fruits = ref([...initialFruits])

    function resetFruits() {
      fruits.value = [...initialFruits]
    }

    // ============================
    // 五、过滤与排序（计算属性）
    // ============================
    const numbers = ref([3, 1, 4, 1, 5, 9, 2, 6])
    const sortDir = ref('asc')

    // 用 computed 过滤，不修改原数组
    const evenNumbers = computed(() => {
      return numbers.value.filter(n => n % 2 === 0)
    })

    // 用 computed 排序，先拷贝再 sort，不修改原数组
    const sortedNumbers = computed(() => {
      return [...numbers.value].sort((a, b) =>
        sortDir.value === 'asc' ? a - b : b - a
      )
    })

    return {
      newTodo,
      todos,
      addTodo,
      removeTodo,
      userProfile,
      keyDemoItems,
      insertAtStart,
      fruits,
      resetFruits,
      numbers,
      sortDir,
      evenNumbers,
      sortedNumbers
    }
  }
}
