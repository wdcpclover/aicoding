# 表单输入绑定 {#form-input-bindings}

表单是前端最核心的交互方式。Vue 的 `v-model` 指令实现了表单元素与数据之间的**双向绑定**——数据变了表单更新，表单变了数据也更新。

---

## 一、手动绑定 vs v-model {#why-v-model}

不用 `v-model` 也能实现双向绑定，但需要手动写 `:value` + `@input`：

```vue-html
<!-- 手动绑定：两步 -->
<input :value="text" @input="e => text = e.target.value" />

<!-- v-model：一步搞定 -->
<input v-model="text" />
```

两者**完全等价**，`v-model` 只是语法糖。Vue 会根据元素类型自动选择正确的属性和事件：

| 元素 | 绑定属性 | 监听事件 |
|------|---------|---------|
| `<input>` 文本 / `<textarea>` | `value` | `input` |
| `<input type="checkbox/radio">` | `checked` | `change` |
| `<select>` | `value` | `change` |

:::warning 注意
`v-model` 会**忽略**元素上初始的 `value`、`checked`、`selected` 属性，始终以 JS 响应式状态为数据源。
:::

> 👉 **动手试试：** 右侧第一个区域对比了手动绑定和 v-model，两个输入框绑定同一个变量，改一个另一个也跟着变。

---

## 二、文本 & 多行文本 {#text}

### 单行文本

```vue-html
<input v-model="message" placeholder="编辑我" />
<p>消息是: {{ message }}</p>
```

### 多行文本（textarea）

```vue-html
<textarea v-model="multilineText" placeholder="多行文本"></textarea>
<p style="white-space: pre-line;">{{ multilineText }}</p>
```

:::warning 常见错误
```vue-html
<textarea>{{ text }}</textarea>  <!-- ❌ 插值无效！ -->
<textarea v-model="text"></textarea>  <!-- ✅ 用 v-model -->
```
`<textarea>` 里不能用插值 `{{ }}`，必须用 `v-model`。
:::

:::tip IME 输入
中文、日文等 IME 语言在拼字阶段（如输入拼音时）**不会**触发 v-model 更新。如果需要拼字阶段也更新，直接用 `@input` 事件。
:::

> 👉 **动手试试：** 右侧第二个区域，输入单行/多行文本观察实时同步，注意换行也会保留。

---

## 三、复选框 {#checkbox}

### 单个复选框 → 布尔值

```vue-html
<input type="checkbox" v-model="agreed" />
<label>{{ agreed }}</label>  <!-- true 或 false -->
```

### 多个复选框 → 数组

多个复选框绑定**同一个数组**，勾选/取消会自动添加/移除对应的 `value`：

```vue-html
<input type="checkbox" value="苹果" v-model="checkedFruits" />
<input type="checkbox" value="香蕉" v-model="checkedFruits" />
<input type="checkbox" value="橙子" v-model="checkedFruits" />
<!-- checkedFruits: ['苹果', '香蕉'] -->
```

> 👉 **动手试试：** 右侧勾选/取消水果，观察数组的实时变化。

---

## 四、单选按钮 {#radio}

多个 radio 绑定**同一个变量**，选中时变量值为对应的 `value`：

```vue-html
<input type="radio" value="小" v-model="pickedSize" />
<input type="radio" value="中" v-model="pickedSize" />
<input type="radio" value="大" v-model="pickedSize" />
<!-- pickedSize: '中' -->
```

> 👉 **动手试试：** 右侧选择不同的尺寸，观察绑定值和字号的变化。

---

## 五、选择器 {#select}

### 单选 select

```vue-html
<select v-model="selected">
  <option disabled value="">请选择</option>
  <option>A</option>
  <option>B</option>
</select>
```

:::tip 建议
始终提供一个**空值的禁用选项**作为默认提示。否则 iOS 上用户无法选择第一项。
:::

### v-for 动态渲染选项

```vue-html
<select v-model="dynamicSelected">
  <option v-for="opt in selectOptions" :value="opt.value">
    {{ opt.text }}
  </option>
</select>
```

> 👉 **动手试试：** 右侧有静态选项和动态选项两种 select 演示。

---

## 六、值绑定 {#value-bindings}

默认情况下 checkbox 绑定 `true`/`false`，但可以用 `true-value` / `false-value` 自定义：

```vue-html
<input type="checkbox" v-model="toggle"
  true-value="yes" false-value="no" />
<!-- 勾选: toggle = 'yes'，取消: toggle = 'no' -->
```

select 的 option 也可以绑定**对象**：

```vue-html
<select v-model="selectedPerson">
  <option v-for="p in people" :value="p">{{ p.name }}</option>
</select>
<!-- selectedPerson 是对象 { id: 1, name: '张三' } -->
```

> 👉 **动手试试：** 右侧勾选/取消自定义值的复选框，观察值从 "yes" 变为 "no"；再试 select 绑定对象，选择后观察选中的值是整个对象。

---

## 七、修饰符 {#modifiers}

### `.lazy` — 失焦后才同步

```vue-html
<input v-model.lazy="msg" />
```

默认每次输入都同步，`.lazy` 改为**失焦或按回车**时才同步。

### `.number` — 自动转为数字

```vue-html
<input v-model.number="age" />
```

自动用 `parseFloat()` 转换。忘加 `.number` 是最常见的 bug 之一——`"25" + 1 = "251"` 而不是 `26`！

### `.trim` — 去除首尾空格

```vue-html
<input v-model.trim="msg" />
```

用户多打的前后空格自动清理。

> 👉 **动手试试：** 右侧最后一个区域对比了三个修饰符的效果，尤其注意 `.number` 的类型变化。

---

**总结：**

| 知识点 | 核心要点 |
|--------|---------|
| `v-model` | `:value` + `@input` 的语法糖，双向绑定 |
| 文本/多行 | 实时同步，textarea 不能用插值 |
| 复选框 | 单个 → 布尔值，多个 → 数组 |
| 单选/选择器 | 绑定选中的 value 值 |
| 值绑定 | `true-value`/`false-value`、`:value` 绑对象 |
| `.lazy` | 失焦后才更新 |
| `.number` | 自动转数字，防止字符串拼接 bug |
| `.trim` | 去除首尾空格 |
