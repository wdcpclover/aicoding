import { ref } from 'vue'

export default {
  setup() {
    // === 一、手动绑定 vs v-model ===
    const text = ref('')

    // === 二、文本 & 多行文本 ===
    const message = ref('')
    const multilineText = ref('')

    // === 三、复选框 ===
    const agreed = ref(false)
    const allFruits = ref(['苹果', '香蕉', '橙子'])
    const checkedFruits = ref([])

    // === 四、单选按钮 ===
    const sizes = ref(['小', '中', '大'])
    const pickedSize = ref('中')

    // === 五、选择器 ===
    const selected = ref('')
    const dynamicSelected = ref('A')
    const selectOptions = ref([
      { text: '选项一', value: 'A' },
      { text: '选项二', value: 'B' },
      { text: '选项三', value: 'C' }
    ])

    // === 六、值绑定 ===
    const toggle = ref('no')
    const selectedPerson = ref(null)
    const people = ref([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ])

    // === 七、修饰符 ===
    const noLazyMsg = ref('')
    const lazyMsg = ref('')
    const ageStr = ref('')
    const ageNum = ref(null)
    const trimMsg = ref('')

    return {
      text,
      message,
      multilineText,
      agreed,
      allFruits,
      checkedFruits,
      sizes,
      pickedSize,
      selected,
      dynamicSelected,
      selectOptions,
      toggle,
      selectedPerson,
      people,
      noLazyMsg,
      lazyMsg,
      ageStr,
      ageNum,
      trimMsg
    }
  }
}
