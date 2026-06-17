# Provide / Inject {#provide-inject}

前面学的 Props 只能**逐层传递**——父传子、子再传孙。如果组件层级很深，中间层组件根本不需要这些数据，却不得不一层层转发，这就是所谓的 **"props 逐层透传"** 问题：

```
App ──(props)──▶ ChildComp ──(props)──▶ GrandChild
                  ↑ 中间层不需要这些数据，却必须转发
```

Vue 提供了 `provide` / `inject` 来解决这个问题——祖先组件**提供**数据，后代组件直接**注入**，中间层完全不用参与：

```
App ──(provide)──────────────▶ GrandChild (inject)
        │                          ↑
        └── ChildComp ─────────────┘
             完全不需要知道这些数据
```

---

## 一、基础用法 {#basic}

<div class="composition-api">

**祖先组件**用 `provide()` 提供数据：

```js
import { ref, provide } from 'vue'

const userName = ref('张三')
// provide(key, value)
provide('userName', userName)
```

**后代组件**用 `inject()` 注入数据：

```js
import { inject } from 'vue'

// inject(key, 默认值)
const userName = inject('userName', '匿名')
```

</div>
<div class="options-api">

**祖先组件**用 `provide` 选项提供数据（使用函数形式可以访问 `this`）：

```js
export default {
  data() {
    return { userName: '张三' }
  },
  provide() {
    return {
      userName: this.userName
    }
  }
}
```

**后代组件**用 `inject` 选项注入数据：

```js
export default {
  inject: ['userName']
  // 之后可以通过 this.userName 访问
}
```

</div>

> 👉 **动手试试：** 右侧有三层组件嵌套（App → ChildComp → GrandChild）。App 通过 provide 提供了用户名和主题色，GrandChild 通过 inject 直接获取。注意 ChildComp **完全没有接收或转发任何数据**。

---

## 二、响应式 {#reactivity}

<div class="composition-api">

组合式 API 中，如果 provide 的是 `ref`，后代 inject 到的也是同一个 ref，**天然保持响应式**：

```js
// 祖先：provide 一个 ref
const themeColor = ref('#42b883')
provide('themeColor', themeColor)

// 后代：inject 到的是同一个 ref，自动响应
const themeColor = inject('themeColor')
```

> 👉 **动手试试：** 修改 App 中的用户名或主题色，观察 GrandChild 实时更新。

</div>
<div class="options-api">

选项式 API 中，`provide` 提供的普通值**不是响应式的**。如果需要响应式，需要用 `computed`：

```js
import { computed } from 'vue'

export default {
  data() {
    return { themeColor: '#42b883' }
  },
  provide() {
    return {
      // 用 computed 包裹才能保持响应式
      themeColor: computed(() => this.themeColor)
    }
  }
}
```

:::warning 选项式 API 的限制
右侧演示中，选项式 API 模式下修改输入框，GrandChild **不会**实时更新，因为 provide 的是普通字符串而非响应式数据。这是选项式 API 的一个局限。
:::

</div>

---

**总结：**

<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| provide | `provide('key', value)` 祖先组件提供数据 |
| inject | `inject('key', 默认值)` 后代组件注入数据 |
| 跨层级 | 中间层组件不需要参与，数据直接到达后代 |
| 响应式 | provide `ref` → inject 自动保持响应式 |
| 适用场景 | 主题色、用户信息、全局配置等需要深层传递的数据 |

</div>
<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| provide | `provide()` 函数返回要提供的数据 |
| inject | `inject: ['key']` 声明要注入的数据 |
| 跨层级 | 中间层组件不需要参与，数据直接到达后代 |
| 响应式 | 需要用 `computed()` 包裹才能保持响应式 |
| 适用场景 | 主题色、用户信息、全局配置等需要深层传递的数据 |

</div>
