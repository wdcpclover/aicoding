# State：状态的读、写、$patch、$reset、$subscribe {#pinia-step-3}

> State 是 store 里**保存数据的地方**，对应组件里的 `data`。Pinia 的 state 是响应式的 —— 任何读取它的组件都会随它变化自动重渲染。

## 一、定义 state

state 必须能产生独立实例，避免在 SSR 中多个请求共用一份。

<div class="composition-api">

Setup 语法里，用 `ref()` 或 `reactive()` 直接声明：

```js
export const useUserStore = defineStore('user', () => {
  const name = ref('小明')
  const isAdmin = ref(true)
  const items = ref([])
  const profile = ref({ age: 25 })
  // ...
  return { name, isAdmin, items, profile }
})
```

</div>

<div class="options-api">

Options 语法里，`state` 必须是**箭头函数**返回初始对象：

```js
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '小明',
    isAdmin: true,
    items: [],
    profile: { age: 25 }
  })
})
```

`state` 写成函数（而不是直接的对象）的原因：函数每次调用都返回**新对象**，多个组件 / 多个 SSR 请求拿到独立的初始 state，不会串数据。

</div>

## 二、读取 state

获取 store 实例后，直接像普通对象一样读：

```js
const store = useUserStore()
console.log(store.name)        // '小明'
console.log(store.profile.age) // 25
```

## 三、修改 state

Pinia **没有 mutations** —— 直接赋值即可。

### 1. 直接赋值（最常见）

```js
store.name = '小红'
store.profile.age = 26
store.items.push('apple')
```

### 2. `$patch(对象)`：批量改字段

一次改多个字段时，比连续多次单独赋值**更高效**（订阅者只触发一次）：

```js
store.$patch({
  name: '小红',
  isAdmin: false
})
```

### 3. `$patch(函数)`：函数式 patch

处理**集合操作**（push / splice / 嵌套对象修改）时更清晰：

```js
store.$patch((state) => {
  state.items.push('apple')
  state.items.push('banana')
  state.profile.age++
})
```

> ⚠️ Pinia **不允许添加未定义的字段**。如果你 push / 删除元素能成功，但试图 `store.newField = 1` 给一个 state 中没有的字段赋值 —— Setup store 会成功（但失去类型支持），Options store 在严格模式下会警告。**所有需要的字段都应在 state 初始化时声明出来**。

## 四、重置：`$reset()`

<div class="options-api">

Options Store **自带** `$reset()`，一行回到初始：

```js
store.$reset()
// state 全部回到 state() 函数返回的初始值
```

</div>

<div class="composition-api">

Setup Store **没有自带** `$reset()`，需要自己写并 `return`：

```js
export const useUserStore = defineStore('user', () => {
  const name = ref('小明')
  const isAdmin = ref(true)
  const items = ref([])
  const profile = ref({ age: 25 })

  // 自定义 $reset
  function $reset() {
    name.value = '小明'
    isAdmin.value = true
    items.value = []
    profile.value = { age: 25 }
  }

  return { name, isAdmin, items, profile, $reset }
})
```

</div>

## 五、订阅 state 变化：`$subscribe()`

`$subscribe()` 给 store 装一个**监听器** —— state 一旦变化就通知你。简单说就是 store 的"摄像头"：state 哪里动了它都看得见。

它能用来做什么？

| 用途 | 例子 |
|---|---|
| **持久化** | state 一变就写进 localStorage，刷新页面再读回来 |
| **打日志 / 调试** | 控制台实时打印每次 state 变化（很像 Vuex 时代的 logger 插件） |
| **数据上报** | 关键操作（加入购物车、登录）发到分析平台 |
| **自动保存** | 用户改表单内容，自动写入云端（需要做防抖） |
| **跨标签页同步** | 一个标签改了 state，用 `BroadcastChannel` 同步到其他打开的标签 |

### 最简单的例子：每次变更都打印

```js
const store = useUserStore()

store.$subscribe((mutation, state) => {
  console.log('🔔 state 变了！')
  console.log('  类型：', mutation.type)
  // mutation.type 取值：
  //   'direct'         —— 直接赋值（store.name = ...）
  //   'patch object'   —— store.$patch({ ... })
  //   'patch function' —— store.$patch(state => { ... })
  console.log('  store：', mutation.storeId)
  console.log('  最新 state：', state)
})

// 触发：
store.name = '小红'                                              // 一次：'direct'
store.$patch({ name: '小刚', isAdmin: false })                    // 一次：'patch object'（不是两次！）
store.$patch(s => { s.items.push('apple'); s.profile.age++ })    // 一次：'patch function'
```

