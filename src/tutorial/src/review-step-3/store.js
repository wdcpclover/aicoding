import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 组合式写法的 store（考试要求组合式）
export const useCartStore = defineStore('cart', () => {
  // —— state ——
  const items = ref([]) // [{ id, name, price, qty }]

  // —— getters（用 computed）——
  const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))

  // —— actions ——
  function add(product) {
    const found = items.value.find(i => i.id === product.id)
    if (found) found.qty++                       // 已有就 +1
    else items.value.push({ ...product, qty: 1 }) // 没有就加进去
  }
  function remove(id) {
    items.value = items.value.filter(i => i.id !== id)
  }
  function clear() {
    items.value = []
  }

  return { items, count, total, add, remove, clear }
})
