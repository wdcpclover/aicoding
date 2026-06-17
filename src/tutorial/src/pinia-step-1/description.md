# Pinia 是什么 + 接入 {#pinia-step-1}

> Pinia 是 Vue 的**官方状态管理库**，用来管理跨组件、跨页面共享的数据。它已经替代了较早的 Vuex，成为 Vue 团队推荐的方案。

## 一、为什么需要状态管理？

在 Vue 项目里，组件之间传递数据的常规手段有：

- **`props` 向下传**：父组件通过属性把数据传给子组件
- **`emit` 向上抛**：子组件通过事件通知父组件修改值
- **`provide / inject`**：跨多层级直接注入

但当下面任意一种情况出现时，原生方案就不够用了：

| 场景 | 问题 |
|---|---|
| 多个**完全不相关**的组件需要同一份数据 | 没有共同祖先组件，props 传不过去 |
| 数据需要在**多个页面间**共享（用户登录态、购物车、主题设置） | 路由切换会丢失，逐层传递也太啰嗦 |
| 组件层级很深 | props 一级级往下传，中间组件根本不需要这个数据，纯当"传话筒" |

这种情况就需要一个**全局共享的数据容器** —— 状态管理库。Pinia 就是 Vue 官方推荐的方案。

> 💡 名字来源：Pinia 取自西班牙语 "piña"（菠萝），是最接近 "Pi**N**i**A**" 的合法 npm 包名。菠萝的小花朵互相独立又最终连成整体，正是 store 的设计理念 —— 每个 store 独立，需要时互相组合。

## 二、Pinia 与 Vuex 的差异

Pinia 与 Vuex 解决同一类问题，但在 API 设计上做了若干简化：

| 维度 | Vuex 3.x / 4.x | Pinia |
|---|---|---|
| **mutations** | 改 state 必须经过 mutation | 已取消，直接改 state 即可 |
| **TypeScript** | 类型推导不完整，需要繁琐的包装 | 原生支持，类型自动推导 |
| **API 风格** | 仅支持选项式 | 同时支持**组合式 API**（Setup Store） |
| **模块结构** | 嵌套 module + namespace | 扁平的多 store 结构，store 之间组合调用 |
| **命名空间** | 需要手动配置 namespace | 通过 store id 自动命名 |
| **代码体积** | 较大 | 更小，且支持 tree-shaking |

实践上的直观感受：写 Pinia 比写 Vuex 短得多，编辑器自动补全也更准确。

## 三、在项目中接入

真实项目里，Pinia 的接入只需两步：

### 1. 安装

```bash
# pnpm
pnpm add pinia

# npm
npm install pinia

# yarn
yarn add pinia
```

### 2. 在 `main.js` 中创建实例并挂载

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

`createPinia()` 创建一个全局实例，承载所有 store 的状态；`app.use(pinia)` 把这个实例注入 Vue 应用。

> 本教程的 REPL 没有独立的 main.js，所以是在右侧 App 组件的 `setup` 或 `beforeCreate` 中通过 `getCurrentInstance().appContext.app.use(pinia)` 完成挂载。**真实项目里都写在 main.js**，不要照抄这种写法。

## 四、定义第一个 Store

Pinia 用 `defineStore()` 创建 store。第一个参数是 store 的**唯一 ID**（在 devtools 里用来区分），第二个参数有两种等价写法。

按惯例返回的函数命名为 `useXxxStore` —— `use` 前缀提示这是一个 composable，`Store` 后缀提示这是一个 Pinia store。

<div class="composition-api">

### Setup 语法（组合式）

像写 Vue 3 setup 函数那样定义 store：用 `ref` 表达 state、`computed` 表达 getter、普通函数表达 action。

```js
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)

  // getter
  const doubleCount = computed(() => count.value * 2)

  // action
  function increment() {
    count.value++
  }

  // 必须 return，外部才能访问到
  return { count, doubleCount, increment }
})
```

