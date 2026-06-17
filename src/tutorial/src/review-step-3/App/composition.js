import { getCurrentInstance } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { useCartStore } from './store.js'
import CartPanel from './CartPanel.vue'

const pinia = createPinia()

export default {
  components: { CartPanel },
  setup() {
    // main.js：createApp(App).use(createPinia()).mount('#app')
    getCurrentInstance().appContext.app.use(pinia)

    const cart = useCartStore()
    const { count } = storeToRefs(cart) // 顶部角标读 store

    const products = [
      { id: 1, name: 'Vue 实战', price: 59 },
      { id: 2, name: 'Pinia 指南', price: 39 },
      { id: 3, name: '路由小册', price: 29 }
    ]

    // action 直接调（不用 storeToRefs）
    const addToCart = (p) => cart.add(p)

    return { products, count, addToCart }
  }
}
