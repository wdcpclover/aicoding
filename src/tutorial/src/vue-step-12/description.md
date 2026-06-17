# 组件 {#components}

目前为止，我们只使用了单个组件。真正的 Vue 应用往往是由**嵌套组件**创建的——就像 HTML 元素一样，组件也可以组合、复用。

---

## 一、导入与注册子组件 {#import-child}

<div class="composition-api">

### 组合式 API：导入即可用，无需注册

在 `<script setup>` 中，导入的组件**自动注册**，可以直接在模板中使用：

```vue
<script setup>
// 导入后直接可用，不需要任何注册步骤！
import ChildComp from './ChildComp.vue'
</script>

<template>
  <!-- 以下四种写法完全等价，效果一模一样！ -->

  <!-- PascalCase 自闭合（推荐） -->
  <ChildComp />

  <!-- PascalCase 配对标签 -->
  <ChildComp></ChildComp>

  <!-- kebab-case 自闭合 -->
  <child-comp />

  <!-- kebab-case 配对标签 -->
  <child-comp></child-comp>
</template>
```

:::tip 为什么不需要注册？
`<script setup>` 是一个编译时语法糖——Vue 的编译器会自动扫描模板中使用的变量，将 `import` 进来的组件自动暴露给模板。所以你只管 `import`，剩下的交给编译器。
:::

</div>
<div class="options-api">

### 选项式 API：导入 + 注册，缺一不可

使用选项式 API 时，光导入组件是**不够的**，还必须在 `components` 选项中**显式注册**：

```js
import ChildComp from './ChildComp.vue'

export default {
  // 必须在这里注册，否则模板中无法使用！
  components: {
    ChildComp
  }
}
```

注册后，以下四种写法**完全等价**，效果一模一样：

```vue-html
<!-- PascalCase 自闭合（推荐） -->
<ChildComp />

<!-- PascalCase 配对标签 -->
<ChildComp></ChildComp>

<!-- kebab-case 自闭合 -->
<child-comp />

<!-- kebab-case 配对标签 -->
<child-comp></child-comp>
```

如果你只 `import` 了但忘了在 `components` 中注册，Vue 会报错：**"Failed to resolve component"**。

:::tip 为什么选项式需要注册？
选项式 API 中，Vue 不会自动扫描你导入了哪些组件。你需要通过 `components` 选项**显式告诉** Vue："这些组件可以在我的模板中使用"。这就是注册的本质。
:::

</div>

<div class="composition-api">

### 两种 API 对比

| | 组合式 API (`<script setup>`) | 选项式 API |
|---|---|---|
| **导入** | `import ChildComp from './ChildComp.vue'` | `import ChildComp from './ChildComp.vue'` |
| **注册** | 不需要，自动完成 | 必须在 `components: {}` 中注册 |
| **使用** | 直接用 `<ChildComp />` | 注册后才能用 `<ChildComp />` |

</div>
<div class="options-api">

### 两种 API 对比

| | 选项式 API | 组合式 API (`<script setup>`) |
|---|---|---|
| **导入** | `import ChildComp from './ChildComp.vue'` | `import ChildComp from './ChildComp.vue'` |
| **注册** | 必须在 `components: {}` 中注册 | 不需要，自动完成 |
| **使用** | 注册后才能用 `<ChildComp />` | 直接用 `<ChildComp />` |

</div>

> 👉 **动手试试：** 右侧编辑器中，App 组件已经导入了 ChildComp，观察子组件是如何渲染在父组件中的。

---

## 二、组件命名与模板中的使用方式 {#naming}

### PascalCase（大驼峰）命名

Vue 推荐使用 **PascalCase** 来命名组件，也就是每个单词首字母大写：

```
ChildComp.vue     ✅ 组件文件名用 PascalCase
TodoItem.vue      ✅
UserProfile.vue   ✅
```

好处是可以和原生 HTML 元素**一眼区分**——原生标签全部小写（`<div>`、`<span>`），组件标签首字母大写（`<TodoItem>`）。

### 模板中的写法：命名风格 × 标签形式

使用组件时有**两个维度**可以自由组合：

**维度一：命名风格**
- **PascalCase**（大驼峰）：`<ChildComp>` —— 推荐，和 JS 导入名一致
- **kebab-case**（短横线）：`<child-comp>` —— HTML 传统风格

