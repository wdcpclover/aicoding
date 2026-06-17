let todoId = 0
let keyDemoId = 0
const initialFruits = ['🍎 苹果', '🍌 香蕉', '🍊 橙子']

export default {
  data() {
    return {
      // 一、Todo List
      newTodo: '',
      todos: [
        { id: todoId++, text: '学习 HTML', done: true },
        { id: todoId++, text: '学习 JavaScript', done: false },
        { id: todoId++, text: '学习 Vue', done: false }
      ],

      // 二、遍历对象
      userProfile: {
        姓名: '张三',
        年龄: 25,
        城市: '北京',
        职业: '前端工程师'
      },

      // 三、key 演示
      keyDemoItems: [
        { id: keyDemoId++, label: 'A' },
        { id: keyDemoId++, label: 'B' },
        { id: keyDemoId++, label: 'C' }
      ],

      // 四、数组变更方法
      fruits: [...initialFruits],

      // 五、过滤与排序
      numbers: [3, 1, 4, 1, 5, 9, 2, 6],
      sortDir: 'asc'
    }
  },
  computed: {
    evenNumbers() {
      return this.numbers.filter(n => n % 2 === 0)
    },
    sortedNumbers() {
      return [...this.numbers].sort((a, b) =>
        this.sortDir === 'asc' ? a - b : b - a
      )
    }
  },
  methods: {
    addTodo() {
      this.todos.push({ id: todoId++, text: this.newTodo, done: false })
      this.newTodo = ''
    },
    removeTodo(todo) {
      this.todos = this.todos.filter(t => t !== todo)
    },
    insertAtStart() {
      const letter = String.fromCharCode(65 + keyDemoId)
      this.keyDemoItems.unshift({ id: keyDemoId++, label: letter })
    },
    resetFruits() {
      this.fruits = [...initialFruits]
    }
  }
}
