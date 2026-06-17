# 【实战 4】路由 + 动态参数详情页 + 报名 {#review-step-8}

> 对应试卷 **`router/index.js`（路由表部分）** + **`views/ActivityDetailView.vue`（10 分）**。
>
> 考点：**动态路由 `/activities/:id`**、**编程式导航 `router.push`**、**详情页按 id 拉数据 + 报名**。

## 一、路由表：动态参数 + props {#routes}

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { name: 'list',   path: '/',               component: ActivityView },
  {
    name: 'detail',
    path: '/activities/:id',   // ★ :id 是动态参数
    component: ActivityDetailView,
    props: true                // ★ 把 :id 当 props 传给组件
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
```

> 📌 `props: true` 后，组件用 `defineProps({ id })` 就能拿到 `:id`，不必再 `useRoute().params.id`，组件更干净、更好测。

## 二、列表页点卡片 → 跳详情 {#navigate}

```js
import { useRouter } from 'vue-router'
const router = useRouter()

function goDetail(id) {
  router.push(`/activities/${id}`)   // 编程式导航
}
```

## 三、详情页：按 id 拉数据 + 报名 {#detail}

```vue
<script setup>
const props = defineProps({ id: [String, Number] })
const store = useActivityStore()
const { current } = storeToRefs(store)

onMounted(() => store.fetchOne(props.id))   // 进页面就按 id 请求

function onRegister() {
  store.register(props.id)                  // 报名 → POST
}
</script>
```

store 里对应的 action：

```js
async function fetchOne(id) {
  current.value = await request.get(`/activities/${id}`)
}
async function register(id) {
  await request.post(`/activities/${id}/register`)
  await fetchMy()   // 报名后刷新「我的活动」
}
```

## 看右边 → {#try}

右边现在是**两个页面**：

1. 列表页点任意卡片 → 跳到 **`/activities/:id` 详情页**（看 URL 变化）
2. 详情页点「立即报名」→ 报名成功，下方「我报名的活动」出现该活动
3. 点「‹ 返回列表」回到列表

> 💡 注意：`router-view` 是路由的「显示窗口」，匹配到哪个路由就在这里渲染哪个组件。

➡️ 最后一步：加**路由守卫**——未登录访问活动页**自动踢回登录页**，并把整套串成完整应用。
