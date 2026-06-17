# 生命周期 {#lifecycle}

每个 Vue 组件从创建到销毁，都会经历一系列**生命周期阶段**。Vue 在关键时刻提供**钩子函数**，让你在特定阶段执行自定义逻辑。

---

## 一、生命周期全览 {#overview}

<div class="options-api">

| 钩子 | 时机 | 典型用途 |
|------|------|---------|
| `beforeCreate` | 实例刚初始化，`data`/`methods` **不可用** | 极少使用 |
| `created` | 实例创建完成，`data` 可用，**DOM 不可用** | 发请求、初始化数据 |
| `beforeMount` | 模板编译完成，即将挂载到 DOM | 极少使用 |
| `mounted` | DOM 挂载完成，可以访问真实 DOM | 操作 DOM、启动定时器、初始化第三方库 |
| `beforeUpdate` | 响应式数据变了，DOM **即将**重新渲染 | 读取更新前的 DOM 状态 |
| `updated` | DOM 已经重新渲染完成 | 操作更新后的 DOM（谨慎使用） |
| `beforeUnmount` | 组件即将从 DOM 移除 | 清理定时器、取消事件监听 |
| `unmounted` | 组件已从 DOM 移除，所有响应式效果已停止 | 最终清理 |

</div>
<div class="composition-api">

| 钩子 | 时机 | 典型用途 |
|------|------|---------|
| `setup()` | 等价于 beforeCreate + created | 初始化响应式数据、发请求 |
| `onBeforeMount()` | 模板编译完成，即将挂载到 DOM | 极少使用 |
| `onMounted()` | DOM 挂载完成，可以访问真实 DOM | 操作 DOM、启动定时器、初始化第三方库 |
| `onBeforeUpdate()` | 响应式数据变了，DOM **即将**重新渲染 | 读取更新前的 DOM 状态 |
| `onUpdated()` | DOM 已经重新渲染完成 | 操作更新后的 DOM（谨慎使用） |
| `onBeforeUnmount()` | 组件即将从 DOM 移除 | 清理定时器、取消事件监听 |
| `onUnmounted()` | 组件已从 DOM 移除，所有响应式效果已停止 | 最终清理 |

</div>

下面这张官方图示展示了完整的生命周期流程，对照右侧日志来理解：

<img src="/guide/essentials/images/lifecycle_zh-CN.png" alt="Vue 组件生命周期图示" style="max-width: 420px; margin: 12px auto; display: block;" />

> 👉 **动手试试：** 右侧页面加载后，日志面板已经记录了创建和挂载阶段的钩子触发顺序。对照上图理解每个钩子的触发时机。

---

## 二、创建阶段 {#creation}

<div class="options-api">

```js
export default {
  beforeCreate() {
    // 实例刚初始化，data/methods 还不可用
    // 此时 this.xxx 全是 undefined
    console.log('beforeCreate')
  },
  created() {
    // data/computed/methods 已就绪，但 DOM 还没渲染
    // 适合发请求、初始化数据
    console.log('created', this.count)  // 可以访问 data
  }
}
```

:::warning beforeCreate 的限制
`beforeCreate` 中 `this.data` 和 `this.methods` 都还不存在。实际开发中几乎不用这个钩子——需要提前初始化的逻辑放到 `created` 即可。
:::

</div>
<div class="composition-api">

```js
import { ref } from 'vue'

export default {
  setup() {
    // setup() 本身就是创建阶段
    // 相当于 beforeCreate + created
    const count = ref(0)
    console.log('setup 执行，count:', count.value)

    // 这里可以发请求、初始化数据
    // 但 DOM 还没渲染，不能操作 DOM
  }
}
```

:::tip setup() = beforeCreate + created
组合式 API 没有单独的 `beforeCreate`/`created` 钩子——`setup()` 函数本身就运行在这个阶段。你在 `setup()` 里写的代码就等价于 `created` 中的逻辑。
:::

</div>

---

## 三、挂载阶段 {#mounting}

<div class="options-api">

```js
export default {
  beforeMount() {
    // 模板已编译，但还没插入 DOM
    // this.$el 还不可用
  },
  mounted() {
    // DOM 已渲染完成！可以安全操作 DOM
    // this.$el 可用，this.$refs 可用
    console.log('DOM 已就绪:', this.$el)
  }
}
```

</div>
<div class="composition-api">

```js
import { ref, onBeforeMount, onMounted } from 'vue'

export default {
  setup() {
    const myRef = ref(null)

    onBeforeMount(() => {
      // 模板已编译，但还没插入 DOM
      console.log('即将挂载，ref 还是:', myRef.value)  // null
    })

    onMounted(() => {
      // DOM 已渲染完成！可以安全操作 DOM
      console.log('已挂载，ref 是:', myRef.value)  // DOM 元素
    })
  }
}
```

</div>