**维度二：标签形式**
- **自闭合标签**：`<ChildComp />` —— 没有子内容时更简洁
- **配对标签**：`<ChildComp></ChildComp>` —— 需要插入插槽内容时使用

组合起来，一共有**四种等价写法**：

```vue-html
<ChildComp />                  <!-- ✅ PascalCase + 自闭合（最推荐） -->
<ChildComp></ChildComp>        <!-- ✅ PascalCase + 配对标签 -->
<child-comp />                 <!-- ✅ kebab-case + 自闭合 -->
<child-comp></child-comp>      <!-- ✅ kebab-case + 配对标签 -->
```

以上四种写法**渲染结果完全相同**，Vue 会自动识别。

:::tip 转换规则
Vue 会自动将 PascalCase 的组件名映射为 kebab-case。也就是说，注册为 `ChildComp` 的组件，在模板中用 `<ChildComp>` 或 `<child-comp>` **都能找到**。

**推荐在 `.vue` 单文件组件中使用 PascalCase + 自闭合**（`<ChildComp />`）——最简洁、和 JS 导入名一致，一眼就能和原生 HTML 标签区分。
:::

### 导入名就是标签名

不管使用哪种 API，你在模板中使用的标签名，就是**导入时的变量名**：

<div class="composition-api">

```vue
<script setup>
// 导入时叫 MyButton → 模板中就用 <MyButton>
import MyButton from './components/MyButton.vue'

// 导入时叫 PageHeader → 模板中就用 <PageHeader>
import PageHeader from './components/PageHeader.vue'
</script>

<template>
  <PageHeader />
  <MyButton />
</template>
```

</div>
<div class="options-api">

```js
import MyButton from './components/MyButton.vue'
import PageHeader from './components/PageHeader.vue'

export default {
  components: {
    // 注册时的 key 就是模板中的标签名
    MyButton,    // → <MyButton /> 或 <my-button />
    PageHeader   // → <PageHeader /> 或 <page-header />
  }
}
```

选项式 API 还可以用**别名注册**，让标签名和导入名不同：

```js
import MyBtn from './components/MyButton.vue'

export default {
  components: {
    // key 是模板中的标签名，value 是导入的组件
    SuperButton: MyBtn  // → 模板中用 <SuperButton />
  }
}
```

</div>

---

## 三、组件的嵌套与组合 {#nesting}

组件可以**多层嵌套**，构成一棵组件树。这是 Vue 应用的核心架构模式：

```
App（根组件）
├── Header
│   └── NavBar
├── Main
│   ├── ArticleList
│   │   └── ArticleCard（多个）
│   └── Sidebar
└── Footer
```

每个组件管理自己的**模板、逻辑和样式**，彼此独立又可以通过 props/events 通信（后面章节会学到）。

> 👉 **动手试试：** 右侧演示中，父组件渲染了子组件，子组件内部有自己的状态和模板。试着修改子组件的内容看看效果。

---

**总结：**

<div class="options-api">

| 知识点 | 核心要点 |
|--------|---------|
| 导入组件 | `import ChildComp from './ChildComp.vue'` |
| 注册组件 | 选项式 API **必须**在 `components: { ChildComp }` 中注册 |
| 组合式不需注册 | `<script setup>` 导入后自动可用，无需手动注册 |
| 模板中使用 | `<ChildComp />` 或 `<child-comp />`，两种写法都行 |
| 命名规范 | 文件名和组件名用 PascalCase，与原生标签区分 |
| 别名注册 | 选项式可用 `{ MyName: ImportedComp }` 自定义标签名 |
| 组件树 | 组件可多层嵌套，各自管理模板、逻辑、样式 |

</div>
<div class="composition-api">

| 知识点 | 核心要点 |
|--------|---------|
| 导入组件 | `import ChildComp from './ChildComp.vue'` |
| 无需注册 | `<script setup>` 导入后**自动可用**，无需手动注册 |
| 选项式需注册 | 选项式 API 必须在 `components` 中显式注册 |
| 模板中使用 | `<ChildComp />` 或 `<child-comp />`，两种写法都行 |
| 命名规范 | 文件名和组件名用 PascalCase，与原生标签区分 |
| 标签名 = 导入名 | `import X from '...'` → 模板中就用 `<X />` |
| 组件树 | 组件可多层嵌套，各自管理模板、逻辑、样式 |

</div>
