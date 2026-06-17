export default {
  // ===== 考点：ActivityCard.vue（10 分）—— 用 props 接收父组件传来的数据 =====
  props: {
    activity: { type: Object, required: true }
  },
  emits: ['view'],
  setup(props, { emit }) {
    function onView() {
      // 把点击事件交还给父组件（父组件决定跳详情页）
      emit('view', props.activity.id)
    }
    return { onView }
  }
}
