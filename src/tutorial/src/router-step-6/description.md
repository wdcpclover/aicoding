# 导航守卫 {#navigation-guards}

**导航守卫**就是路由跳转过程中的"拦截器"——你可以在跳转前做检查，决定是**放行**、**取消**还是**重定向**。

最典型的用途：**登录拦截**。未登录用户访问后台页面，直接踢到登录页。

## 三个层级的守卫

| 守卫 | 注册位置 | 作用范围 |
|-----|---------|---------|
| 全局前置守卫 `router.beforeEach` | router 实例上 | 每次导航都执行 |
| 路由独享守卫 `beforeEnter` | 某条路由配置上 | 只有进入该路由时执行 |
| 组件内守卫 `beforeRouteEnter` 等 | 组件选项里 | 只对该组件的进入/更新/离开有效 |

用得最多的是**全局前置守卫** + **路由 meta**。

## 全局前置守卫

在 `router.js` 里创建 router 后写：

```js
router.beforeEach((to, from) => {
  // to: 即将进入的路由对象
  // from: 当前离开的路由对象

  // 返回 false：取消导航，留在 from
  // 返回路由对象：重定向到新位置
  // 返回 true / undefined：放行
})
```

> ⚠️ Vue Router 4 的守卫推荐用**返回值**控制，不再用 `next()`（虽然向后兼容，但容易写错）。

## 路由 meta

`meta` 是挂在路由上的自定义数据，守卫里可以读取：

```js
{
  path: '/admin',
  component: Admin,
  meta: { requiresAuth: true }
}

router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }
})
```

这样就不用在守卫里**硬编码路径列表**，新增受保护页面时加个 `meta: { requiresAuth: true }` 即可。

## 保存原始目标

用户想访问 `/admin` 但被踢到登录页 → 登录成功后应该跳回 `/admin`，不是首页。

做法：把目标路径塞进 query：

```js
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }  // ← 保存
    }
  }
})
```

登录成功后读出来：

<div class="options-api">

```js
methods: {
  doLogin() {
    auth.login(this.username)
    const target = this.$route.query.redirect || { name: 'home' }
    this.$router.replace(target)
  }
}
```

</div>

<div class="composition-api">

```js
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function doLogin() {
  auth.login(username.value)
  const target = route.query.redirect || { name: 'home' }
  router.replace(target)
}
```

</div>

> 登录跳转用 `replace` 而不是 `push` —— 避免用户按返回键又回到登录页。

## 路由独享守卫

如果只想守护单条路由，用 `beforeEnter`：

```js
{
  path: '/paid',
  component: Paid,
  beforeEnter: (to, from) => {
    if (!auth.isPaid) return { name: 'upgrade' }
  }
}
```

`beforeEnter` 是 `beforeEach` 之后、进组件之前执行的。

## 组件内守卫

组件选项里可以写三个守卫：

```js
export default {
  beforeRouteEnter(to, from) {
    // 进入该组件前 —— 此时 this 不可用（组件还没创建）
  },
  beforeRouteUpdate(to, from) {
    // 同组件复用时参数变化（如 /users/1 → /users/2）
  },
  beforeRouteLeave(to, from) {
    // 离开该组件前 —— 适合做"有未保存内容"的拦截
    if (hasUnsavedChanges && !confirm('有未保存的内容，确定离开？')) {
      return false
    }
  }
}
```

<div class="composition-api">

组合式里用函数形式：

```js
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value && !confirm('有未保存的内容，确定离开？')) {
    return false
  }
})
```

</div>

## 完整导航解析流程

```
1. 触发导航
2. 在失活的组件里调用 beforeRouteLeave
3. 调用全局 beforeEach
4. 在重用的组件里调用 beforeRouteUpdate
5. 调用路由配置里的 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局 beforeResolve
9. 导航确认
10. 调用全局 afterEach
11. 触发 DOM 更新
12. 用创建好的实例调用 beforeRouteEnter 中的 next 回调
```

日常开发主要只需要 1-9 前几步。

## 试试看

右侧示例演示登录拦截：

1. **未登录**状态下点击「后台」—— 会被守卫重定向到登录页
2. 登录页显示 `redirect=/admin`，说明原始目标被保存了
3. 输入任意用户名「登录」—— 自动跳回 `/admin`
4. 现在状态是已登录，`<RouterLink>` 的「后台」可以随意进
5. 点右上角「退出登录」，再去「后台」，又会被拦下

**练习**：加一条路由 `{ path: '/premium', meta: { requiresAuth: true }}`，无需改守卫代码，新页面自动受保护 —— 这就是 `meta` 的威力。
