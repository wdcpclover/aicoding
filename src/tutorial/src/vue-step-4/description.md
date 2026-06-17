# 响应式基础 {#reactivity-fundamentals}

Vue 最核心的特性就是**响应式**——当数据变化时，界面自动更新。本节将带你理解响应式的声明方式、工作原理和常见陷阱。

---

<div class="composition-api">

## 一、用 ref() 声明响应式变量 {#ref}

在组合式 API 中，使用 `ref()` 声明响应式状态：

```js
import { ref } from 'vue'

const count = ref(0)
```

**关键规则：**
- 在 JS 中读写必须用 `.value`：`count.value++`
- 在模板中**自动解包**，直接写 `{{ count }}`

```js
count.value++          // ✅ JS 中需要 .value
console.log(count.value)  // ✅ 读取也需要 .value
```

```vue-html
<span>{{ count }}</span>         <!-- ✅ 模板中不需要 .value -->
<button @click="count++">+1</button>  <!-- ✅ 模板事件中也不需要 -->
```

### 为什么需要 .value？

普通变量无法被"追踪"。`ref()` 返回一个带有 getter/setter 的对象，Vue 通过这个机制来**追踪读取**和**触发更新**：

```js
// 简化原理（伪代码）
const myRef = {
  get value() { track(); return _value },
  set value(v) { _value = v; trigger() }
}
```

> 👉 **动手试试：** 右侧代码中，点击按钮观察 `count` 的变化，然后试着修改初始值或添加新的 ref 变量。

</div>

<div class="options-api">

## 一、用 data() 声明响应式状态 {#declaring-reactive-state}

在选项式 API 中，使用 `data()` 函数返回一个对象来声明响应式状态：

```js
export default {
  data() {
    return {
      count: 0,
      message: 'Hello Vue!'
    }
  }
}
```

**关键规则：**
- `data()` 必须是一个**函数**，返回一个对象
- 通过 `this` 访问和修改数据：`this.count++`
- 所有需要响应式的属性都必须在 `data()` 中预先声明

```js
this.count++              // ✅ 通过 this 修改
this.newProp = 'hello'    // ❌ 后添加的属性不是响应式的！
```

### Vue 3 的 Proxy 原理

Vue 3 使用 `Proxy` 代理整个 data 对象，所以赋值后拿到的是代理对象，不是原始对象：

```js
const raw = {}
this.someObj = raw
console.log(this.someObj === raw) // false（是响应式代理）
```

> 👉 **动手试试：** 右侧代码中，点击按钮观察 `count` 的变化，然后试着修改初始值。

</div>

---

<div class="composition-api">

## 二、ref() vs reactive() {#reactive}

除了 `ref()`，Vue 还提供 `reactive()` 来创建响应式对象：

```js
import { reactive } from 'vue'
const state = reactive({ name: 'Vue', version: 3 })
state.version++  // 直接修改属性，不需要 .value
```

| 对比项 | `ref()` | `reactive()` |
|--------|---------|-------------|
| 支持的值类型 | 任意类型 | 仅对象/数组/Map/Set |
| 访问方式 | `.value` | 直接访问属性 |
| 可以整体替换 | ✅ `x.value = newObj` | ❌ 会丢失响应性 |
| 解构后保持响应性 | ✅（解构 ref 本身） | ❌ 原始类型属性会断开 |

**reactive() 的三个陷阱：**

```js
// 陷阱 1：不能替换整个对象
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // ❌ 响应性丢失！

// 陷阱 2：解构会丢失响应性
const { count } = state
count++  // ❌ 不会触发更新

// 陷阱 3：不能持有原始类型
const count = reactive(0)  // ❌ 无效！
```

**结论：推荐优先使用 `ref()`。**

> 👉 **动手试试：** 右侧第二个区域演示了 `reactive` 的用法，尝试点击按钮修改 state。

</div>

<div class="options-api">

## 二、用 methods 声明方法 {#declaring-methods}

通过 `methods` 选项声明组件方法，方法中通过 `this` 访问数据：

```js
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++  // this 自动指向组件实例
    }
  }
}
```

**注意：不要用箭头函数定义 methods！**

```js
methods: {
  increment: () => {
    this.count++  // ❌ 箭头函数的 this 不是组件实例！
  }
}
```

在模板中直接用方法名绑定事件：

```vue-html
<button @click="increment">+1</button>
```

