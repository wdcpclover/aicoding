import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  setup() {
    var keyword = ref('iPhone 16')

    return {
      keyword
    }
  }
}
