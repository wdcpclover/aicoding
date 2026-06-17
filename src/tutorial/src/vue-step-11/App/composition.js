import { ref, reactive, watch } from 'vue'

export default {
  setup() {
    // === 一、基础侦听 ===
    var question = ref('')
    var answer = ref('等待你提问...')
    var answerTimer = null

    watch(question, function (newQ, oldQ) {
      if (answerTimer) clearTimeout(answerTimer)
      if (newQ.indexOf('?') > -1 || newQ.indexOf('\uff1f') > -1) {
        answer.value = '思考中...'
        answerTimer = setTimeout(function () {
          answer.value = '答案是 42！（问题从 "' + (oldQ || '空') + '" 变为 "' + newQ + '"）'
        }, 1000)
      } else if (newQ) {
        answer.value = '问题通常包含一个问号（?）'
      } else {
        answer.value = '等待你提问...'
      }
    })

    // === 二、新值与旧值 ===
    var count = ref(0)
    var countLog = ref([])

    watch(count, function (newVal, oldVal) {
      countLog.value.push('count: ' + oldVal + ' \u2192 ' + newVal)
    })

    // === 三、深层侦听 ===
    var user = reactive({ name: '张三', age: 25 })
    var userLog = ref([])

    watch(user, function (newVal) {
      userLog.value.push('变化: { name: "' + newVal.name + '", age: ' + newVal.age + ' }')
    }, { deep: true })

    // === 四、即时执行 ===
    var todoId = ref(1)
    var todoData = ref(null)

    watch(todoId, function (id) {
      todoData.value = null
      // 模拟 API 请求
      setTimeout(function () {
        todoData.value = {
          id: id,
          title: '待办事项 #' + id + '：' + ['学习 Vue 基础', '练习组合式 API', '理解响应式原理', '掌握组件通信', '构建实战项目'][((id - 1) % 5)],
          completed: id % 3 === 0
        }
      }, 500)
    }, { immediate: true })

    // === 五、停止侦听 ===
    var stopCount = ref(0)
    var watcherStopped = ref(false)
    var stopLog = ref([])

    var unwatch = watch(stopCount, function (newVal, oldVal) {
      stopLog.value.push('stopCount: ' + oldVal + ' \u2192 ' + newVal)
    })

    function stopWatcher() {
      unwatch()
      watcherStopped.value = true
    }

    return {
      question,
      answer,
      count,
      countLog,
      user,
      userLog,
      todoId,
      todoData,
      stopCount,
      watcherStopped,
      stopLog,
      stopWatcher
    }
  }
}
