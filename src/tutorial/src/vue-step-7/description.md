# 列表渲染 {#list-rendering}

`v-for` 指令用来把数组或对象渲染成一组元素——数据有几条，就渲染几个。

---

## 一、v-for 遍历数组 {#v-for-array}

使用 `item in items` 语法，`items` 是数组，`item` 是当前项的别名：

```vue-html
<li v-for="item in items">{{ item.text }}</li>
```

第二个参数可以拿到**索引**：

```vue-html
<li v-for="(item, index) in items">
  {{ index }}. {{ item.text }}
</li>
```

也支持**解构**：

```vue-html
<li v-for="{ text, id } in items" :key="id">
  {{ text }}
</li>
```

> 类比 JS 的 `forEach`：`items.forEach((item, index) => { ... })`

> 👉 **动手试试：** 右侧 Todo List 展示了基本的 v-for 列表渲染，试着添加和删除项目。

---

## 二、v-for 遍历对象 {#v-for-object}

`v-for` 还能遍历对象的属性，可以拿到**值、键名、索引**三个参数：

```vue-html
<li v-for="(value, key, index) in myObject">
  {{ index }}. {{ key }}: {{ value }}
</li>
```

遍历顺序和 `Object.keys()` 一致。

> 👉 **动手试试：** 右侧第二个区域展示了对象遍历，试试修改代码中的对象属性。

---

## 三、key — 列表的"身份证" {#key}

Vue 默认使用"就地更新"策略：数据顺序变化时，不移动 DOM，而是就地修改每个元素的内容。

这在列表项包含**输入框、子组件状态**时会出问题。解决方案——给每项一个唯一的 `:key`：

```vue-html
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```

> 类比：`key` 就像学号。没学号时老师按座位点名，换座就叫错人；有学号就能准确对应。

:::warning 常见错误：用 index 当 key
用索引当 key 时，删除/插入会导致后面所有项的 index 变化，输入框内容会"串位"。**始终用数据的唯一 id！**
:::

> 👉 **动手试试：** 右侧第三个区域，先在输入框中输入一些内容，然后点"在开头插入"——左边（index 做 key）输入内容会错位，右边（id 做 key）正确跟随。

---

## 四、数组变更方法 {#array-change-detection}

### 变更方法（修改原数组）

以下方法会直接修改原数组，Vue 能自动检测到变化并更新视图：

`push()` · `pop()` · `shift()` · `unshift()` · `splice()` · `sort()` · `reverse()`

### 替换数组（返回新数组）

`filter()`、`concat()`、`slice()` 等方法返回新数组，需要用新数组替换旧数组：

<div class="composition-api">

```js
items.value = items.value.filter(item => item.done)
```

</div>
<div class="options-api">

```js
this.items = this.items.filter(item => item.done)
```

</div>

Vue 的 DOM 复用算法很高效，替换数组不会导致整个列表重新渲染。

:::warning 注意：sort/reverse 会修改原数组
在计算属性中使用时，必须先拷贝再操作：
```js
return [...numbers].sort()   // ✅ 先拷贝
return numbers.sort()         // ❌ 会修改原数组，产生副作用！
```
:::

> 👉 **动手试试：** 右侧 Todo List 中，添加/删除/完成待办，观察各种数组操作的效果。

---

## 五、过滤与排序 {#filter-and-sort}

想显示过滤/排序后的结果，又不想改变原始数据？用**计算属性**：

<div class="composition-api">

```js
const numbers = ref([3, 1, 4, 1, 5, 9, 2, 6])

const evenNumbers = computed(() => {
  return numbers.value.filter(n => n % 2 === 0)
})
```

</div>
<div class="options-api">

```js
computed: {
  evenNumbers() {
    return this.numbers.filter(n => n % 2 === 0)
  }
}
```

</div>

```vue-html
<li v-for="n in evenNumbers" :key="n">{{ n }}</li>
```

> 👉 **动手试试：** 右侧第五个区域可以切换过滤和排序，原始数据始终不变。

---

**总结：**

| 知识点 | 核心要点 |
|--------|---------|
| `v-for` 数组 | `(item, index) in items`，支持解构 |
| `v-for` 对象 | `(value, key, index) in obj` |
| `:key` | 必须用唯一 id，不要用 index |
| 变更方法 | push/pop/splice 等直接修改原数组 |
| 替换数组 | filter/map 返回新数组，需要赋值替换 |
| 过滤/排序 | 用 computed 派生，不改原数据 |
