# 入门与安装 {#routing-install}

**Vue Router** 是 Vue 官方的路由管理器，让你可以用 **URL 路径**控制页面切换——就像多个独立页面，但其实是单页应用（SPA）。

## 安装

真实项目里先装包：

```bash
# pnpm
pnpm add vue-router@4

# npm
npm install vue-router@4

# yarn
yarn add vue-router@4
```

> 本教程右侧 REPL 已通过 `import-map.json` 直接引入 CDN 上的 vue-router，不需要手动安装。

## 核心概念

路由由三部分组成：

1. **路由表（routes）**：一张 `path → component` 的映射表
2. **`<RouterLink>`**：声明式导航（相当于增强版的 `<a>` 标签）
3. **`<RouterView>`**：路由出口，匹配到的组件会渲染到这里

## 项目结构

真实项目里路由配置通常单独放在一个文件，结构清晰：

```
src/
├── main.js          ← 入口，app.use(router)
├── App.vue          ← 根组件，包含 <RouterView>
├── router.js        ← 路由配置（本示例）
└── views/
    ├── Home.vue
    ├── About.vue
    └── Contact.vue
```

右侧示例就是按这个结构拆分的，重点看 **`router.js`**。

## 三步走

### ① 在 `router.js` 里定义路由表并创建 router

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './Home.vue'
import About from './About.vue'
import Contact from './Contact.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
// ⚠️ 教程 REPL 中改用 createMemoryHistory() 以免 hash 与外层页面冲突
```

### ② 在 `main.js` 里安装 router

```js
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'

createApp(App).use(router).mount('#app')
```

> 教程 REPL 没有独立的 `main.js`，所以 App 组件内用 `getCurrentInstance().appContext.app.use(router)`（组合式）或 `this.$.appContext.app.use(router)`（选项式）等价实现 —— **真实项目请写在 `main.js` 里**。

### ③ 在 `App.vue` 里写导航与路由出口

```vue-html
<nav>
  <RouterLink to="/">首页</RouterLink>
  <RouterLink to="/about">关于</RouterLink>
  <RouterLink to="/contact">联系</RouterLink>
</nav>

<RouterView />
```

- `RouterLink` 渲染成 `<a>` 标签，点击不会刷新页面
- 当前匹配的链接会自动添加 `router-link-active` 类名（可用于高亮）
- `RouterView` 是路由渲染出口，匹配到的组件会在此处渲染

## 三种历史模式

| 模式 | 创建方式 | URL 样子 | 使用场景 |
|-----|---------|---------|---------|
| Hash | `createWebHashHistory()` | `/#/about` | 无需服务端配合，静态部署最简单 |
| History | `createWebHistory()` | `/about` | 生产推荐，但需服务端 fallback 到 `index.html` |
| Memory | `createMemoryHistory()` | 不改 URL | SSR / 测试 / 教程示例（本页就是） |

本教程右侧示例用 **Memory 模式** —— 因为教程外层 URL 已经用 hash 做了步骤切换（`#step-17`），如果内部路由再改 hash 会产生冲突。真实项目里请按场景选择 Hash 或 History。

## 进阶：路由懒加载

项目变大后，每个页面对应一个路由组件。如果 `router.js` 里把**所有**页面都 `import` 进来：

```js
// ❌ 饿汉式：一次性全部打进主 bundle
import Home from './views/Home.vue'
import About from './views/About.vue'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'
// ...几十个 view
```

打包后用户首次访问首页，就得把所有页面的 JS 都下载下来 —— **浪费流量、拖慢首屏**。

### 解法：动态 import

把 `component` 字段换成一个**返回 Promise 的函数**，Vite/Webpack 会把它拆成独立的 chunk，**用到时才按需加载**：

```js
const routes = [
  // ✅ 懒加载：只在访问 /about 时才下载 About.js
  { path: '/about', component: () => import('./views/About.vue') },
  { path: '/dashboard', component: () => import('./views/Dashboard.vue') },
  { path: '/settings', component: () => import('./views/Settings.vue') }
]
```

就这一点改动 —— 把 `component: X` 换成 `component: () => import(...)`。

### 对比

|   | 普通 import（饿汉式） | 动态 import（懒加载） |
|---|-----|-----|
| 语法 | `import X from './X.vue'` + `component: X` | `component: () => import('./X.vue')` |
| 打包产物 | 合并进主 bundle | 独立 chunk（如 `About-a1b2.js`） |
| 下载时机 | 页面打开就下载 | 首次访问该路由时下载 |
| 首屏速度 | 慢（下载所有页面） | 快（只下载当前页） |
| 适合场景 | 2-3 个小页面 | **生产默认选择** |

### 按组打包（同一 chunk）

用到时再下载，但有时想把**相关页面打在同一个 chunk**（比如 admin 下的多个页面）。Vite 里用魔法注释：

```js
{ path: '/admin', component: () => import(/* webpackChunkName: "admin" */ './Admin.vue') },
{ path: '/admin/users', component: () => import(/* webpackChunkName: "admin" */ './AdminUsers.vue') }
```

> Vite 5+ 默认按 import 路径自动分组，通常不需要手动指定。

### 加个 loading

懒加载组件有网络延迟，可用 `defineAsyncComponent` 配 loading 状态：

```js
import { defineAsyncComponent } from 'vue'

const About = defineAsyncComponent({
  loader: () => import('./About.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorBanner,
  delay: 200,        // 200ms 还没加载完才显示 loading（避免闪烁）
  timeout: 3000      // 3s 还没加载完就显示 error
})

// 然后正常用
{ path: '/about', component: About }
```

> REPL 环境里所有文件都在内存，演示不出懒加载效果；真实项目 `pnpm build` 后看 `dist/assets/` 下的独立 `.js` 文件就能看出差异。

## 访问当前路由

在模板里用 `$route`：

```vue-html
<p>当前路径：{{ $route.path }}</p>
```

<div class="composition-api">

在 `<script setup>` 里用 `useRoute()`（下一节详细讲）：

```js
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.path)
```

</div>

## 试试看

右侧的示例已经配好三个页面，点击顶部导航链接切换，观察：

- 当前激活的链接变成绿色（`router-link-active`）
- 页面内容和 `$route.path` 都跟着变
- 打开 `router.js` 看路由表是如何集中管理的
