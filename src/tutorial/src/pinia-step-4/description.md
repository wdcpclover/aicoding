# Getter：派生状态 {#pinia-step-4}

> Getter 是基于 state **派生**出来的值，相当于 store 的"计算属性"。和 Vue 的 `computed` 一样：会**自动缓存**，依赖未变就返回上次的结果。

## 一、基础 getter

最常见的形式：基于 state 算出一个新值。

<div class="composition-api">

Setup 语法里，getter 就是 `computed()`：

```js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  // getter = computed
  const doubleCount = computed(() => count.value * 2)

  function increment() { count.value++ }

  return { count, doubleCount, increment }
})
```

</div>

<div class="options-api">

Options 语法里，getter 推荐用箭头函数 + `state` 参数：

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() { this.count++ }
  }
})
```

</div>

## 二、getter 之间互相依赖

<div class="composition-api">

Setup 语法里直接引用其他 computed 即可：

```js
const doubleCount = computed(() => count.value * 2)
const doublePlusOne = computed(() => doubleCount.value + 1)
```

</div>

<div class="options-api">

Options 语法里需要用普通函数（不是箭头函数）+ `this` 才能访问其他 getter：

```js
getters: {
  doubleCount(state) {
    return state.count * 2
  },
  // 用 this 访问其他 getter —— 不能用箭头函数
  doublePlusOne() {
    return this.doubleCount + 1
  }
}
```

> ⚠️ 在 TypeScript 里，使用 `this` 的 getter **必须**显式声明返回值类型，否则类型推断会失败：
> ```ts
> doublePlusOne(): number {
>   return this.doubleCount + 1
> }
> ```

</div>

## 三、给 getter 传参

Getter 本质是**计算属性**，没法直接接受参数。但可以**返回一个函数**，函数再接参数：

<div class="composition-api">

```js
export const useUserStore = defineStore('user', () => {
  const users = ref([
    { id: 1, name: '小明' },
    { id: 2, name: '小红' }
  ])

  const getUserById = computed(() => {
    return (id) => users.value.find(u => u.id === id)
  })

  return { users, getUserById }
})

// 调用：
const user = store.getUserById(1)
```

</div>

<div class="options-api">

```js
export const useUserStore = defineStore('user', {
  state: () => ({
    users: [
      { id: 1, name: '小明' },
      { id: 2, name: '小红' }
    ]
  }),
  getters: {
    getUserById: (state) => {
      return (id) => state.users.find(u => u.id === id)
    }
  }
})

// 调用：
const user = store.getUserById(1)
```

</div>

> ⚠️ **这种 getter 不再缓存** —— 每次调用返回的是不同的函数，函数体每次都执行。只在确实需要参数化查询时使用。

## 四、跨 store 的 getter

直接在 getter 内 `useOtherStore()` 即可，Pinia 帮你处理依赖关系：

```js
import { useUserStore } from './stores/user'

// 任意一种 store 语法都行
getters: {
  greeting(state) {
    const user = useUserStore()
    return `Hi ${user.name}, count is ${state.count}`
  }
}
```

> ⚠️ 跨 store 之间的依赖**不能形成循环**（A 依赖 B 同时 B 依赖 A），否则 Pinia 在初始化时会拿到 undefined。

## 五、组件中读 getter

<div class="composition-api">

用 `storeToRefs` 解构（保持响应式）：

```js
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { doubleCount, doublePlusOne } = storeToRefs(store)

// 模板里直接用 {{ doubleCount }}

// 带参数的 getter 直接调用
const user = store.getUserById(1)
```

</div>

<div class="options-api">

`mapState` 同时支持 state 字段和 getter：

```js
import { mapState } from 'pinia'

export default {
  computed: {
    ...mapState(useCounterStore, ['count', 'doubleCount', 'doublePlusOne']),
    // 带参数的 getter 不能直接 mapState，自己写一个 computed
    userById() {
      return (id) => useUserStore().getUserById(id)
    }
  }
}
```

</div>

## 看右边 →

REPL 里的 store 有三种 getter：

- `doubleCount`：基础 getter（基于 count 派生）
- `doublePlusOne`：依赖另一个 getter（用 `this` 或直接引用）
- `getUserById`：返回函数、接受参数

点 +1 看派生值如何同步变化；下面输入框输入用户 ID（1-3）看参数化 getter 的查询结果。
