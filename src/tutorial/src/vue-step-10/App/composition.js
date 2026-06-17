import { ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated } from 'vue'
import ChildComp from './ChildComp.vue'

// 防递归标志（非响应式）
// 更新钩子中 addLog 会修改 logs → 再次触发更新 → 无限循环
// 用标志位跳过由日志写入引发的二次更新
var _skipUpdate = true

export default {
  components: {
    ChildComp
  },
  setup() {
    var logs = ref([])
    var count = ref(0)
    var showChild = ref(false)

    function addLog(source, hook) {
      var time = new Date().toLocaleTimeString()
      var entry = '[' + time + '] ' + source + ' \u2192 ' + hook
      logs.value.push(entry)
      console.log(entry)
    }

    function clearLogs() {
      logs.value = []
    }

    // === 创建阶段 ===
    addLog('App', 'setup() \u6267\u884c (= beforeCreate + created)')

    // === 挂载阶段 ===
    onBeforeMount(function () {
      addLog('App', 'onBeforeMount')
    })

    onMounted(function () {
      addLog('App', 'onMounted \u2705 DOM \u5df2\u5c31\u7eea')
      // 初始挂载完成后，开启更新钩子的日志记录
      setTimeout(function () { _skipUpdate = false }, 100)
    })

    // === 更新阶段（防递归） ===
    onBeforeUpdate(function () {
      if (_skipUpdate) return
      addLog('App', 'onBeforeUpdate')
    })

    onUpdated(function () {
      if (_skipUpdate) return
      _skipUpdate = true
      addLog('App', 'onUpdated \u2705 DOM \u5df2\u66f4\u65b0')
      setTimeout(function () { _skipUpdate = false }, 50)
    })

    return {
      logs,
      count,
      showChild,
      addLog,
      clearLogs
    }
  }
}
