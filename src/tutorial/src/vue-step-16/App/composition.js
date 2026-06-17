import { ref, provide } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    var themeColor = ref('#42b883')
    var userName = ref('张三')

    // 通过 provide 向所有后代组件提供数据
    provide('themeColor', themeColor)
    provide('userName', userName)

    return {
      themeColor,
      userName
    }
  }
}
