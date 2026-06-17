export default {
  data() {
    return {
      // 一、v-if / v-else
      awesome: true,

      // 二、v-else-if 多条件分支
      score: 75,

      // 三、template 上的 v-if
      showDetail: true,
      userName: '张三',
      userRole: '前端开发',

      // 四、v-show
      showNotice: true,

      // 五、v-if vs v-show 对比
      compareVisible: true
    }
  }
}
