export default {
  data() {
    return {
      // === Class 绑定 ===
      isActive: true,
      hasError: false,
      activeClass: 'active',
      errorClass: 'text-danger',

      // === Style 绑定 ===
      activeColor: '#2196f3',
      fontSize: 18,
      styleObject: {
        color: '#e91e63',
        fontSize: '20px',
        fontWeight: 'bold'
      },
      baseStyles: {
        padding: '8px 16px',
        borderRadius: '4px'
      },
      overridingStyles: {
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800'
      }
    }
  },
  computed: {
    classObject() {
      return {
        active: this.isActive,
        'text-danger': this.hasError
      }
    }
  },
  methods: {
    toggleActive() {
      this.isActive = !this.isActive
    },
    toggleError() {
      this.hasError = !this.hasError
    },
    changeColor() {
      this.activeColor = this.activeColor === '#2196f3' ? '#4caf50' : '#2196f3'
    },
    changeFontSize() {
      this.fontSize = this.fontSize === 18 ? 28 : 18
    }
  }
}
