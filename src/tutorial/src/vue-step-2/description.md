# 声明式渲染与模板语法 {#declarative-rendering}

<div class="sfc">

你在编辑器中看到的是一个 Vue 单文件组件 (Single-File Component，缩写为 SFC)。单文件组件是一种可复用的代码组织形式，它将从属于同一个组件的 HTML、CSS 和 JavaScript 封装在使用 `.vue` 后缀的文件中。

</div>

Vue 的核心功能是**声明式渲染**：通过扩展于标准 HTML 的模板语法，我们可以根据 JavaScript 的状态来描述 HTML 应该是什么样子的。当状态改变时，HTML 会自动更新。

Vue 使用一种基于 HTML 的模板语法，使我们能够声明式地将其组件实例的数据绑定到呈现的 DOM 上。所有的 Vue 模板都是语法层面合法的 HTML，可以被符合规范的浏览器和 HTML 解析器解析。

在底层机制中，Vue 会将模板编译成高度优化的 JavaScript 代码。结合响应式系统，当应用状态变更时，Vue 能够智能地推导出需要重新渲染的组件的最少数量，并应用最少的 DOM 操作。

---

## 一、响应式状态 {#reactive-state}

<div class="composition-api">

能在改变时触发更新的状态被称作是**响应式**的。我们可以使用 Vue 的 `reactive()` API 来声明响应式状态。由 `reactive()` 创建的对象都是 JavaScript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，其行为与普通对象一样：

```js
import { reactive } from 'vue'

const counter = reactive({
  count: 0
})

console.log(counter.count) // 0
counter.count++
```

`reactive()` 只适用于对象 (包括数组和内置类型，如 `Map` 和 `Set`)。而另一个 API `ref()` 则可以接受任何值类型。`ref` 会返回一个包裹对象，并在 `.value` 属性下暴露内部值。

```js
import { ref } from 'vue'

const message = ref('Hello Vue 3!')

console.log(message.value) // "Hello Vue 3!"
message.value = 'Changed'
```

</div>

<div class="options-api">

能在改变时触发更新的状态被认为是**响应式**的。在 Vue 中，响应式状态被保存在组件中。

我们可以使用 `data` 组件选项来声明响应式状态，该选项应该是一个返回对象的函数：

```js
export default {
  data() {
    return {
      message: 'Hello World!',
      counter: { count: 0 }
    }
  }
}
```

</div>

---

## 二、文本插值 {#text-interpolation}

最基本的数据绑定形式是文本插值，它使用的是"Mustache"语法 (即双大括号)：

```vue-html
<p>消息: {{ message }}</p>
```

双大括号标签会被替换为相应组件实例中 `message` 属性的值。同时每次 `message` 属性更改时它也会同步更新。

<div class="composition-api">

注意我们在模板中访问 `ref` 时不需要使用 `.value`：它会被自动解包，让使用更简单。

</div>

**请看右侧代码中的示例，模板里使用了 `{{ message }}` 来显示响应式状态。**

---

## 三、原始 HTML {#raw-html}

双大括号会将数据解释为纯文本，而不是 HTML。若想插入 HTML，你需要使用 `v-html` 指令：

```vue-html
<p>文本插值: {{ rawHtml }}</p>
<p>v-html 指令: <span v-html="rawHtml"></span></p>
```

这里看到的 `v-html` attribute 被称为一个**指令**。指令由 `v-` 作为前缀，表明它们是一些由 Vue 提供的特殊 attribute。

:::warning 安全警告
在网站上动态渲染任意 HTML 是非常危险的，因为这非常容易造成 XSS 漏洞。请仅在内容安全可信时再使用 `v-html`，并且**永远不要**使用用户提供的 HTML 内容。
:::

---

## 四、Attribute 绑定 {#attribute-bindngs}

双大括号不能在 HTML attributes 中使用。想要响应式地绑定一个 attribute，应该使用 `v-bind` 指令：

```vue-html
<div v-bind:id="dynamicId"></div>
```

`v-bind` 指令指示 Vue 将元素的 `id` attribute 与组件的 `dynamicId` 属性保持一致。如果绑定的值是 `null` 或者 `undefined`，那么该 attribute 将会从渲染的元素上移除。

### 简写

因为 `v-bind` 非常常用，我们提供了特定的简写语法：

