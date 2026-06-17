# Class 与 Style 绑定 {#class-and-style-bindings}

数据绑定的一个常见需求场景是操纵元素的 CSS class 列表和内联样式。因为 `class` 和 `style` 都是 attribute，我们可以和其他 attribute 一样使用 `v-bind` 将它们和动态的字符串绑定。但是，在处理比较复杂的绑定时，通过拼接生成字符串是麻烦且易出错的。因此，Vue 专门为 `class` 和 `style` 的 `v-bind` 用法提供了特殊的功能增强。除了字符串外，表达式的值也可以是对象或数组。

---

## 一、绑定 HTML class {#binding-html-classes}

### 1. 绑定对象

我们可以给 `:class` 传递一个对象来动态切换 class：

```vue-html
<div :class="{ active: isActive }"></div>
```

`active` 是否存在取决于数据属性 `isActive` 的真假值。

你可以在对象中写多个字段来操作多个 class。此外，`:class` 指令也可以和一般的 `class` attribute 共存：

```vue-html
<div
  class="static"
  :class="{ active: isActive, 'text-danger': hasError }"
></div>
```

当 `isActive` 为 `true`、`hasError` 为 `false` 时，渲染结果是：

```html
<div class="static active"></div>
```

当 `hasError` 也变为 `true` 时，class 列表变成 `"static active text-danger"`。

绑定的对象也可以不写成内联的形式，可以直接绑定一个对象变量：

```vue-html
<div :class="classObject"></div>
```

<div class="composition-api">

我们也可以绑定一个返回对象的计算属性，这是一个常见且很有用的技巧：

```js
const classObject = computed(() => ({
  active: isActive.value && !error.value,
  'text-danger': error.value && error.value.type === 'fatal'
}))
```

</div>

<div class="options-api">

我们也可以绑定一个计算属性：

```js
computed: {
  classObject() {
    return {
      active: this.isActive && !this.error,
      'text-danger': this.error && this.error.type === 'fatal'
    }
  }
}
```

</div>

### 2. 绑定数组

我们可以给 `:class` 绑定一个数组来渲染多个 CSS class：

```vue-html
<div :class="[activeClass, errorClass]"></div>
```

如果你想在数组中有条件地渲染某个 class，可以使用三元表达式：

```vue-html
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```

也可以在数组中嵌套对象，更加简洁：

```vue-html
<div :class="[{ [activeClass]: isActive }, errorClass]"></div>
```

### 3. 在组件上使用

对于只有一个根元素的组件，当你使用了 `class` attribute 时，这些 class 会被添加到根元素上并与该元素上已有的 class 合并。

```vue-html
<!-- 子组件模板 -->
<p class="foo bar">Hi!</p>

<!-- 在使用组件时 -->
<MyComponent class="baz boo" />

<!-- 渲染结果 -->
<p class="foo bar baz boo">Hi!</p>
```

如果你的组件有多个根元素，你将需要通过 `$attrs.class` 指定哪个根元素来接收 class。

---

## 二、绑定内联样式 {#binding-inline-styles}

### 1. 绑定对象

`:style` 支持绑定 JavaScript 对象值，对应的是 HTML 元素的 `style` 属性：

```vue-html
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

尽管推荐使用 camelCase，但 `:style` 也支持 kebab-cased 形式的 CSS 属性 key：

```vue-html
<div :style="{ 'font-size': fontSize + 'px' }"></div>
```

直接绑定一个样式对象通常是一个好主意，这样可以使模板更加简洁：

```vue-html
<div :style="styleObject"></div>
```

同样的，如果样式对象需要更复杂的逻辑，也可以使用返回样式对象的计算属性。

### 2. 绑定数组

我们还可以给 `:style` 绑定一个包含多个样式对象的数组。这些对象会被合并后渲染到同一元素上：

```vue-html
<div :style="[baseStyles, overridingStyles]"></div>
```

### 3. 自动前缀

当你在 `:style` 中使用了需要浏览器特殊前缀的 CSS 属性时，Vue 会自动为它们加上相应的前缀。Vue 是在运行时检查该属性是否支持在当前浏览器中使用。

### 4. 样式多值

你可以对一个样式属性提供多个 (不同前缀的) 值：

```vue-html
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```

数组仅会渲染浏览器支持的最后一个值。在支持不需要特别前缀的浏览器中都会渲染为 `display: flex`。

---

**右侧代码综合展示了 class 绑定和 style 绑定的所有用法，请尝试点击按钮切换状态来观察效果。**
