# 条件渲染 {#conditional-rendering}

在 Vue 中，我们经常需要根据条件来决定"显示什么"。Vue 提供了 `v-if`、`v-else`、`v-else-if` 和 `v-show` 四个指令来实现条件渲染。

---

## 一、v-if — 条件创建元素 {#v-if}

`v-if` 根据表达式的真假来**创建或销毁** DOM 元素：

```vue-html
<h1 v-if="awesome">Vue is awesome!</h1>
```

- 表达式为 [truthy](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy) → 元素**被创建**并插入 DOM
- 表达式为 [falsy](https://developer.mozilla.org/zh-CN/docs/Glossary/Falsy) → 元素**从 DOM 中移除**（不是隐藏，是真的不存在）

> 👉 **动手试试：** 右侧点击"Toggle"按钮，打开 F12 查看 DOM，注意元素是被移除而不是隐藏。

---

## 二、v-else — 提供"否则"分支 {#v-else}

`v-else` 为 `v-if` 添加一个"else"区块：

```vue-html
<h1 v-if="awesome">Vue is awesome!</h1>
<h1 v-else>Oh no 😢</h1>
```

**规则：`v-else` 必须紧跟在 `v-if` 或 `v-else-if` 后面**，中间不能有其他元素。

```vue-html
<!-- ❌ 错误：中间隔了一个 <p> -->
<div v-if="ok">Yes</div>
<p>一些内容</p>
<div v-else>No</div>

<!-- ✅ 正确：紧跟在后面 -->
<div v-if="ok">Yes</div>
<div v-else>No</div>
```

---

## 三、v-else-if — 多条件分支 {#v-else-if}

类似 JavaScript 的 `else if`，可以链式使用：

```vue-html
<div v-if="score >= 90">优秀 🏆</div>
<div v-else-if="score >= 70">良好 👍</div>
<div v-else-if="score >= 60">及格 😅</div>
<div v-else>不及格 😭</div>
```

同样必须紧跟在 `v-if` 或 `v-else-if` 后面。

> 👉 **动手试试：** 右侧拖动滑块改变分数，观察不同分数区间显示的内容。

---

## 四、`<template>` 上的 v-if — 同时控制多个元素 {#v-if-on-template}

`v-if` 必须挂在一个元素上，但如果想同时切换多个元素怎么办？

用 `<template>` 作为不可见的包装器：

```vue-html
<template v-if="showDetail">
  <h3>用户详情</h3>
  <p>姓名：张三</p>
  <p>年龄：20</p>
</template>
```

`<template>` 本身不会渲染到 DOM 中，只起分组作用。`v-else` 和 `v-else-if` 也可以用在 `<template>` 上。

> 👉 **动手试试：** 右侧切换"显示详情"，注意多个元素是一起出现/消失的。

---

## 五、v-show — 用 CSS 控制显隐 {#v-show}

`v-show` 也能按条件显示元素，但实现方式完全不同：

```vue-html
<h1 v-show="ok">Hello!</h1>
```

`v-show` **始终渲染元素**，只是通过 `display: none` 来切换可见性。

**限制：**
- 不能用在 `<template>` 上
- 不能搭配 `v-else`

---

## 六、v-if vs v-show — 如何选择？ {#v-if-vs-v-show}

这是面试常考题，核心区别：

| | `v-if` | `v-show` |
|---|---|---|
| **切换时** | 销毁/重建 DOM 元素 | 切换 CSS `display` |
| **初始为 false 时** | 不渲染（惰性） | 照样渲染，只是隐藏 |
| **切换开销** | 高 | 低 |
| **初始开销** | 低 | 高 |

**选择原则：**
- **频繁切换** → 用 `v-show`（如 Tab 切换、折叠面板）
- **条件很少变化** → 用 `v-if`（如权限控制、功能开关）

> 👉 **动手试试：** 右侧同时切换 v-if 和 v-show 区块，打开 F12 观察 DOM 差异——v-if 隐藏时元素消失，v-show 隐藏时元素还在（带 `display: none`）。

---

## 七、注意：不要混用 v-if 和 v-for {#v-if-with-v-for}

:::warning 注意
在同一个元素上同时使用 `v-if` 和 `v-for` 是**不推荐的**。
:::

当两者同时出现时，`v-if` 优先级更高，此时 `v-if` 中无法访问 `v-for` 的变量：

```vue-html
<!-- ❌ 错误：v-if 先执行，此时 todo 还不存在 -->
<li v-for="todo in todos" v-if="!todo.done">{{ todo.text }}</li>

<!-- ✅ 正确：用 <template> 包裹 v-for -->
<template v-for="todo in todos">
  <li v-if="!todo.done">{{ todo.text }}</li>
</template>
```

更好的做法是用**计算属性**提前过滤数据（回顾上一节的 computed）。

---

**总结：**

| 指令 | 作用 | 关键点 |
|------|------|--------|
| `v-if` | 条件创建/销毁元素 | 惰性渲染，切换开销高 |
| `v-else` | if 的否则分支 | 必须紧跟 v-if |
| `v-else-if` | 多条件分支 | 必须紧跟 v-if 或 v-else-if |
| `<template>` | 不可见包装器 | 分组多个元素，本身不渲染 |
| `v-show` | CSS 显隐切换 | 始终渲染，不支持 template/else |
