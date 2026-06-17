import ChildComp from './ChildComp.vue'

export default {
  components: {
    ChildComp
  },
  data() {
    return {
      themeColor: '#42b883',
      userName: '张三'
    }
  },
  provide() {
    return {
      themeColor: this.themeColor,
      userName: this.userName
    }
  }
}