> 👉 **动手试试：** 右侧代码中，试着添加一个新的 `decrement` 方法。

</div>

---

## 三、深层响应性 {#deep-reactivity}

Vue 的响应式是**深层的**——嵌套对象和数组中的变化也会被自动检测：

<div class="composition-api">

```js
const obj = ref({
  nested: { count: 0 },
  arr: ['foo', 'bar']
})

function mutateDeeply() {
  obj.value.nested.count++                        // ✅ 嵌套属性变化会触发更新
  obj.value.arr.push('item-' + obj.value.arr.length)  // ✅ 数组变化也会触发更新
}
```

</div>

<div class="options-api">

```js
data() {
  return {
    obj: {
      nested: { count: 0 },
      arr: ['foo', 'bar']
    }
  }
},
methods: {
  mutateDeeply() {
    this.obj.nested.count++                          // ✅ 嵌套属性变化会触发更新
    this.obj.arr.push('item-' + this.obj.arr.length)  // ✅ 数组变化也会触发更新
  }
}
```

</div>

> 👉 **动手试试：** 点击"修改嵌套数据"按钮，观察嵌套对象和数组是如何实时更新的。

---

## 四、DOM 更新时机与 nextTick {#dom-update-timing}

修改响应式状态后，DOM **不会立即更新**。Vue 会把同一"tick"内的所有修改合并，统一更新一次 DOM。

如果需要在 DOM 更新后执行操作，使用 `nextTick()`：

<div class="composition-api">

```js
import { nextTick } from 'vue'

async function changeAndRead() {
  count.value++
  // 此时 DOM 还没更新
  console.log(document.querySelector('#el').textContent) // 旧值

  await nextTick()
  // 现在 DOM 已更新
  console.log(document.querySelector('#el').textContent) // 新值
}
```

</div>

<div class="options-api">

```js
import { nextTick } from 'vue'

methods: {
  async changeAndRead() {
    this.count++
    // 此时 DOM 还没更新

    await nextTick()
    // 现在 DOM 已更新
  }
}
```

</div>

**什么时候需要 nextTick？**
- 修改数据后需要**读取 DOM 元素**的尺寸、位置
- 修改数据后需要操作**依赖更新后 DOM** 的第三方库

> 👉 **动手试试：** 点击"测试 nextTick"按钮，观察日志区域，看看修改数据后 DOM 的更新时机。

---

<div class="composition-api">

## 五、实用技巧：模板表达式 {#template-expressions}

在模板中可以直接写 JavaScript 表达式，Vue 会自动处理 ref 的解包：

```vue-html
<!-- 运算 -->
<span>{{ count + 1 }}</span>

<!-- 方法调用 -->
<span>{{ message.split('').reverse().join('') }}</span>

<!-- 内联事件修改 -->
<button @click="count += 10">+10</button>
```

这些表达式在每次相关响应式数据变化时都会重新求值。

> 👉 **动手试试：** 右侧第五个区域有几个模板表达式的例子，试试点击按钮观察效果。

</div>

<div class="options-api">

## 五、实用技巧：模板表达式 {#template-expressions-options}

在模板中可以直接写 JavaScript 表达式：

```vue-html
<!-- 运算 -->
<span>{{ count + 1 }}</span>

<!-- 方法调用 -->
<span>{{ message.split('').reverse().join('') }}</span>

<!-- 内联事件修改 -->
<button @click="count += 10">+10</button>
```

这些表达式在每次相关响应式数据变化时都会重新求值。

> 👉 **动手试试：** 右侧第五个区域有几个模板表达式的例子，试试点击按钮观察效果。

</div>

---

**总结：**

<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| `ref()` | 声明响应式变量，JS 中用 `.value`，模板中自动解包 |
| `reactive()` | 对象响应式，直接访问属性，但有三个局限性 |
| 深层响应性 | 嵌套对象/数组的变化自动被追踪 |
| `nextTick()` | DOM 异步更新，需要时用 nextTick 等待 |
| 模板表达式 | 模板中可直接写 JS 表达式，ref 自动解包 |

</div>

<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| `data()` | 函数返回对象，通过 `this` 访问 |
| `methods` | 声明方法，不用箭头函数 |
| 深层响应性 | 嵌套对象/数组的变化自动被追踪 |
| `nextTick()` | DOM 异步更新，需要时用 nextTick 等待 |
| 模板表达式 | 模板中可直接写 JS 表达式 |

</div>
