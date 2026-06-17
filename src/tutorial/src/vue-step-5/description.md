# 计算属性 {#computed-properties}

模板中可以写表达式，但复杂逻辑写在模板里会难以维护。**计算属性**就是用来封装复杂派生逻辑的。

---

## 一、基础用法 {#basic-example}

<div class="composition-api">

使用 `computed()` 创建计算属性，传入一个 getter 函数：

```js
import { reactive, computed } from 'vue'

const author = reactive({
  name: 'John Doe',
  books: ['Vue 3 Guide', 'Vue 4 Mystery']
})

// 计算属性：根据 books 自动推导
const hasBooks = computed(() => author.books.length > 0 ? 'Yes' : 'No')
const bookCount = computed(() => author.books.length)
```

`computed()` 返回一个 **ref**，在 JS 中用 `.value` 访问，模板中自动解包：

```vue-html
<p>有书吗？{{ hasBooks }}</p>
<p>共 {{ bookCount }} 本</p>
```

当 `author.books` 变化时，`hasBooks` 和 `bookCount` 会**自动更新**。

</div>

<div class="options-api">

在 `computed` 选项中定义计算属性：

```js
export default {
  data() {
    return {
      author: {
        name: 'John Doe',
        books: ['Vue 3 Guide', 'Vue 4 Mystery']
      }
    }
  },
  computed: {
    hasBooks() {
      return this.author.books.length > 0 ? 'Yes' : 'No'
    },
    bookCount() {
      return this.author.books.length
    }
  }
}
```

计算属性像普通属性一样在模板中使用：

```vue-html
<p>有书吗？{{ hasBooks }}</p>
<p>共 {{ bookCount }} 本</p>
```

当 `this.author.books` 变化时，计算属性会**自动更新**。

</div>

> 👉 **动手试试：** 右侧代码中，添加或移除书籍，观察计算属性如何自动跟随变化。

---

## 二、计算属性 vs 方法——缓存的力量 {#computed-vs-methods}

看似用方法也能实现同样的效果，但两者有本质区别：

**计算属性有缓存，方法没有。**

<div class="composition-api">

```js
// 计算属性——有缓存，依赖不变就不重新执行
const computedTime = computed(() => new Date().toLocaleTimeString())

// 方法——每次渲染都重新执行
function methodTime() {
  return new Date().toLocaleTimeString()
}
```

</div>

<div class="options-api">

```js
computed: {
  // 有缓存，依赖不变就不重新执行
  computedTime() {
    return new Date().toLocaleTimeString()
  }
},
methods: {
  // 每次渲染都重新执行
  methodTime() {
    return new Date().toLocaleTimeString()
  }
}
```

</div>

| 特性 | 计算属性 | 方法 |
|------|---------|------|
| 缓存 | ✅ 依赖不变则返回缓存值 | ❌ 每次渲染都执行 |
| 适用场景 | 派生数据（过滤、排序、格式化） | 事件处理、有副作用的操作 |
| 性能 | 高频访问时更好 | 每次都要重新计算 |

**关键理解：** `Date.now()` 不是响应式依赖，所以 `computed(() => Date.now())` 只会计算一次，永远不会更新！

> 👉 **动手试试：** 打开浏览器控制台 (F12)，点击"触发重新渲染"按钮——只有 method 打印日志，computed 因为依赖没变而返回缓存。再试试添加书籍，此时两者都会打印。

---

## 三、可写计算属性 {#writable-computed}

计算属性默认只读。特殊场景下，可以提供 getter 和 setter 使其可写：

<div class="composition-api">

```js
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    // 写入时拆分赋值给源数据
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

fullName.value = 'Li Ming'
// → firstName = 'Li', lastName = 'Ming'
```

</div>

<div class="options-api">

```js
computed: {
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName
    },
    set(newValue) {
      [this.firstName, this.lastName] = newValue.split(' ')
    }
  }
}

// this.fullName = 'Li Ming'
// → firstName = 'Li', lastName = 'Ming'
```

</div>

> 👉 **动手试试：** 修改 firstName 或 lastName 的输入框，或点击按钮设置 fullName，观察双向联动。

---

## 四、获取上一个值 <sup style="color:#999">(3.4+)</sup> {#previous-value}

计算属性的 getter 可以接收上一次的返回值作为参数，实现"条件锁定"等效果：

<div class="composition-api">

```js
const alwaysSmall = computed((previous) => {
  if (count.value <= 3) {
    return count.value    // count ≤ 3 时正常返回
  }
  return previous         // 超过 3 则保持上一个值
})
```

</div>

<div class="options-api">

```js
computed: {
  alwaysSmall(_, previous) {  // 第一个参数是 this，用 _ 跳过
    if (this.count <= 3) {
      return this.count
    }
    return previous
  }
}
```

</div>

> 👉 **动手试试：** 右侧把 count 加到 4 以上，alwaysSmall 会"冻结"在 3；减回 3 以下又恢复跟踪。

---

## 五、最佳实践 {#best-practices}

### getter 中不要有副作用

```js
// ❌ 错误：getter 中修改了其他状态
const bad = computed(() => {
  otherState.value++        // 不要这样做！
  return someValue.value
})
```

getter 应该是**纯函数**——只计算和返回值，不要修改其他状态、发请求或操作 DOM。

### 不要直接修改计算属性的返回值

计算属性的结果是"派生快照"。要改变结果，应该去**修改它依赖的源数据**。

---

**总结：**

| 知识点 | 核心要点 |
|--------|---------|
| `computed()` | 接收 getter 函数，返回响应式 ref，依赖变化时自动更新 |
| 缓存机制 | 依赖不变 → 返回缓存值；方法每次渲染都执行 |
| 可写计算属性 | 提供 `get/set`，写入时更新源数据 |
| 获取上一个值 | getter 参数可接收 previous，实现条件锁定 |
| 最佳实践 | getter 无副作用、不直接修改计算属性值 |
