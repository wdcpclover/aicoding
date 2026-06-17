import { ref } from 'vue'

export default {
  setup() {
    // ============================
    // 一、v-if / v-else
    // ============================
    const awesome = ref(true)

    // ============================
    // 二、v-else-if 多条件分支
    // ============================
    // 用分数来演示多分支条件，比 A/B/C/D 更直观
    const score = ref(75)

    // ============================
    // 三、template 上的 v-if
    // ============================
    const showDetail = ref(true)
    const userName = ref('张三')
    const userRole = ref('前端开发')

    // ============================
    // 四、v-show
    // ============================
    const showNotice = ref(true)

    // ============================
    // 五、v-if vs v-show 对比
    // ============================
    const compareVisible = ref(true)

    return {
      awesome,
      score,
      showDetail,
      userName,
      userRole,
      showNotice,
      compareVisible
    }
  }
}
