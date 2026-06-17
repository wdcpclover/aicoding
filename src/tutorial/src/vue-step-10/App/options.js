import ChildComp from './ChildComp.vue'

// 防递归标志（非响应式）
var _skipUpdate = true

export default {
  components: {
    ChildComp
  },
  data() {
    return {
      logs: [],
      count: 0,
      showChild: false
    }
  },
  methods: {
    addLog(source, hook) {
      var time = new Date().toLocaleTimeString()
      var entry = '[' + time + '] ' + source + ' \u2192 ' + hook
      this.logs.push(entry)
      console.log(entry)
    },
    clearLogs() {
      this.logs = []
    }
  },
  beforeCreate() {
    console.log('[App] beforeCreate \u2014 data/methods \u5c1a\u672a\u521d\u59cb\u5316\uff0c\u53ea\u80fd console.log')
  },
  created() {
    this.addLog('App', 'beforeCreate (\u5df2\u89e6\u53d1\uff0cdata\u4e0d\u53ef\u7528\uff0c\u89c1\u63a7\u5236\u53f0)')
    this.addLog('App', 'created \u2705 data \u5df2\u5c31\u7eea')
  },
  beforeMount() {
    this.addLog('App', 'beforeMount')
  },
  mounted() {
    this.addLog('App', 'mounted \u2705 DOM \u5df2\u5c31\u7eea')
    setTimeout(function () { _skipUpdate = false }, 100)
  },
  beforeUpdate() {
    if (_skipUpdate) return
    this.addLog('App', 'beforeUpdate')
  },
  updated() {
    if (_skipUpdate) return
    _skipUpdate = true
    this.addLog('App', 'updated \u2705 DOM \u5df2\u66f4\u65b0')
    setTimeout(function () { _skipUpdate = false }, 50)
  }
}
