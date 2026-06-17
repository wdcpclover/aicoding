import { ref, reactive, computed } from 'vue'

export default {
  setup() {
    // ============================
    // 一、基础计算属性
    // ============================
    const author = reactive({
      name: 'John Doe',
      books: ['Vue 3 Guide', 'Vue 4 Mystery']
    })

    // computed 返回一个 ref，依赖 author.books
    const hasBooks = computed(() => {
      return author.books.length > 0 ? 'Yes' : 'No'
    })

    const bookCount = computed(() => author.books.length)

    const newBookTitle = ref('')

    function addBook() {
      if (newBookTitle.value.trim()) {
        author.books.push(newBookTitle.value.trim())
        newBookTitle.value = ''
      }
    }

    // ============================
    // 二、缓存 vs 方法
    // ============================
    // 用于触发重新渲染（不影响 books 依赖）
    const renderTrigger = ref(0)

    // computed：依赖是 author.books.length
    // 只有 books 变化时才重新执行，其他渲染时返回缓存
    const computedBookInfo = computed(() => {
      console.log('📦 [computed] getter 被执行了！')
      return author.books.length + ' 本书'
    })

    // method：每次组件渲染都会重新执行
    function methodBookInfo() {
      console.log('🔧 [method] 函数被调用了！')
      return author.books.length + ' 本书'
    }

    // ============================
    // 三、可写计算属性
    // ============================
    const firstName = ref('John')
    const lastName = ref('Doe')

    const fullName = computed({
      get() {
        return firstName.value + ' ' + lastName.value
      },
      set(newValue) {
        const parts = newValue.split(' ')
        firstName.value = parts[0] || ''
        lastName.value = parts.slice(1).join(' ') || ''
      }
    })

    function setFullName() {
      fullName.value = 'Li Ming'
    }

    // ============================
    // 四、获取上一个值 (3.4+)
    // ============================
    const count = ref(0)

    // count ≤ 3 时返回 count，否则保持上一个值
    const alwaysSmall = computed((previous) => {
      if (count.value <= 3) {
        return count.value
      }
      return previous
    })

    return {
      author,
      hasBooks,
      bookCount,
      newBookTitle,
      addBook,
      renderTrigger,
      computedBookInfo,
      methodBookInfo,
      firstName,
      lastName,
      fullName,
      setFullName,
      count,
      alwaysSmall
    }
  }
}
