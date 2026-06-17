# Emits {#emits}

Props 让数据从父组件流向子组件（父 → 子）。那子组件怎么"回话"？——通过 **Emits（触发事件）** 实现子 → 父通信。

---

## 一、基础事件触发 {#basic-emit}

子组件通过 emit 触发自定义事件，父组件用 `v-on`（`@`）监听：

<div class="composition-api">

```js
// 子组件：声明事件 + 触发
const emit = defineEmits(['response'])

// 组件创建时自动触发，传递数据给父组件
emit('response', '你好，我是子组件！')
```

`defineEmits()` 也是编译时宏，不需要导入。它返回一个 `emit` 函数，调用时第一个参数是事件名，后续参数是传递的数据。

</div>
<div class="options-api">

```js
// 子组件：声明事件 + 触发
export default {
  emits: ['response'],
  created() {
    // 组件创建时自动触发
    this.$emit('response', '你好，我是子组件！')
  }
}
```

`emits` 选项声明组件会触发哪些事件。通过 `this.$emit()` 触发，第一个参数是事件名，后续是传递的数据。

</div>

父组件用 `@事件名` 监听：

```vue-html
<ChildComp @response="(msg) => childMsg = msg" />
```

> 👉 **动手试试：** 右侧的子组件创建时自动触发了 `response` 事件，父组件在"一、基础事件触发"区域收到了消息。

---

## 二、用户交互触发事件 {#interactive-emit}

更常见的场景是用户操作（点击、输入等）时触发事件。可以直接在模板中调用 `$emit`：

```vue-html
<!-- 子组件模板：点击时直接 $emit -->
<button @click="$emit('increment', 1)">+1</button>
<button @click="$emit('increment', 5)">+5</button>
```

父组件监听 `@increment` 事件，拿到传过来的数字累加：

```vue-html
<!-- 父组件 -->
<ChildComp @increment="(n) => count += n" />
```

:::tip 模板中的 $emit
在模板中可以直接使用 `$emit()` 触发事件，不需要在 JS 中定义函数。适合简单的交互场景。如果逻辑复杂，建议封装成方法再调用 emit。
:::

> 👉 **动手试试：** 点击子组件中的 +1 / +5 按钮，观察"二、交互触发事件"区域中父组件的计数变化。

---

## 三、传递多个参数 {#multiple-args}

emit 可以传递**多个参数**。右侧子组件中有一个表单，提交时将姓名、分数、等级三个值一起传给父组件：

<div class="composition-api">

```js
const emit = defineEmits(['submit'])

const formName = ref('张三')
const formScore = ref(85)

function handleSubmit() {
  // 根据分数计算等级
  const level = formScore.value >= 90 ? '优秀'
    : formScore.value >= 70 ? '良好'
    : formScore.value >= 60 ? '及格' : '需努力'
  // 一次 emit 传递多个参数
  emit('submit', formName.value, formScore.value, level)
}
```

</div>
<div class="options-api">

```js
export default {
  emits: ['submit'],
  data() {
    return { formName: '张三', formScore: 85 }
  },
  methods: {
    handleSubmit() {
      const level = this.formScore >= 90 ? '优秀'
        : this.formScore >= 70 ? '良好'
        : this.formScore >= 60 ? '及格' : '需努力'
      // 一次 $emit 传递多个参数
      this.$emit('submit', this.formName, this.formScore, level)
    }
  }
}
```

</div>

父组件接收多个参数：

```vue-html
<ChildComp @submit="handleSubmit" />
```

<div class="composition-api">

```js
function handleSubmit(name, score, level) {
  submitResult.value = { name, score, level }
}
```

</div>
<div class="options-api">

```js
methods: {
  handleSubmit(name, score, level) {
    this.submitResult = { name, score, level }
  }
}
```

</div>

> 👉 **动手试试：** 在子组件区域修改姓名和分数，点击"提交给父组件"，观察"三、传递多个参数"区域显示的结果。

---

## 四、v-model：Props + Emits 的语法糖 {#two-way}

回顾本节和上一节，结合 props 和 emits，就实现了完整的**父子双向通信**：

```
父组件 ──(props)──▶ 子组件      （上一节学的）
父组件 ◀──(emits)── 子组件      （本节学的）
```

Vue 提供了 `v-model` 来简化这种双向绑定。父组件只需一行：

```vue-html
<ChildComp v-model="text" />
```

它实际上等价于：

```vue-html
<ChildComp :modelValue="text" @update:modelValue="text = $event" />
```

也就是自动帮你做了两件事：把 `text` 通过 `modelValue` prop 传给子组件，同时监听 `update:modelValue` 事件更新 `text`。

子组件这边需要：

<div class="composition-api">

```js
// 1. 声明 modelValue prop 接收父组件数据
const props = defineProps({ modelValue: String })
// 2. 声明 update:modelValue 事件
const emit = defineEmits(['update:modelValue'])
```

```vue-html
<!-- 3. 用 :value 绑定 prop，用 @input 触发 emit -->
<input :value="modelValue"
       @input="$emit('update:modelValue', $event.target.value)" />
```

</div>
<div class="options-api">

```js
export default {
  // 1. 声明 modelValue prop 接收父组件数据
  props: { modelValue: String },
  // 2. 声明 update:modelValue 事件
  emits: ['update:modelValue']
}
```

```vue-html
<!-- 3. 用 :value 绑定 prop，用 @input 触发 emit -->
<input :value="modelValue"
       @input="$emit('update:modelValue', $event.target.value)" />
```

</div>

> 👉 **动手试试：** 右侧"四、v-model 双向绑定"区域，在子组件输入框中修改内容，观察父组件的 `text` 实时同步变化。

---

**总结：**

<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| 声明事件 | `emits: ['eventName']` 选项中声明 |
| 触发事件 | `this.$emit('eventName', data)` |
| 监听事件 | `@eventName="handler"` |
| 多参数 | `this.$emit('submit', arg1, arg2, arg3)` |
| 双向通信 | props（父→子）+ emits（子→父） |
| v-model | `v-model` = `:modelValue` + `@update:modelValue` |

</div>
<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| 声明事件 | `defineEmits(['eventName'])` 编译时宏 |
| 触发事件 | `emit('eventName', data)` |
| 监听事件 | `@eventName="handler"` |
| 多参数 | `emit('submit', arg1, arg2, arg3)` |
| 双向通信 | props（父→子）+ emits（子→父） |
| v-model | `v-model` = `:modelValue` + `@update:modelValue` |

</div>
