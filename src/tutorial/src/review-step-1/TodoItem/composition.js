export default {
  // 子组件：用 props 接数据，用 emit 抛事件（父子通信）
  props: {
    todo: { type: Object, required: true }
  },
  emits: ['toggle', 'remove'],
  setup(props, { emit }) {
    return {
      onToggle: () => emit('toggle', props.todo.id),
      onRemove: () => emit('remove', props.todo.id)
    }
  }
}
