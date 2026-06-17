# 【知识 3】Pinia 复习 {#review-step-3}

> Pinia = **跨组件共享的数据仓库**。把数据放进 store，任何组件拿到的都是同一份。右边「商品」和「购物车」是两个组件，共享同一个购物车 store。

## 一、定义一个 store（组合式） {#define}

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])                                    // ① state
  const total = computed(() =>                             // ② getter
    items.value.reduce((s, i) => s + i.price * i.qty, 0))
  function add(p) { items.value.push({ ...p, qty: 1 }) }   // ③ action
  return { items, total, add }                             // ④ return
})
```

> 📌 对照：`ref` = state，`computed` = getter，`function` = action，**最后一定要 return**。

## 二、组件里用 store {#use}

```js
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/store/cart'

const cart = useCartStore()
const { items, total } = storeToRefs(cart)  // state/getter：必须 storeToRefs
const { add, remove } = cart                // action：直接解构
```

> ⚠️ **最常见错误**：`const { items } = cart` 会**丢响应式**！state 和 getter 一定要套 `storeToRefs`，action 不用。

## 三、main.js 装 Pinia {#install}

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

createApp(App).use(createPinia()).mount('#app')
```

## 四、为什么要用它 {#why}

| 不用 store | 用 store |
|---|---|
| 数据在组件里，跨组件要一层层透传 props | 任何组件直接 `useXxxStore()` 拿同一份 |
| A 改了，B 不知道 | A 改 → B 自动更新（单一数据源） |
| 同一接口被多个组件各请求一遍 | 数据集中，请求一次大家共享 |

## 看右边 → {#try}

- 在「商品」里点「加入购物车」→ 下方「购物车」**立刻**出现，顶部 🛒 角标 +1
- 调数量、移除、清空 → 合计金额（**getter**）实时重算
- **关键**：上下是两个独立组件，靠 `useCartStore()` 共享同一份数据

➡️ 下一节：**Express 后端复习**（前端讲完，补后端）。
