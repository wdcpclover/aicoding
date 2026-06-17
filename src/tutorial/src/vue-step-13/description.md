# Props {#props}

组件之间需要通信。**Props** 是父组件向子组件传递数据的主要方式——就像函数的参数一样，父组件"调用"子组件时可以传入不同的数据。

---

## 一、声明 Props {#declare-props}

子组件需要**显式声明**它接受哪些 props：

<div class="composition-api">

```js
const props = defineProps({
  msg: String
})
```

`defineProps()` 是编译时宏，不需要导入。声明后，`msg` 可以直接在模板中使用，也可以通过返回的对象在 JS 中访问（如 `props.msg`）。

</div>
<div class="options-api">

```js
export default {
  props: {
    msg: String
  }
}
```

声明后，`msg` 会挂载到 `this` 上，可以在模板和方法中通过 `this.msg` 访问。

</div>

> 👉 **动手试试：** 右侧第一个区域展示了基础的 props 传递——父组件把 `greeting` 传给子组件的 `msg` prop。

---

## 二、动态传递 Props {#dynamic-props}

使用 `v-bind`（简写 `:`）可以将**响应式数据**动态传递给子组件：

```vue-html
<!-- 静态传递 -->
<ChildComp msg="你好" />

<!-- 动态传递（绑定变量） -->
<ChildComp :msg="greeting" />
```

当父组件的 `greeting` 变化时，子组件会**自动更新**——这就是响应式的威力。

> 👉 **动手试试：** 修改右侧输入框中的内容，观察子组件实时跟随父组件数据变化。

---

## 三、Props 默认值与类型验证 {#props-default-and-validation}

声明 props 时，可以指定**类型**、**默认值**等约束：

<div class="composition-api">

```js
const props = defineProps({
  msg: {
    type: String,
    default: '没有传入消息'
  },
  score: {
    type: Number,
    default: 0      // 父组件不传时，使用默认值 0
  }
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    msg: {
      type: String,
      default: '没有传入消息'
    },
    score: {
      type: Number,
      default: 0      // 父组件不传时，使用默认值 0
    }
  }
}
```

</div>

> 👉 **动手试试：** 右侧第三个区域中，勾选/取消"传递 score prop"，观察：传递时子组件显示实际分数，不传时使用默认值 0。

:::tip 更多验证能力
除了 `type` 和 `default`，Vue 还支持 `required`（必填）和 `validator`（自定义验证）：

<div class="composition-api">

```js
const props = defineProps({
  // 必填
  name: { type: String, required: true },
  // 多种类型
  id: [String, Number],
  // 自定义验证
  score: {
    type: Number,
    validator(value) {
      return value >= 0 && value <= 100
    }
  }
})
```

</div>
<div class="options-api">

```js
export default {
  props: {
    // 必填
    name: { type: String, required: true },
    // 多种类型
    id: [String, Number],
    // 自定义验证
    score: {
      type: Number,
      validator(value) {
        return value >= 0 && value <= 100
      }
    }
  }
}
```

</div>

类型不匹配时，Vue 会在控制台发出警告（开发模式下），帮助你尽早发现问题。
:::

---

## 四、单向数据流 {#one-way-flow}

Props 遵循**单向数据流**原则：父组件的数据流向子组件，但子组件**不能直接修改** props。

```
父组件 ──(props)──▶ 子组件
         单向流动
```

<div class="composition-api">

如果子组件需要基于 prop 做计算，使用 `computed`（右侧 ChildComp 中就是这样做的）：

```js
const props = defineProps({ score: { type: Number, default: 0 } })

// ✅ 基于 prop 派生新值，而不是修改 prop
const level = computed(() => {
  if (props.score >= 90) return '优秀 🌟'
  if (props.score >= 70) return '良好 👍'
  if (props.score >= 60) return '及格 ✅'
  return '需努力 💪'
})
```

</div>
<div class="options-api">

如果子组件需要基于 prop 做计算，使用 `computed`（右侧 ChildComp 中就是这样做的）：

```js
export default {
  props: { score: { type: Number, default: 0 } },
  computed: {
    // ✅ 基于 prop 派生新值，而不是修改 prop
    level() {
      if (this.score >= 90) return '优秀 🌟'
      if (this.score >= 70) return '良好 👍'
      if (this.score >= 60) return '及格 ✅'
      return '需努力 💪'
    }
  }
}
```

</div>

:::warning 不要修改 props
直接修改 props 会导致 Vue 发出警告。如果需要"双向通信"，应该使用 **emits**（下一节会学到）。
:::

---

**总结：**

<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| 声明 Props | `props: { msg: String }` 选项中声明 |
| 传递 Props | `:msg="data"` 动态绑定，`msg="文本"` 静态传递 |
| 类型验证 | `{ type: String, required: true, default: '' }` |
| 访问 Props | 模板直接用，JS 中 `this.msg` |
| 单向数据流 | 父 → 子单向流动，子组件不可修改 props |

</div>
<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| 声明 Props | `defineProps({ msg: String })` 编译时宏 |
| 传递 Props | `:msg="data"` 动态绑定，`msg="文本"` 静态传递 |
| 类型验证 | `{ type: String, required: true, default: '' }` |
| 访问 Props | 模板直接用，JS 中 `props.msg` |
| 单向数据流 | 父 → 子单向流动，子组件不可修改 props |

</div>