```vue-html
<div :id="dynamicId"></div>
```

### 同名简写 <sup style="color:#999">(3.4+)</sup>

如果 attribute 的名称与绑定的 JavaScript 变量的名称相同，那么可以进一步简化：

```vue-html
<!-- 与 :id="id" 相同 -->
<div :id></div>
```

### 布尔型 Attribute

布尔型 attribute 依据 true / false 值来决定 attribute 是否应该存在于该元素上：

```vue-html
<button :disabled="isButtonDisabled">Button</button>
```

当 `isButtonDisabled` 为真值或一个空字符串时，元素会包含这个 `disabled` attribute。而当其为假值时 attribute 将被忽略。

### 动态绑定多个值

如果你有一个包含多个 attribute 的 JavaScript 对象，通过不带参数的 `v-bind`，你可以将它们绑定到单个元素上：

```vue-html
<div v-bind="objectOfAttrs"></div>
```

**请看右侧代码，演示了 `v-bind` 的各种用法。**

---

## 五、使用 JavaScript 表达式 {#using-javascript-expressions}

Vue 实际上在所有的数据绑定中都支持完整的 JavaScript 表达式：

```vue-html
{{ number + 1 }}

{{ ok ? 'YES' : 'NO' }}

{{ message.split('').reverse().join('') }}

<div :id="`list-${id}`"></div>
```

在 Vue 模板内，JavaScript 表达式可以被使用在如下场景上：

- 在文本插值中 (双大括号)
- 在任何 Vue 指令 (以 `v-` 开头的特殊 attribute) attribute 的值中

### 仅支持表达式

每个绑定仅支持**单一表达式**，也就是一段能够被求值的 JavaScript 代码。一个简单的判断方法是是否可以合法地写在 `return` 后面。

下面的例子都是**无效**的：

```vue-html
<!-- 这是一个语句，而非表达式 -->
{{ var a = 1 }}

<!-- 条件控制也不支持，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

### 调用函数

可以在绑定的表达式中使用一个组件暴露的方法：

```vue-html
<time :title="toTitleDate(date)" :datetime="date">
  {{ formatDate(date) }}
</time>
```

:::tip
绑定在表达式中的方法在组件每次更新时都会被重新调用，因此**不**应该产生任何副作用，比如改变数据或触发异步操作。
:::

---

## 六、指令 Directives {#directives}

指令是带有 `v-` 前缀的特殊 attribute。Vue 提供了许多内置指令，包括上面我们所介绍的 `v-bind` 和 `v-html`。

指令 attribute 的期望值为一个 JavaScript 表达式。一个指令的任务是在其表达式的值变化时响应式地更新 DOM。以 `v-if` 为例：

```vue-html
<p v-if="seen">Now you see me</p>
```

这里，`v-if` 指令会基于表达式 `seen` 的值的真假来移除/插入该 `<p>` 元素。

### 参数 Arguments

某些指令会需要一个"参数"，在指令名后通过一个冒号隔开做标识：

```vue-html
<a v-bind:href="url"> ... </a>
<!-- 简写 -->
<a :href="url"> ... </a>

<a v-on:click="doSomething"> ... </a>
<!-- 简写 -->
<a @click="doSomething"> ... </a>
```

### 动态参数

同样在指令参数上也可以使用一个 JavaScript 表达式，需要包含在一对方括号内：

```vue-html
<a :[attributeName]="url"> ... </a>
<a @[eventName]="doSomething"> ... </a>
```

动态参数中表达式的值应当是一个字符串，或者是 `null`。特殊值 `null` 意为显式移除该绑定。

### 修饰符 Modifiers

修饰符是以点开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。例如 `.prevent` 修饰符会告知 `v-on` 指令对触发的事件调用 `event.preventDefault()`：

```vue-html
<form @submit.prevent="onSubmit">...</form>
```

### 指令语法总览

```
v-on:submit.prevent="onSubmit"
 ─┬─ ──┬── ──┬───  ──┬──────
  │    │     │       └─ 值 (JavaScript 表达式)
  │    │     └─ 修饰符 (以 . 开头)
  │    └─ 参数 (冒号后面)
  └─ 名称 (v- 前缀)
```

---

**右侧代码综合展示了以上全部语法要点，请仔细阅读并尝试修改各项值来观察效果。**
