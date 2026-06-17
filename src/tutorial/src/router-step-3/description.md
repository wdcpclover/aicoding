# 嵌套路由 {#nested-routes}

真实应用的 UI 往往是**多层嵌套**的：用户页 `/users/1` 内部还有「资料」和「帖子」两个标签页。URL 要能反映这种层级：

```
/users/1          ← 用户 1 的资料（默认）
/users/1/posts    ← 用户 1 的帖子
```

Vue Router 通过 `children` 字段表达嵌套关系。

## 配置嵌套路由

```js
{
  path: '/users/:id',
  component: User,
  children: [
    // /users/:id  —— 空 path 表示父路由的默认子路由
    { path: '', component: Profile },
    // /users/:id/posts  —— 不以 / 开头，表示相对父路径
    { path: 'posts', component: Posts }
  ]
}
```

### ⚠️ 关于 `/` 前缀

子路由的 `path` **不要**以 `/` 开头 —— 以 `/` 开头就变成绝对路径了，会脱离父路由。

```js
children: [
  { path: 'posts', component: Posts },   // ✅ 匹配 /users/:id/posts
  { path: '/posts', component: Posts }   // ❌ 匹配 /posts
]
```

## 多层 RouterView

嵌套路由需要**多个** `<RouterView>`：每一层各一个。

**App.vue**（外层）：

```vue-html
<nav>...</nav>
<RouterView />   <!-- 这里渲染 User 组件 -->
```

**User.vue**（中层，本身是子路由组件）：

```vue-html
<h3>用户 {{ $route.params.id }}</h3>

<nav>
  <RouterLink :to="`/users/${$route.params.id}`">Profile</RouterLink>
  <RouterLink :to="`/users/${$route.params.id}/posts`">Posts</RouterLink>
</nav>

<RouterView />   <!-- 这里渲染 Profile / Posts -->
```

一句话：**每一层 RouterView 对应一层子路由**。

## `router-link-active` vs `router-link-exact-active`

嵌套路由下，RouterLink 有两个激活样式：

| 类名 | 触发条件 |
|-----|---------|
| `router-link-active` | 当前路由包含该链接（父级也会亮） |
| `router-link-exact-active` | 当前路由**完全等于**该链接（只有精确匹配才亮） |

在子导航里一般用 `exact-active` 才不会串亮。右侧示例的 Profile/Posts 子导航就是用了它。

## 空 path 的技巧

```js
children: [
  { path: '', component: Profile }
]
```

这样 `/users/1` 就默认显示 Profile。如果不配这条，访问 `/users/1` 时子 `<RouterView>` 会是空的。

也可以用 `redirect` 重定向：

```js
{ path: '/users/:id', redirect: to => `/users/${to.params.id}/profile` }
```

## 试试看

右侧示例：

1. 进入 **用户 1**，默认显示 **Profile**
2. 点击 **Posts** 标签，URL 变为 `/users/1/posts`
3. 注意：外层导航的"用户 1"仍然高亮（`router-link-active` 包含关系）
4. 子导航里只有精确匹配的标签高亮（`router-link-exact-active`）

**练习**：给 User 加第三个子路由 `settings`，显示一个简单的"设置"页。