`mounted` 是最常用的钩子之一——初始化图表库、注册全局事件监听、获取 DOM 尺寸等都在这里做。

> 👉 **动手试试：** 观察日志面板中 beforeMount → mounted 的顺序。

---

## 四、更新阶段 {#updating}

当响应式数据变化导致 DOM 重新渲染时，更新钩子会触发。

<div class="options-api">

```js
export default {
  beforeUpdate() {
    // 数据已变，DOM 还没更新
    // 可以读取更新前的 DOM 状态
  },
  updated() {
    // DOM 已重新渲染完成
    // 注意：不要在这里修改响应式数据，否则会无限循环！
  }
}
```

</div>
<div class="composition-api">

```js
import { onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    onBeforeUpdate(() => {
      // 数据已变，DOM 还没更新
    })
    onUpdated(() => {
      // DOM 已重新渲染完成
      // 注意：不要在这里修改响应式数据，否则会无限循环！
    })
  }
}
```

</div>

:::warning 避免在 updated 中修改数据
在 `updated` 里修改响应式数据会再次触发更新，可能导致**无限循环**。如果需要根据 DOM 状态调整数据，用 `nextTick` 或 `watch` 替代。
:::

> 👉 **动手试试：** 点击右侧「计数器 +1」按钮，观察日志中 beforeUpdate → updated 成对出现。

---

## 五、卸载阶段 {#unmounting}

组件被 `v-if` 移除或路由切换时，卸载钩子触发。

<div class="options-api">

```js
export default {
  beforeUnmount() {
    // 组件还在 DOM 中，但即将被移除
    // 适合清理：取消定时器、移除事件监听、断开 WebSocket
    clearInterval(this.timer)
  },
  unmounted() {
    // 组件已从 DOM 移除，所有响应式效果已停止
    console.log('组件已销毁')
  }
}
```

</div>
<div class="composition-api">

```js
import { onBeforeUnmount, onUnmounted } from 'vue'

export default {
  setup() {
    const timer = setInterval(() => { /* ... */ }, 1000)

    onBeforeUnmount(() => {
      // 组件即将被移除，做清理工作
      clearInterval(timer)
    })
    onUnmounted(() => {
      // 组件已完全销毁
      console.log('组件已销毁')
    })
  }
}
```

</div>

:::tip 不清理 = 内存泄漏
如果在 `mounted` 中注册了定时器、事件监听、WebSocket 连接等，**必须**在 `beforeUnmount` 中清理。否则组件虽然不显示了，但后台资源还在占用——这就是内存泄漏。
:::

> 👉 **动手试试：** 点击「挂载子组件」→ 再点「卸载子组件」，观察子组件完整的创建 → 挂载 → 卸载 → 销毁流程。反复切换可以看到每次都经历完整生命周期。

---

## 六、执行顺序 {#execution-order}

### 父子组件的钩子顺序

当父组件包含子组件时，钩子的触发顺序是：

<div class="options-api">

```
父 beforeCreate → 父 created → 父 beforeMount
  → 子 beforeCreate → 子 created → 子 beforeMount → 子 mounted
→ 父 mounted
```

卸载时：

```
父 beforeUnmount
  → 子 beforeUnmount → 子 unmounted
→ 父 unmounted
```

</div>
<div class="composition-api">

```
父 setup() → 父 onBeforeMount
  → 子 setup() → 子 onBeforeMount → 子 onMounted
→ 父 onMounted
```

卸载时：

```
父 onBeforeUnmount
  → 子 onBeforeUnmount → 子 onUnmounted
→ 父 onUnmounted
```

</div>

规律：**父组件等子组件完成后，自己才完成**。就像搭积木——先把内部零件装好，外壳才能合上。

> 👉 **动手试试：** 挂载子组件后观察日志，注意父子钩子的交错顺序是否符合上述规律。

---

**总结：**

<div class="options-api">

| 阶段 | 钩子 | 要点 |
|------|------|------|
| 创建 | `beforeCreate` → `created` | created 中 data 可用，适合发请求 |
| 挂载 | `beforeMount` → `mounted` | mounted 中 DOM 可用，适合操作 DOM |
| 更新 | `beforeUpdate` → `updated` | 数据变化触发，不要在 updated 中改数据 |
| 卸载 | `beforeUnmount` → `unmounted` | 清理定时器/监听/连接，防止内存泄漏 |

</div>
<div class="composition-api">

| 阶段 | 钩子 | 要点 |
|------|------|------|
| 创建 | `setup()` | 等价于 beforeCreate + created |
| 挂载 | `onBeforeMount` → `onMounted` | onMounted 中 DOM 可用，适合操作 DOM |
| 更新 | `onBeforeUpdate` → `onUpdated` | 数据变化触发，不要在 onUpdated 中改数据 |
| 卸载 | `onBeforeUnmount` → `onUnmounted` | 清理定时器/监听/连接，防止内存泄漏 |

</div>
