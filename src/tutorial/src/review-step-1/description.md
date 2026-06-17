# 【知识 1】Vue 整体复习 {#review-step-1}

> **考前复习篇**分两部分：前 4 节（知识 1~4）把 **Vue / 路由 / Pinia / Express** 各自过一遍；后 6 节（实战）用一道真题把它们串成完整项目。
>
> 这一节把 **Vue 单文件组件**最常用的语法一次性串起来——右边是一个能玩的待办小应用，每个语法点都在里面。

## 一、组合式 API 三件套 {#core}

```vue
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const count = ref(0)              // ① ref：基本类型
const user = reactive({ age: 1 }) // ② reactive：对象
const double = computed(() => count.value * 2)  // ③ computed：派生

function add() { count.value++ }  // 方法：ref 在 JS 里要 .value
</script>
```

> 📌 `ref` 在 **JS 里读写要 `.value`**，在**模板里自动解包**（直接写 `count`）。

## 二、模板语法速查 {#template}

| 语法 | 作用 | 例子 |
|---|---|---|
| `{{ }}` | 文本插值 | `{{ title }}` |
| `v-bind` / `:` | 属性绑定 | `:class="{ done: t.done }"` |
| `v-model` | 表单双向绑定 | `<input v-model="input">` |
| `v-on` / `@` | 事件 | `@click="add"`、`@submit.prevent` |
| `v-for` | 列表渲染（必带 `:key`） | `v-for="t in todos" :key="t.id"` |
| `v-if` / `v-else` | 条件渲染 | `<p v-if="allDone">` |

## 三、组件通信：props 下 / emit 上 {#comm}

```vue
<!-- 子组件 TodoItem -->
<script setup>
const props = defineProps({ todo: Object })     // 父 → 子
const emit = defineEmits(['toggle', 'remove'])   // 子 → 父
</script>
```

```vue
<!-- 父组件 -->
<TodoItem :todo="t" @toggle="toggle" @remove="remove" />
```

> ⚠️ **props 只读**，要改数据 `emit` 通知父组件改。

## 四、watch 与生命周期 {#watch}

```js
watch(remaining, (n) => console.log('剩余', n))  // 侦听器：值变了做副作用
onMounted(() => console.log('挂载完成'))           // 生命周期
```

## 看右边 → {#try}

右边的待办应用里：

- 输入框 `v-model` 双向绑定，回车 `@submit.prevent` 添加
- 列表 `v-for` 渲染，每项是 **TodoItem 子组件**（props 传入 / emit 抛出勾选、删除）
- 顶部「剩余 N 项」「全部完成」是 **computed** 派生
- 打开浏览器控制台，能看到 **watch / onMounted** 的日志

➡️ 下一节：**路由复习**。
