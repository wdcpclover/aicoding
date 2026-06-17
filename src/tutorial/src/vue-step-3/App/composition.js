import { ref, reactive, computed } from 'vue'

export default {
  setup() {
    // === Class 绑定 ===

    // 1. 对象语法
    const isActive = ref(true)
    const hasError = ref(false)

    // 2. 绑定整个对象
    const classObject = computed(() => ({
      active: isActive.value,
      'text-danger': hasError.value
    }))

    // 3. 数组语法
    const activeClass = ref('active')
    const errorClass = ref('text-danger')

    // === Style 绑定 ===

    // 4. 对象语法
    const activeColor = ref('#2196f3')
    const fontSize = ref(18)

    // 5. 绑定样式对象
    const styleObject = reactive({
      color: '#e91e63',
      fontSize: '20px',
      fontWeight: 'bold'
    })

    // 6. 数组语法
    const baseStyles = reactive({
      padding: '8px 16px',
      borderRadius: '4px'
    })
    const overridingStyles = reactive({
      backgroundColor: '#fff3e0',
      border: '1px solid #ff9800'
    })

    // 方法
    function toggleActive() {
      isActive.value = !isActive.value
    }

    function toggleError() {
      hasError.value = !hasError.value
    }

    function changeColor() {
      activeColor.value = activeColor.value === '#2196f3' ? '#4caf50' : '#2196f3'
    }

    function changeFontSize() {
      fontSize.value = fontSize.value === 18 ? 28 : 18
    }

    return {
      isActive,
      hasError,
      classObject,
      activeClass,
      errorClass,
      activeColor,
      fontSize,
      styleObject,
      baseStyles,
      overridingStyles,
      toggleActive,
      toggleError,
      changeColor,
      changeFontSize
    }
  }
}
