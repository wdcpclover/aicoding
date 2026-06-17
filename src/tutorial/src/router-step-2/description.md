# 动态路由匹配 {#dynamic-routing}

很多时候，我们需要把**同一个组件**映射到**不同 URL** —— 比如 `/users/1`、`/users/2` 都显示用户详情页，只是 ID 不一样。

这就是**动态路由匹配**。

## 声明动态段

在路径里用冒号 `:` 标记参数：

```js
{ path: '/users/:id', component: UserDetail }
```

- `/users/1` 匹配 → `route.params.id === '1'`
- `/users/2` 匹配 → `route.params.id === '2'`
- `/users/abc` 也匹配 → `route.params.id === 'abc'`

> 参数值永远是字符串。如果要数字，自己转 `Number(id)`。

## 读取参数

<div class="options-api">

选项式通过 `this.$route.params` 读取：

```js
export default {
  computed: {
    id() {
      return this.$route.params.id
    }
  }
}
```

</div>

<div class="composition-api">

组合式用 `useRoute()` 获得响应式路由对象：

```js
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const id = computed(() => route.params.id)
```

> ⚠️ **不要解构** `useRoute()` 返回的对象：`const { params } = useRoute()` 会丢失响应性。

</div>

## 组件复用的坑

从 `/users/1` 切到 `/users/2`，Vue Router 会**复用同一个组件实例** —— 因为是同一个路由、同一个组件。这意味着：

- ✅ `route.params` 是响应式的，模板会自动更新
- ❌ `setup()` / `created()` / `mounted()` 只会触发一次，不会在参数变化时重新执行

如果你要在参数变化时做些事（比如重新请求数据），就得**显式监听**：

<div class="options-api">

```js
watch: {
  '$route.params.id'(newId, oldId) {
    // 重新请求数据
  }
}
```

</div>

<div class="composition-api">

```js
import { watch } from 'vue'

watch(() => route.params.id, (newId, oldId) => {
  // 重新请求数据
})
```

</div>

右侧的示例中 `visitCount` 就是用 `watch` 累加的，侧面证明组件没有被销毁重建。

## 响应路由变化的几种方式

| 需求 | 方案 |
|------|------|
| 模板里展示参数 | 直接用 `{{ $route.params.id }}`（自动响应式） |
| 参数变化重新请求数据 | `watch` 监听 `route.params.id` |
| 参数变化重建组件 | 给 `<RouterView>` 加 `:key="$route.fullPath"`（慎用，会丢状态） |

## 捕获所有路由（404）

没有匹配到任何路由的 URL 不能白白丢给用户看空白页。通用做法是**加一条兜底路由**，放在路由表**最后**：

```js
import NotFound from './NotFound.vue'

const routes = [
  { path: '/', component: UserList },
  { path: '/users/:id', component: UserDetail },
  // 放最后，否则会抢先匹配其他路由
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

### `/:pathMatch(.*)*` 拆开看

这个看起来像乱码的路径其实是三部分：

| 部分 | 含义 |
|-----|------|
| `:pathMatch` | 参数名（任意起名，读取时用 `route.params.pathMatch`） |
| `(.*)` | 正则：匹配任意字符（包括斜杠） |
| `*` | 重复符号：表示**可包含多级路径段** |

匹配效果：

| URL | `route.params.pathMatch` |
|-----|--------------------------|
| `/foo` | `['foo']` |
| `/foo/bar` | `['foo', 'bar']` |
| `/a/b/c/d` | `['a', 'b', 'c', 'd']` |

> 如果去掉末尾的 `*`，变成 `/:pathMatch(.*)`，参数就变成字符串 `'foo/bar'` 而不是数组。通常**保留 `*`** 更自然。

### 在 404 页面里显示原始路径

```vue-html
<p>找不到：<code>{{ $route.fullPath }}</code></p>
```

用 `$route.fullPath` 能拿到完整的原始 URL（含 query 和 hash），比拼 `pathMatch` 更省事。

### 细分 404 场景

也可以给不同模块配不同的 404 页面：

```js
// 全局兜底
{ path: '/:pathMatch(.*)*', component: GlobalNotFound },

// 只兜 /users 下面的未匹配路径
{
  path: '/users/:pathMatch(.*)*',
  component: UserNotFound
}
```

Vue Router 会选**最具体**的那条匹配，所以 `/users/xyz/abc` 会走到 `UserNotFound`，而 `/other/path` 走到 `GlobalNotFound`。

## 试试看

右侧导航有 3 个用户链接，点击切换，观察：

- 详情页里的 `id` 和姓名随参数变化
- **跳转次数在累加** —— 证明组件没有被销毁重建，`watch` 才是捕捉参数变化的正确方式
- 导航栏里高亮的链接跟着变化（`router-link-active` 对动态段也生效）
