# 侦听器 {#watchers}

`computed` 只能基于数据**派生新值**，但有些场景需要在数据变化时**执行副作用**——比如发请求、操作 DOM、写日志。这时就需要**侦听器 (watch)**。

---

## 一、基础侦听 {#basic-watch}

<div class="composition-api">

```js
import { ref, watch } from 'vue'

const question = ref('')

watch(question, (newVal, oldVal) => {
  console.log('从', oldVal, '变为', newVal)
})
```

`watch()` 第一个参数是**侦听源**（ref、reactive 对象、getter 函数），第二个参数是**回调函数**，接收 `(newVal, oldVal)`。

</div>
<div class="options-api">

```js
export default {
  data() {
    return { question: '' }
  },
  watch: {
    question(newVal, oldVal) {
      console.log('从', oldVal, '变为', newVal)
    }
  }
}
```

`watch` 选项中，**属性名**对应要侦听的 data 属性，回调接收 `(newVal, oldVal)`。

</div>

> 👉 **动手试试：** 右侧第一个区域，输入包含 `?` 的问题，侦听器检测到变化后会模拟"思考"并给出回答。

---

## 二、新值与旧值 {#old-and-new}

回调的两个参数让你能对比变化前后的值：

<div class="composition-api">

```js
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})
```

</div>
<div class="options-api">

```js
watch: {
  count(newVal, oldVal) {
    console.log(`count: ${oldVal} → ${newVal}`)
  }
}
```

</div>

> 👉 **动手试试：** 点击计数按钮，观察日志区每次都显示 `旧值 → 新值`。

---

## 三、深层侦听 {#deep-watch}

默认情况下，watch **只检测引用变化**。如果侦听一个对象，修改其属性不会触发回调——除非加上 `deep: true`：

<div class="composition-api">

```js
import { reactive, watch } from 'vue'

const user = reactive({ name: '张三', age: 25 })

watch(user, (newVal) => {
  console.log('user 变了:', newVal.name, newVal.age)
}, { deep: true })
```

:::tip reactive 对象默认深层侦听
`watch()` 直接侦听 `reactive()` 对象时，Vue 会**自动**开启深层侦听。但如果侦听的是一个 `ref` 包裹的对象，则需要手动加 `{ deep: true }`。
:::

</div>
<div class="options-api">

```js
watch: {
  user: {
    handler(newVal) {
      console.log('user 变了:', newVal.name, newVal.age)
    },
    deep: true
  }
}
```

:::warning 注意写法变化
加了 `deep`/`immediate` 等选项后，watch 的值不再是函数，而是一个**对象**，回调要写在 `handler` 属性里。
:::

</div>

> 👉 **动手试试：** 修改右侧的姓名和年龄输入框，观察深层侦听器检测到嵌套属性的变化。

---

## 四、即时执行 {#immediate}

默认 watch 只在数据**变化后**才触发。加 `immediate: true` 可以让它在**创建时立即执行一次**：

<div class="composition-api">

```js
watch(todoId, async (id) => {
  const res = await fetch('/api/todo/' + id)
  todoData.value = await res.json()
}, { immediate: true })
// 不用手动调用一次 fetchData()，侦听器创建时自动执行
```

</div>
<div class="options-api">

```js
watch: {
  todoId: {
    async handler(id) {
      const res = await fetch('/api/todo/' + id)
      this.todoData = await res.json()
    },
    immediate: true
  }
}
```

</div>

最常见的场景：**组件初始化时就要根据某个参数获取数据**，之后参数变化时也要重新获取。用 `immediate: true` 一个 watch 搞定，不用在 `mounted` 里再调一次。

> 👉 **动手试试：** 右侧第四个区域，页面加载后立即获取了 Todo #1 的数据（不用等你操作），点箭头切换 ID 也会重新获取。

---

## 五、停止侦听 {#stopping-watcher}

<div class="composition-api">

`watch()` 返回一个**停止函数**，调用后侦听器不再响应：

```js
const stop = watch(count, (val) => {
  console.log(val)
})

// 之后不想监听了
stop()
```

</div>
<div class="options-api">

`watch` 选项中定义的侦听器会随组件销毁自动停止。如果需要手动停止，用 `this.$watch()`（在代码中动态创建的侦听器）：

```js
created() {
  this.unwatch = this.$watch('count', (val) => {
    console.log(val)
  })
},
methods: {
  stop() {
    this.unwatch()  // 手动停止
  }
}
```

</div>

> 👉 **动手试试：** 右侧最后一个区域，先点计数按钮看侦听生效，再点「停止侦听」，之后再点计数——不会再产生新日志。

---

<div class="composition-api">

## 六、watchEffect {#watch-effect}

`watchEffect` 会**自动追踪**回调中用到的所有响应式依赖，不需要手动指定侦听源：

```js
import { ref, watchEffect } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

watchEffect(() => {
  // 自动追踪 firstName 和 lastName
  console.log('全名:', firstName.value + lastName.value)
})
```

:::tip 知识补充
`watchEffect` 是组合式 API 独有的能力，右侧演示中未单独展示。实际开发中，当依赖较多且不需要旧值时，`watchEffect` 比 `watch` 更简洁。
:::

### watch vs watchEffect

| | `watch` | `watchEffect` |
|---|---------|---------------|
| 侦听源 | 手动指定 | 自动追踪回调中的依赖 |
| 旧值 | 提供 `oldVal` | 不提供 |
| 执行时机 | 数据变化后 | 创建时立即 + 依赖变化后 |
| 适用场景 | 需要旧值对比、精确控制 | 多依赖自动追踪 |

</div>

---

**总结：**

<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| 基础侦听 | `watch: { prop(newVal, oldVal) {} }` |
| 深层侦听 | `{ handler(){}, deep: true }` 对象写法 |
| 即时执行 | `{ handler(){}, immediate: true }` 创建时立即执行 |
| 停止侦听 | `this.$watch()` 返回停止函数 |
| watch vs computed | computed 派生值，watch 执行副作用 |

</div>
<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| 基础侦听 | `watch(source, callback)` |
| 深层侦听 | `watch(obj, cb, { deep: true })` |
| 即时执行 | `watch(source, cb, { immediate: true })` |
| 停止侦听 | `const stop = watch(...)` 调用 `stop()` |
| watchEffect | 自动追踪依赖，创建时立即执行 |
| watch vs computed | computed 派生值，watch 执行副作用 |

</div>
