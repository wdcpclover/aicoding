# 插槽 {#slots}

Props 传递的是**数据**，但有时父组件想传递的是**模板片段**（HTML 结构）。这时就需要**插槽 (Slots)**——它让子组件像"容器"一样，由父组件决定往里面放什么内容。

右侧的 ChildComp 是一个 **SearchBar 搜索栏组件**，我们会用它来演示插槽的三种用法。同一个组件，通过插槽传入不同内容，就能复用在不同场景中——这就是插槽的威力。

---

## 一、基础插槽 {#basic-slot}

父组件在子组件标签**内部**写入内容，子组件用 `<slot>` 标签来接收并渲染它：

```vue-html
<!-- 子组件 SearchBar 模板 -->
<div class="search-bar">
  <slot></slot>   <!-- 这里会被父组件的内容替换 -->
</div>
```

```vue-html
<!-- 父组件：往 SearchBar 里"塞"一个输入框 -->
<SearchBar>
  <input v-model="keyword" placeholder="搜索商品" />
</SearchBar>
```

渲染结果就像父组件的 `<input>` "嵌入"了子组件的 `<slot>` 位置。

**关键理解：** 插槽内容写在**父组件**中，所以可以访问父组件的数据（如 `keyword`）。子组件只负责提供"坑位"。

> 👉 **动手试试：** 右侧"一、基础插槽"中，父组件通过插槽向 SearchBar 传入了自定义的 input，并绑定了父组件的 `keyword` 数据。

---

## 二、默认内容 (Fallback) {#fallback}

`<slot>` 标签内可以写**默认内容**——当父组件没有传入插槽内容时自动显示：

```vue-html
<!-- 子组件 SearchBar 模板 -->
<div class="search-bar">
  <slot>
    <!-- 默认内容：父组件不传时显示这个 -->
    <input type="text" placeholder="搜索商品" />
  </slot>
</div>
```

```vue-html
<!-- 用法一：不传内容 → 显示默认搜索框 -->
<SearchBar></SearchBar>

<!-- 用法二：传了内容 → 替换默认搜索框 -->
<SearchBar>
  <span>📍 当前城市: 北京 — 搜索附近好店</span>
</SearchBar>
```

> 👉 **动手试试：** 右侧"二、默认内容"对比了两种情况——上面不传内容时显示组件内置的默认搜索框，下面传了内容后默认被替换。

---

## 三、具名插槽 {#named-slots}

一个组件可以有**多个插槽**，通过 `name` 属性区分。右侧的 SearchBar 组件有三个插槽：

```vue-html
<!-- 子组件 SearchBar 模板 -->
<div class="search-bar">
  <!-- 左侧插槽：放 logo、返回按钮等 -->
  <slot name="left">🔍</slot>

  <!-- 默认插槽：搜索区域 -->
  <slot>
    <input placeholder="搜索商品" />
  </slot>

  <!-- 右侧插槽：放购物车、筛选等 -->
  <slot name="right"></slot>
</div>
```

父组件用 `v-slot:名称`（简写 `#名称`）指定内容放到哪个插槽：

```vue-html
<!-- 京东首页风格 -->
<SearchBar>
  <template #left>
    <span class="logo">JD</span>
  </template>

  <input v-model="keyword" placeholder="搜索商品" />

  <template #right>
    <span>🛒</span>
  </template>
</SearchBar>

<!-- 分类页风格 -->
<SearchBar>
  <template #left>⬅️</template>
  <input placeholder="搜索手机数码" />
  <template #right>筛选 ▾</template>
</SearchBar>

<!-- 简洁模式：全部使用默认内容 -->
<SearchBar></SearchBar>
```

**同一个组件**，通过不同的插槽内容组合，就变成了三种完全不同的搜索栏！这就是插槽实现**组件复用**的核心能力。

> 👉 **动手试试：** 右侧"三、具名插槽"展示了同一个 SearchBar 组件的三种形态——京东首页、分类页、简洁模式。点击 ChildComp.vue 查看子组件模板中 `<slot>` 的定义。

---

## 四、插槽 vs Props vs Emits {#comparison}

到这里，我们学完了组件通信的三种方式：

| 方式 | 方向 | 传递内容 | 典型场景 |
|------|------|---------|---------|
| **Props** | 父 → 子 | 数据（字符串、数字、对象…） | 配置子组件的行为和显示 |
| **Emits** | 子 → 父 | 事件 + 数据 | 子组件通知父组件（如点击、提交） |
| **Slots** | 父 → 子 | 模板片段（HTML 结构） | 自定义子组件的内容和布局 |

:::tip 什么时候用插槽？
当你想让子组件成为一个**通用容器**——比如搜索栏、卡片、对话框、页面布局——由使用者（父组件）决定里面放什么内容时，就用插槽。

简单判断：传**数据**用 props，传**结构**用 slots。
:::

---

**总结：**

| 知识点 | 核心要点 |
|--------|---------|
| 基础插槽 | 父组件在子组件标签内写内容，子组件用 `<slot>` 渲染 |
| 默认内容 | `<slot>默认内容</slot>` 父组件不传时显示 |
| 具名插槽 | `<slot name="left">` + `<template #left>` |
| 默认插槽 | 没有 name 的 `<slot>` 就是默认插槽 |
| 复用能力 | 同一组件 + 不同插槽内容 = 不同形态（如搜索栏的多种样式） |
| 适用场景 | 传数据用 props，传结构用 slots |
