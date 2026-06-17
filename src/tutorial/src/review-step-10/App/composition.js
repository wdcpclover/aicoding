import { ref, computed } from 'vue'

export default {
  setup() {
    // 试卷要求的 10 个文件 + 分值（A 卷为例）
    const files = ref([
      { name: 'main.js',                          score: 5,  done: false, note: 'createApp + use(pinia) + use(router) + mount' },
      { name: 'App.vue',                          score: 5,  done: false, note: '基本布局 + <router-view>' },
      { name: 'store/activity.js',                score: 15, done: false, note: 'state/getter/action，请求数据 + 报名' },
      { name: 'router/index.js',                  score: 10, done: false, note: '路由表 + beforeEach 登录守卫' },
      { name: 'views/ActivityView.vue',           score: 10, done: false, note: '列表 + 搜索框' },
      { name: 'views/LoginView.vue',              score: 10, done: false, note: '学号/密码表单 + 存 token' },
      { name: 'views/ActivityDetailView.vue',     score: 10, done: false, note: '按 :id 拉详情 + 报名' },
      { name: 'components/ActivityCard.vue',      score: 10, done: false, note: 'props 接收数据 + emit 点击' },
      { name: 'server/index.js',                  score: 15, done: false, note: 'Express + cors + json + 路由' },
      { name: 'config/database.js',               score: 10, done: false, note: 'MySQL 连接配置（连接池）' }
    ])

    const totalScore = computed(() =>
      files.value.reduce((s, f) => s + f.score, 0))
    const doneScore = computed(() =>
      files.value.filter(f => f.done).reduce((s, f) => s + f.score, 0))
    const percent = computed(() =>
      Math.round(doneScore.value / totalScore.value * 100))

    function reset() {
      files.value.forEach(f => (f.done = false))
    }

    return { files, totalScore, doneScore, percent, reset }
  }
}
