import { ref } from 'vue'

export default {
  setup() {
    var childMsg = ref('我是子组件 ChildComp')
    var count = ref(0)

    return {
      childMsg,
      count
    }
  }
}
