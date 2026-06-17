import { inject } from 'vue'

export default {
  setup() {
    // 从祖先组件注入数据，跳过了中间的 ChildComp
    var themeColor = inject('themeColor', '#333')
    var userName = inject('userName', '匿名')

    return {
      themeColor,
      userName
    }
  }
}
