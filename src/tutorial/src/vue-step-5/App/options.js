export default {
  data() {
    return {
      // 一、基础计算属性
      author: {
        name: 'John Doe',
        books: ['Vue 3 Guide', 'Vue 4 Mystery']
      },
      newBookTitle: '',

      // 二、缓存 vs 方法
      renderTrigger: 0,

      // 三、可写计算属性
      firstName: 'John',
      lastName: 'Doe',

      // 四、获取上一个值
      count: 0
    }
  },
  computed: {
    // 一、基础计算属性
    hasBooks() {
      return this.author.books.length > 0 ? 'Yes' : 'No'
    },
    bookCount() {
      return this.author.books.length
    },

    // 二、缓存演示
    // 只有 books 变化时才重新执行，其他渲染时返回缓存
    computedBookInfo() {
      console.log('📦 [computed] getter 被执行了！')
      return this.author.books.length + ' 本书'
    },

    // 三、可写计算属性（getter + setter）
    fullName: {
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(newValue) {
        const parts = newValue.split(' ')
        this.firstName = parts[0] || ''
        this.lastName = parts.slice(1).join(' ') || ''
      }
    },

    // 四、获取上一个值
    // count ≤ 3 时返回 count，否则保持上一个值
    alwaysSmall(_, previous) {
      if (this.count <= 3) {
        return this.count
      }
      return previous
    }
  },
  methods: {
    addBook() {
      if (this.newBookTitle.trim()) {
        this.author.books.push(this.newBookTitle.trim())
        this.newBookTitle = ''
      }
    },

    // 二、方法——每次渲染都重新执行（没有缓存）
    methodBookInfo() {
      console.log('🔧 [method] 函数被调用了！')
      return this.author.books.length + ' 本书'
    },

    setFullName() {
      this.fullName = 'Li Ming'
    }
  }
}
