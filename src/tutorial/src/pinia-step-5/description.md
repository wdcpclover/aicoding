# Action：业务逻辑入口 {#pinia-step-5}

> Action 是 store 里的"方法"，**所有改 state、调 API、跑业务逻辑的地方都写在这里**。它对应组件里的 methods，但作用范围是全局共享的。

## 一、为什么要有 action？

理论上你可以在组件里直接修改 store 的 state，但那样会带来几个问题：

1. **散落的修改逻辑**：同一份业务规则（比如"加入购物车前要校验库存"）会被复制到多个组件
2. **难以追踪**：state 在哪儿被修改的，devtools 里只能看到字段变了，看不到是哪段业务流程
3. **测试困难**：业务逻辑混在组件里，没法独立单元测试

把这些逻辑收敛到 action 后：

- 业务规则**只写一次**，所有调用方共享
- devtools 显示 action 名称（比"set 了 count"更清楚）
- action 可以独立单元测试

> Pinia 没有 mutations —— 在 action 里**直接改 state** 即可，不用经过额外的中间层（这是相对 Vuex 的简化）。

## 二、同步 action

<div class="composition-api">

Setup 语法里，action 就是普通函数（用闭包访问 state）：

```js
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  function incrementBy(n) {
    count.value += n
  }

  function randomize() {
    count.value = Math.round(100 * Math.random())
  }

  return { count, increment, incrementBy, randomize }
})
```

</div>

<div class="options-api">

Options 语法里，action 写在 `actions` 对象里，用 `this` 访问 state：

```js
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
    incrementBy(n) {
      this.count += n
    },
    randomize() {
      this.count = Math.round(100 * Math.random())
    }
  }
})
```

</div>

## 三、异步 action（API 请求）

action 可以是 `async`，正常用 `await`：

<div class="composition-api">

```js
const advice = ref('')
const loading = ref(false)
const error = ref('')

async function loadAdvice() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('https://api.adviceslip.com/advice')
    const data = await res.json()
    advice.value = data.slip.advice
  } catch (e) {
    error.value = '请求失败：' + e.message
  } finally {
    loading.value = false
  }
}
```

</div>

<div class="options-api">

```js
state: () => ({
  advice: '',
  loading: false,
  error: ''
}),
actions: {
  async loadAdvice() {
    this.loading = true
    this.error = ''
    try {
      const res = await fetch('https://api.adviceslip.com/advice')
      const data = await res.json()
      this.advice = data.slip.advice
    } catch (e) {
      this.error = '请求失败：' + e.message
    } finally {
      this.loading = false
    }
  }
}
```

</div>

> 💡 异步 action 的**典型三件套**：开始时设 `loading = true`，结束时（无论成败）设 `loading = false`，出错时把错误信息塞到 `error`。这样组件能根据这三个字段渲染加载态、内容、错误提示。

## 四、跨 store 调 action

action 内部直接 `useOtherStore()` 即可：

```js
import { useAuthStore } from './stores/auth'

actions: {
  async fetchUserPreferences() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      throw new Error('未登录，无法获取偏好设置')
    }
    this.preferences = await api.getPreferences(auth.token)
  }
}
```

## 五、组件中调 action

<div class="composition-api">

```js
const store = useCounterStore()

// 方式 1：直接在 store 上调
store.increment()
store.incrementBy(5)
await store.loadAdvice()

// 方式 2：解构（action 是普通函数，可以直接解构）
const { increment, loadAdvice } = store
increment()
await loadAdvice()
```

</div>

<div class="options-api">

```js
import { mapActions } from 'pinia'

export default {
  methods: {
    // 把 action 映射成组件方法
    ...mapActions(useCounterStore, ['increment', 'randomize', 'loadAdvice']),

    // 也可以重命名
    ...mapActions(useCounterStore, { addOne: 'increment' })
  }
}
```

</div>

## 六、监听 action 生命周期：`$onAction()`

类似中间件，能拦截到每次 action 调用 —— 调用前、成功后、失败时都能注入逻辑：

```js
const unsubscribe = store.$onAction(({ name, args, after, onError }) => {
  // 调用时
  console.log(`▶ ${name}(${args.join(', ')})`)

  // 成功时
  after((result) => {
    console.log(`✓ ${name} 完成，返回：`, result)
  })

  // 失败时
  onError((err) => {
    console.warn(`✗ ${name} 出错：`, err)
  })
})
```

实战用途：

- **日志 / 埋点**：所有 action 调用统一上报
- **性能监控**：记录每个 action 的耗时
- **统一错误处理**：捕获所有 action 的异常

订阅默认绑定到当前组件，组件卸载时自动清理。如需保留，传 `{ detached: true }`。

## 看右边 →

REPL 演示了：

- **同步 action**：+1 / +5 / 随机数
- **异步 action**：从在线 API 拉一句英文建议
- **错误处理**：故意失败的 action 演示 try / catch 流程
- **`$onAction` 日志**：底部黑框实时显示每次 action 调用、完成、出错的事件

切换组合式 / 选项式 toggle —— store 文件 + 组件订阅方式同步切换。
