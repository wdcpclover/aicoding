# 定义 Store：Setup 与 Options 两种语法 {#pinia-step-2}

## 一、defineStore() 概览

`defineStore()` 是 Pinia 创建 store 的核心 API，函数签名如下：

```js
defineStore(id, setupOrOptions)
```

- **`id`**：store 的全局唯一标识符。Pinia 用它在 devtools 里展示、在 SSR 时序列化、在多 store 协作时定位。**整个项目里不能重名**。
- **`setupOrOptions`**：第二个参数有两种等价写法（Setup 语法或 Options 语法），下面分别介绍。

返回值是一个**函数**，按惯例命名为 `useXxxStore`：

```js
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', /* ... */)
```

每次在组件中调用这个函数，都会返回**同一个 store 实例**（单例）—— Pinia 内部用 id 做缓存。

## 二、两种语法

### 语法一：Options Store（选项式）

像写 Vuex 那样，把 store 拆成 `state` / `getters` / `actions` 三个对象：

```js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: '小明'
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
```

**关键约定：**

- `state` 必须是**箭头函数返回对象**（避免多个组件共用同一份 state）
- `getters` 推荐用箭头函数 + `state` 参数形式；也可以用普通函数 + `this`
- `actions` 用 `this` 访问 state 和其他 action，可以是同步或 `async`
- 自带 `$reset()` 方法（一键回到 `state()` 的初始值）

**与 Vue 组件的类比**：Options Store 的三个属性和 Vue 选项式组件的三个属性**一一对应**：

| Pinia store | Vue 组件选项 | 角色 |
|---|---|---|
| `state: () => ({ ... })` | `data() { return { ... } }` | 数据 |
| `getters: { x: state => ... }` | `computed: { x() { ... } }` | 派生值 |
| `actions: { f() { ... } }` | `methods: { f() { ... } }` | 方法 |

如果你已经会写 Vue 选项式组件，Options Store 等于把组件的 `data / computed / methods` 搬到全局共享层 —— 同一种思维模型，多了一层"跨组件共享"的能力。

### 语法二：Setup Store（组合式）

像写 Vue 3 setup 函数那样，**第二个参数是一个返回对象的函数**：

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('小明')

  // getter
  const doubleCount = computed(() => count.value * 2)

  // action
  function increment() {
    count.value++
  }

  // 必须 return 暴露
  return { count, name, doubleCount, increment }
})
```

**关键约定：**

- `ref()` / `reactive()` 对应 state
- `computed()` 对应 getter
- 普通函数 / `async function` 对应 action
- **必须 `return`** 暴露给外部使用
- **没有自带 `$reset()`** —— 如果需要，要自己写一个并 return 出去

## 三、并排对比

| 概念 | Options 语法 | Setup 语法 |
|---|---|---|
| state | `state: () => ({ count: 0 })` | `const count = ref(0)` |
| getter | `getters: { double: s => s.count * 2 }` | `const double = computed(() => count.value * 2)` |
| action | `actions: { inc() { this.count++ } }` | `function inc() { count.value++ }` |
| 修改 state | `this.count++` | `count.value++` |
| 暴露范围 | 自动全暴露 | **必须显式 `return`** |
| `$reset()` | ✅ 自带 | ❌ 需要自己写 |
| store 内用 composable | ❌ 不行（没有响应式上下文） | ✅ 可以（如 `useRoute()`） |

## 四、什么时候用哪个？

| 你的场景 | 推荐 |
|---|---|
| 项目从 Vuex 迁过来 / 团队更熟悉选项式 | **Options** 语法（结构最像 Vuex） |
| 团队大量使用 Vue 3 组合式 API | **Setup** 语法（风格统一） |
| store 内部需要使用其他 composable（`useRoute`、`useFetch`、`useWebSocket` 等） | **必须用 Setup** 语法 |
| 需要复杂初始化、循环依赖、生命周期钩子 | **Setup** 语法（更灵活） |
| 第一次接触 Pinia，没有偏好 | Setup 语法（社区主流方向） |

**两种语法是完全等价的** —— 同一个 store 不管用哪种写法定义，**外部消费它的代码完全一样**。这意味着你可以根据场景为不同 store 选择不同的写法，互相调用没有任何障碍。

## 五、命名约定（推荐遵循）

- 文件名：`stores/counter.js` 或 `stores/useCounterStore.ts`
- 导出函数名：`useXxxStore`，前缀 `use` 是 composable 约定，后缀 `Store` 表明这是 Pinia store
- store id：和文件名 / 实体名一致，全小写或 kebab-case，例如 `'counter'`、`'shopping-cart'`、`'auth'`

## 看右边 →

REPL 演示了同一个 counter store —— 切换右上角的 toggle，会看到：

- **组合式模式**：右侧 `counterStoreSetup.js` 是 Setup 语法
- **选项式模式**：右侧 `counterStoreOption.js` 是 Options 语法

两种语法定义出的 store 行为完全一致：state 都是 `count`，getter 都是 `doubleCount`，action 都是 `increment`。点 +1 看效果。
