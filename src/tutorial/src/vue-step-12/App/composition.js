import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    var parentMsg = ref('我是父组件 App')

    return {
      parentMsg
    }
  }
}
