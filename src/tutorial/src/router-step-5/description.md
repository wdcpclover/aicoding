# 命名路由与路由传参 {#named-routes-and-props}

这一节讲**两个配套使用**的小技巧，让路由代码更稳健、组件更易复用。

## 一、命名路由（name）

给路由起个名字，跳转时用 name 代替硬编码的 path：

```js
{
  name: 'user-detail',
  path: '/users/:id',
  component: UserDetail
}
```

### 跳转时用 name

```js
router.push({ name: 'user-detail', params: { id: 1 } })
```

```vue-html
<RouterLink :to="{ name: 'user-detail', params: { id: 1 } }">
  用户 1
</RouterLink>
```

### 为什么推荐用 name？

- **重构安全**：后面把 `/users/:id` 改成 `/u/:id`，只改 `router.js`，别的地方不用动
- **参数类型检查**：用对象形式时 IDE 和 TS 能做更好的类型提示
- **避免拼写错误**：path 拼错不会报错，name 拼错会

### name 的坑

- **name 必须唯一**：一个 name 只能对应一条路由
- **用 name 跳转 + params 时，不能写 path**：path 会覆盖掉 params

  ```js
  // ❌ 错：params 被忽略，只跳到 /users
  router.push({ path: '/users', params: { id: 1 } })

  // ✅ 正确：用 name + params
  router.push({ name: 'user-detail', params: { id: 1 } })

  // ✅ 也可以：path 里直接拼 params
  router.push(`/users/1`)
  ```

## 二、路由传参（props: true）

默认情况下，组件通过 `$route.params` 读取动态段：

```js
// ❌ 组件和路由耦合了 —— 测试时要 mock $route
export default {
  computed: {
    id() {
      return this.$route.params.id
    }
  }
}
```

这让组件**不能在路由之外复用**（比如单元测试、手动挂载）。

### 解法：`props: true`

在路由表里开启 `props: true`：

```js
{
  name: 'user-detail',
  path: '/users/:id',
  component: UserDetail,
  props: true   // ← 把 route.params 作为 props 传给组件
}
```

组件就可以纯粹用 props：

<div class="options-api">

```js
export default {
  props: {
    id: { type: String, required: true }
  },
  computed: {
    user() {
      return database[this.id]
    }
  }
}
```

</div>

<div class="composition-api">

```js
import { computed } from 'vue'

export default {
  props: {
    id: { type: String, required: true }
  },
  setup(props) {
    const user = computed(() => database[props.id])
    return { user }
  }
}
```

</div>

### props 的三种形式

```js
// 1. 布尔模式：route.params 全部作为 props
{ path: '/users/:id', component: User, props: true }

// 2. 对象模式：传固定值（不依赖路由）
{ path: '/promo', component: Promo, props: { source: 'email' } }

// 3. 函数模式：可以组合 params + query 自由塑形
{
  path: '/search',
  component: Search,
  props: route => ({
    query: route.query.q,
    page: Number(route.query.page || 1)
  })
}
```

> 如果你同时需要从 `query` 传参给组件，用**函数模式**。

## 三种形式对比

| 做法 | 优点 | 缺点 |
|-----|------|------|
| `$route.params.id` | 简单直接 | 组件耦合路由，不易测试 |
| `useRoute().params.id` | 组合式里自然 | 同上 |
| `props: true` + `props` 声明 | 解耦、易测、IDE 友好 | 需要在路由表和组件两处声明 |

对于**作为页面的**组件，推荐用 `props: true`。

## 试试看

右侧示例：

1. **导航栏**的三个 `<RouterLink>` 都是用 `:to="{ name: ..., params: ... }"` 对象形式
2. **首页**按钮也用 `router.push({ name: ... })`
3. **用户详情**模板里直接 `{{ id }}` —— 它是 props，不是 `$route.params`

**练习**：把 router.js 里的 path 改成 `/u/:id`，会发现导航和跳转**完全不用动**，因为它们只引用 name。
