export default {
  data() {
    return {
      // === 一、手动绑定 vs v-model ===
      text: '',

      // === 二、文本 & 多行文本 ===
      message: '',
      multilineText: '',

      // === 三、复选框 ===
      agreed: false,
      allFruits: ['苹果', '香蕉', '橙子'],
      checkedFruits: [],

      // === 四、单选按钮 ===
      sizes: ['小', '中', '大'],
      pickedSize: '中',

      // === 五、选择器 ===
      selected: '',
      dynamicSelected: 'A',
      selectOptions: [
        { text: '选项一', value: 'A' },
        { text: '选项二', value: 'B' },
        { text: '选项三', value: 'C' }
      ],

      // === 六、值绑定 ===
      toggle: 'no',
      selectedPerson: null,
      people: [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
        { id: 3, name: '王五' }
      ],

      // === 七、修饰符 ===
      noLazyMsg: '',
      lazyMsg: '',
      ageStr: '',
      ageNum: null,
      trimMsg: ''
    }
  }
}