### 实战例子：三行代码做持久化

```js
// 进入页面时从 localStorage 恢复
const saved = localStorage.getItem('user')
if (saved) Object.assign(store.$state, JSON.parse(saved))

// 监听变化，自动保存
store.$subscribe((_, state) => {
  localStorage.setItem('user', JSON.stringify(state))
})
```

之后用户改任何字段，浏览器都自动同步到 localStorage —— 刷新、关闭再打开都不会丢。

### `$subscribe()` 与 `watch()` 的区别

| | `watch()` | `$subscribe()` |
|---|---|---|
| 监听对象 | 单个 ref / reactive 字段 | **整个 store**（一次监听所有字段） |
| `$patch` 改 N 个字段时触发次数 | N 次 | **永远只 1 次** ✨ |
| 拿到的额外信息 | 只有新值 / 旧值 | mutation 类型、storeId、变更字段（dev 模式） |

**`$patch` 只触发一次**是 `$subscribe()` 的关键优势：当你 `$patch({ a: 1, b: 2, c: 3 })` 时，写 localStorage 只发生一次而不是三次，避免不必要的开销（尤其是回调里有 IO 操作时）。

### 取消订阅

```js
const unsubscribe = store.$subscribe(callback)
unsubscribe()    // 手动取消
```

订阅默认**绑定到当前组件**，组件卸载时自动清理。如果想脱离组件保留订阅（例如全局持久化），传第二个参数 `{ detached: true }`：

```js
store.$subscribe(callback, { detached: true })
```

## 看右边 →

REPL 里专门加了一个**「$subscribe 监听日志」**面板（黑色框）：state 每变一次，日志都会立即多出一行，显示 mutation 类型 + 当时 state 快照。

依次点 4 个按钮观察：

- **直接赋值 name** → 日志一行，type = `direct`
- **$patch 对象**（同时改 name + isAdmin） → 日志一行，type = `patch object`（不是两行！）
- **$patch 函数**（同时 push 两个 items + age++） → 日志一行，type = `patch function`
- **$reset** → 日志一行，type = `patch function`（Pinia 内部用 patch 实现 reset）

这就是"为什么 `$patch` 只触发一次"的优势：你可以放心在订阅回调里做 IO 操作（比如写 localStorage），不用担心被调用 N 次。

## 六、组件中读写 state 的写法

<div class="composition-api">

```js
import { storeToRefs } from 'pinia'

const store = useUserStore()

// 解构 state / getter，必须用 storeToRefs 保留响应式
const { name, isAdmin, items } = storeToRefs(store)

// 读：直接用解构出来的 ref（模板里自动 unwrap，JS 里要 .value）
console.log(name.value)

// 写：通过 store 实例改（不要给 storeToRefs 拿到的 ref 重新赋值）
store.name = '小红'
store.$patch({ isAdmin: false })

// 重置
store.$reset()  // 仅 Options Store 自带；Setup Store 需自己写
```

</div>

<div class="options-api">

```js
import { mapState, mapWritableState, mapActions } from 'pinia'

export default {
  computed: {
    // 只读映射（state + getter）
    ...mapState(useUserStore, ['isAdmin', 'profile']),
    // 可读写映射 —— 用于 v-model 直接绑定
    ...mapWritableState(useUserStore, ['name'])
  },
  methods: {
    save() {
      const store = useUserStore()
      store.$patch({ name: '小红', isAdmin: false })
    },
    resetAll() {
      useUserStore().$reset()
    }
  }
}
```

> 💡 `mapState` 是只读的；如果模板里要 `v-model="name"` 双向绑定，用 `mapWritableState` 才能写入。

</div>

## 看右边 →

REPL 中演示了 4 种状态变更：

- **直接赋值 `name`**：单字段直改
- **$patch 对象**：一次改两个字段（name + isAdmin）
- **$patch 函数**：处理嵌套结构（push items + profile.age++）
- **$reset**：一键回到初始

切换组合式 / 选项式 toggle —— 注意 `$reset` 在 Setup 模式下是我们手写的，在 Options 模式下是 Pinia 自带的。
