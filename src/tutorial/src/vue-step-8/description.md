# 事件处理 {#event-handling}

用户与页面交互（点击、输入、按键等）都是通过**事件**实现的。Vue 使用 `v-on` 指令（简写 `@`）来监听 DOM 事件。

---

## 一、内联事件处理器 {#inline-handlers}

最简单的方式——直接在模板中写 JavaScript 表达式：

```vue-html
<button @click="count++">点了 {{ count }} 次</button>
```

适合**一行能写完**的简单逻辑。

> 👉 **动手试试：** 右侧第一个区域，点击按钮观察计数变化，也可以试试内联写其他表达式。

---

## 二、方法事件处理器 {#method-handlers}

逻辑复杂时，应该把处理函数提取为**方法**：

<div class="composition-api">

```js
function greet(event) {
  // event 是原生 DOM 事件，自动传入
  console.log('触发元素:', event.target.tagName)
}
```

</div>
<div class="options-api">

```js
methods: {
  greet(event) {
    // event 是原生 DOM 事件，自动传入
    console.log('触发元素:', event.target.tagName)
  }
}
```

</div>

```vue-html
<!-- 只写方法名，不加 ()，event 自动传入 -->
<button @click="greet">Greet</button>
```

### 内联 vs 方法——如何判断？

| 写法 | Vue 判定为 | 说明 |
|------|-----------|------|
| `greet` | 方法处理器 | event 自动传入 |
| `greet()` | 内联处理器 | 不传 event |
| `greet($event)` | 内联处理器 | 手动传 event |
| `count++` | 内联处理器 | 简单表达式 |

> 👉 **动手试试：** 点击 Greet 按钮，观察反馈区显示的事件信息（元素标签、坐标）。

---

## 三、传递参数与 $event {#passing-arguments}

内联处理器中可以向方法传递**自定义参数**：

```vue-html
<button @click="say('你好')">说你好</button>
<button @click="say('再见')">说再见</button>
```

同时需要拿到**原生事件**时，用 `$event` 或箭头函数：

```vue-html
<!-- 方式一：$event 特殊变量 -->
<button @click="handleClick('保存', $event)">保存</button>

<!-- 方式二：箭头函数 -->
<button @click="(e) => handleClick('保存', e)">保存</button>
```

> 👉 **动手试试：** 右侧第三个区域有"说你好""说再见"两个按钮传不同参数，还有一个"传参 + $event"按钮同时传自定义参数和原生事件，观察反馈区的消息和事件信息。

---

## 四、事件修饰符 {#event-modifiers}

在事件处理中经常需要 `event.preventDefault()` 或 `event.stopPropagation()`。Vue 提供**修饰符**让你省去手动调用：

| 修饰符 | 作用 | 等价于 |
|--------|------|--------|
| `.stop` | 阻止事件冒泡 | `event.stopPropagation()` |
| `.prevent` | 阻止默认行为 | `event.preventDefault()` |
| `.self` | 仅元素自身触发时执行 | `if (e.target !== e.currentTarget) return` |
| `.once` | 最多触发一次 | `addEventListener(..., { once: true })` |
| `.capture` | 使用捕获模式监听 | `addEventListener(..., { capture: true })` |
| `.passive` | 不阻止默认行为（优化滚动性能） | `addEventListener(..., { passive: true })` |

```vue-html
<!-- 阻止冒泡 -->
<button @click.stop="handleClick">不冒泡</button>

<!-- 阻止表单默认提交（不刷新页面） -->
<form @submit.prevent="onSubmit">...</form>

<!-- 修饰符可以链式使用 -->
<a @click.stop.prevent="doThat">链式</a>

<!-- 只有修饰符，不绑定处理函数也行 -->
<form @submit.prevent></form>
```

:::warning 修饰符顺序很重要
- `@click.prevent.self` → 阻止**所有点击**（包括子元素）的默认行为
- `@click.self.prevent` → 只阻止**元素自身**点击的默认行为

顺序不同，效果完全不同！
:::

> 👉 **动手试试：** 右侧第四个区域有四个演示：冒泡对比（.stop）、表单提交（.prevent）、点击一次（.once）、仅自身触发（.self），逐个试试。

---

## 五、按键修饰符 {#key-modifiers}

监听键盘事件时，Vue 提供**按键修饰符**来过滤特定按键：

```vue-html
<!-- 只在按 Enter 时触发 -->
<input @keyup.enter="submit" />

<!-- Ctrl + Enter 组合键 -->
<input @keyup.ctrl.enter="send" />
```

### 常用按键别名

| 别名 | 按键 |
|------|------|
| `.enter` | 回车 |
| `.tab` | Tab |
| `.delete` | Delete / Backspace |
| `.esc` | Escape |
| `.space` | 空格 |
| `.up` `.down` `.left` `.right` | 方向键 |

### 系统修饰键

`.ctrl` `.alt` `.shift` `.meta`（Mac 的 ⌘ / Windows 的 ⊞）

```vue-html
<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + 点击 -->
<div @click.ctrl="doSomething">Ctrl+Click me</div>
```

### `.exact` — 精确匹配

```vue-html
<!-- 有 Ctrl 就行，同时按 Shift 也触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 必须只有 Ctrl，多按了别的就不触发 -->
<button @click.ctrl.exact="onCtrlClick">B</button>

<!-- 不能有任何系统修饰键 -->
<button @click.exact="onClick">C</button>
```

> 👉 **动手试试：** 右侧输入框分别试试 Enter、Esc、Space、Ctrl+Enter，观察反馈。

---

## 六、鼠标按键修饰符 {#mouse-button-modifiers}

限定由特定鼠标按键触发：

| 修饰符 | 按键 |
|--------|------|
| `.left` | 左键（主键） |
| `.right` | 右键（次键） |
| `.middle` | 中键（滚轮键） |

```vue-html
<div @click.right.prevent="onRightClick">右键点我</div>
```

> 注意：`.left` / `.right` / `.middle` 指的是逻辑主键/次键/辅助键，左手鼠标配置下物理按键会反过来。

> 👉 **动手试试：** 右侧最后一个区域，用左键、右键、中键分别点击，观察不同的反馈。

---

**总结：**

| 知识点 | 核心要点 |
|--------|---------|
| 内联处理器 | `@click="count++"` 一行表达式 |
| 方法处理器 | `@click="greet"` 不加括号，event 自动传入 |
| 传参 | `@click="say('hi')"` 加括号传参，`$event` 拿原生事件 |
| 事件修饰符 | `.stop` 阻止冒泡、`.prevent` 阻止默认、`.once` 只一次 |
| 按键修饰符 | `.enter` `.esc` `.ctrl.enter` 过滤特定按键 |
| 鼠标修饰符 | `.left` `.right` `.middle` 过滤鼠标按键 |
