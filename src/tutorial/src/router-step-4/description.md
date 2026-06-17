# 编程式导航 {#programmatic-navigation}

用 `<RouterLink>` 写在模板里的是**声明式导航**；在代码（事件处理器、守卫、异步回调）里用方法触发的跳转叫**编程式导航**。

典型场景：
- 登录成功后跳到首页
- 表单提交成功后跳到详情
- 倒计时结束自动跳转
- 条件判断后决定去哪

## 拿到 router 实例

<div class="options-api">

选项式里用 `this.$router`：

```js
this.$router.push('/users/1')
```

</div>

<div class="composition-api">

组合式里用 `useRouter()`：

```js
import { useRouter } from 'vue-router'

const router = useRouter()
router.push('/users/1')
```

> ⚠️ 不要和 `useRoute()` 混淆：`useRouter()` 返回 **router 实例**（用来跳转），`useRoute()` 返回**当前路由信息**（params/query 等）。

</div>

## 三大常用方法

### `push` —— 导航到新 URL

```js
// 字符串形式
router.push('/users/1')

// 对象形式（推荐：更灵活）
router.push({ path: '/users/1' })

// 带 query 参数
router.push({ path: '/search', query: { q: 'vue' } })

// 带 hash
router.push({ path: '/about', hash: '#team' })
```

### `replace` —— 不留历史记录

和 `push` 用法一样，但**不会**往历史栈加新记录：

```js
router.replace('/login')
```

用户按浏览器后退按钮时，**不会回到** `replace` 前的页面。常用于登录跳转、重定向。

声明式版本：`<RouterLink to="/login" replace>`

### `back` / `forward` / `go` —— 历史记录导航

```js
router.back()       // 后退一步（= 浏览器后退按钮）
router.forward()    // 前进一步
router.go(-2)       // 后退两步
router.go(1)        // 前进一步
```

## `push` 的返回值

`router.push` 返回一个 Promise，resolve 时导航完成：

```js
await router.push('/users/1')
console.log('已经到详情页了')
```

如果导航被守卫取消或重定向，resolve 的值会有 `failure` 信息。

## query 参数

URL `?key=value` 部分叫 query，通过 `route.query.key` 读取：

| URL | `route.query` |
|-----|---------------|
| `/search?q=vue` | `{ q: 'vue' }` |
| `/search?q=vue&page=2` | `{ q: 'vue', page: '2' }` |
| `/search` | `{}` |

> query 和 params 的区别：
> - **params**：路由表里声明过的动态段（`/users/:id` 的 `id`）
> - **query**：URL 末尾的 `?xxx=yyy`，任何路由都能带

## 常用写法对照

<div class="options-api">

```js
// 跳首页
this.$router.push('/')

// 带参数
this.$router.push(`/users/${id}`)

// 带 query
this.$router.push({ path: '/search', query: { q: 'vue' } })

// 替换
this.$router.replace('/login')

// 返回
this.$router.back()
```

</div>

<div class="composition-api">

```js
import { useRouter } from 'vue-router'
const router = useRouter()

// 跳首页
router.push('/')

// 带参数
router.push(`/users/${id}`)

// 带 query
router.push({ path: '/search', query: { q: 'vue' } })

// 替换
router.replace('/login')

// 返回
router.back()
```

</div>

## 试试看

右侧示例：

1. **首页**点按钮跳转用户，注意 "replace 模式" 的按钮跳到用户 3 后，点"返回"会直接回到首页 —— 因为它不留历史
2. **搜索页**输入关键字回车，URL 变成 `/search?q=xxx`，`$route.query` 随之更新
3. **用户详情页**试试三个按钮：back / 回首页 / 下一个用户
