import { storeToRefs } from 'pinia'
import { useCartStore } from './store.js'

export default {
  setup() {
    const cart = useCartStore()
    // state / getter 用 storeToRefs 保响应式
    const { items, total, count } = storeToRefs(cart)
    // action 直接解构
    const { remove, clear } = cart

    return { items, total, count, remove, clear }
  }
}
