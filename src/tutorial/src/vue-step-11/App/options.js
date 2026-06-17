export default {
  data() {
    return {
      // 一、基础侦听
      question: '',
      answer: '等待你提问...',
      // 二、新值与旧值
      count: 0,
      countLog: [],
      // 三、深层侦听
      user: { name: '张三', age: 25 },
      userLog: [],
      // 四、即时执行
      todoId: 1,
      todoData: null,
      // 五、停止侦听
      stopCount: 0,
      watcherStopped: false,
      stopLog: []
    }
  },
  watch: {
    // 一、基础侦听
    question: function (newQ, oldQ) {
      var self = this
      if (this._answerTimer) clearTimeout(this._answerTimer)
      if (newQ.indexOf('?') > -1 || newQ.indexOf('\uff1f') > -1) {
        this.answer = '思考中...'
        this._answerTimer = setTimeout(function () {
          self.answer = '答案是 42！（问题从 "' + (oldQ || '空') + '" 变为 "' + newQ + '"）'
        }, 1000)
      } else if (newQ) {
        this.answer = '问题通常包含一个问号（?）'
      } else {
        this.answer = '等待你提问...'
      }
    },
    // 二、新值与旧值
    count: function (newVal, oldVal) {
      this.countLog.push('count: ' + oldVal + ' \u2192 ' + newVal)
    },
    // 三、深层侦听（对象写法）
    user: {
      handler: function (newVal) {
        this.userLog.push('变化: { name: "' + newVal.name + '", age: ' + newVal.age + ' }')
      },
      deep: true
    },
    // 四、即时执行
    todoId: {
      handler: function (id) {
        var self = this
        this.todoData = null
        // 模拟 API 请求
        setTimeout(function () {
          self.todoData = {
            id: id,
            title: '待办事项 #' + id + '：' + ['学习 Vue 基础', '练习选项式 API', '理解响应式原理', '掌握组件通信', '构建实战项目'][((id - 1) % 5)],
            completed: id % 3 === 0
          }
        }, 500)
      },
      immediate: true
    }
  },
  created() {
    // 五、停止侦听：用 this.$watch 创建可停止的侦听器
    var self = this
    this._unwatch = this.$watch('stopCount', function (newVal, oldVal) {
      self.stopLog.push('stopCount: ' + oldVal + ' \u2192 ' + newVal)
    })
  },
  methods: {
    stopWatcher: function () {
      if (this._unwatch) {
        this._unwatch()
        this.watcherStopped = true
      }
    }
  }
}