要点：

- `ref()` / `reactive()` 对应 state
- `computed()` 对应 getter
- 普通函数（包括 `async function`）对应 action
- **必须 `return`** 暴露给外部使用，没在返回对象里出现的变量外部访问不到

Setup 语法的优势：可以在 store 内部直接使用其他 composable（例如 `useRoute()` / `useFetch()`），灵活度更高。

</div>

<div class="options-api">

### Options 语法（选项式）

像写 Vuex 那样，把 state / getters / actions 分成三个属性对象。

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
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

要点：

- `state` 必须是**函数**，返回初始对象（每次创建独立实例，避免 SSR 串数据）
- `getters` 接收 `state` 作为第一个参数；getter 内部也可以用 `this` 访问其他 getter
- `actions` 用 `this` 访问 state 和其他 action

**与 Vue 组件的类比**（最直观的记忆方法）：

| Pinia store | Vue 组件选项 | 角色 |
|---|---|---|
| `state: () => ({ ... })` | `data() { return { ... } }` | 数据 |
| `getters: { x: state => ... }` | `computed: { x() { ... } }` | 派生值 |
| `actions: { f() { ... } }` | `methods: { f() { ... } }` | 方法 |

如果你已经会写 Vue 选项式组件，Pinia 的 Options 语法就是把组件的 `data / computed / methods` **搬到全局共享层** —— 三者的结构、用法、`this` 的含义全部一致，区别只是这份"组件状态"被多个组件共用。

Options 语法的优势：结构清晰、与 Vuex 几乎完全对应，对从 Vuex 迁移的项目最友好。

</div>

## 五、在组件中使用

<div class="composition-api">

在 `<script setup>` 里直接调用 `useCounterStore()`，配合 `storeToRefs` 解构以保持响应性：

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from './stores/counter.js'

const counter = useCounterStore()

// state 和 getter 用 storeToRefs 解构（保留响应式）
const { count, doubleCount } = storeToRefs(counter)

// action 是普通函数，直接解构即可
const { increment } = counter
</script>

<template>
  <p>count = {{ count }}</p>
  <p>double = {{ doubleCount }}</p>
  <button @click="increment">+1</button>
</template>
```

> ⚠️ 不要直接 `const { count } = counter` 解构 state —— 这会失去响应性。**必须用 `storeToRefs()`**。
> action 是普通函数，普通解构没问题。

</div>

<div class="options-api">

在选项式组件里，用 Pinia 提供的 **`mapState`** 和 **`mapActions`** 辅助函数把 store 映射到组件：

```vue
<script>
import { mapState, mapActions } from 'pinia'
import { useCounterStore } from './stores/counter.js'

export default {
  computed: {
    // 同时支持 state 字段和 getter
    ...mapState(useCounterStore, ['count', 'doubleCount'])
  },
  methods: {
    // 把 action 映射成普通方法
    ...mapActions(useCounterStore, ['increment'])
  }
}
</script>

<template>
  <p>count = {{ count }}</p>
  <p>double = {{ doubleCount }}</p>
  <button @click="increment">+1</button>
</template>
```

要点：

- `mapState` 同时映射 state 字段和 getter（都是只读的 computed）
- `mapActions` 映射 action（包装成可调用的方法）
- 模板里直接写 `count`、`increment`，跟用 `data` / `methods` 没差别

</div>

## 看右边 →

REPL 里跑了一个最简单的 Pinia 计数器：state 是 `count`，getter 是 `doubleCount`，action 是 `increment()`。

**右上角切换"组合式 / 选项式"**：

- 左侧教程切到对应风格的代码
- 右侧 store 文件本身也跟着切换（Setup ↔ Options）
- 右侧组件消费方式同步切换（`storeToRefs` ↔ `mapState`）

**左、中、右三层完全对应** —— 你看到的、读到的、运行的都是同一种范式。
