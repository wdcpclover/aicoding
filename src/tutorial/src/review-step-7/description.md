# 【实战 3】列表页 + 卡片组件（props） {#review-step-7}

> 对应试卷 **`views/ActivityView.vue`（10 分）** + **`components/ActivityCard.vue`（10 分）**。
>
> 考点核心：**父子组件通信**——父用 `props` 往下传数据，子用 `emit` 往上抛事件。

## 一、卡片组件：用 props 接数据 {#card-props}

`ActivityCard.vue` 不自己请求数据，**只负责把传进来的活动渲染成一张卡片**：

```vue
<script setup>
// 声明这个组件能接收哪些 props
const props = defineProps({
  activity: { type: Object, required: true }
})

// 声明能往外抛哪些事件
const emit = defineEmits(['view'])

function onView() {
  emit('view', props.activity.id)   // 卡片被点 → 通知父组件
}
</script>

<template>
  <div class="card" @click="onView">
    <h3>{{ activity.title }}</h3>
    <p>📍 {{ activity.location }}</p>
    <p>👥 {{ activity.participants }} 人</p>
  </div>
</template>
```

> 📌 `defineProps` / `defineEmits` 是 `<script setup>` 里的**编译宏**，不用 import 直接用。

## 二、列表页：v-for + 传 props + 收 emit {#list-view}

```vue
<template>
  <input v-model="keyword" placeholder="搜索">
  <button @click="fetchList">搜索</button>

  <ActivityCard
    v-for="a in list"
    :key="a.id"
    :activity="a"        <!-- ① 父传子：props -->
    @view="onView"       <!-- ② 子传父：监听 emit -->
  />
</template>
```

```js
function onView(id) {
  // 拿到被点活动的 id，下一步用它跳详情页
  router.push(`/activities/${id}`)
}
```

## 三、父子通信一张图 {#flow}

```
父（ActivityView）                 子（ActivityCard）
  list ──:activity──────────────►  props.activity   （数据往下流）
  onView ◄──────@view── emit('view', id)            （事件往上抛）
```

> ⚠️ **铁律**：props **只读**，子组件不能直接改 `props.activity`。要改就 `emit` 通知父组件去改。

## 看右边 → {#try}

右边列表里的每张卡片都是 `ActivityCard` 组件实例。点任意一张 → 顶部出现提示（拿到了 id）。搜索框也还在工作。

➡️ 下一步：加 **Vue Router**，点卡片真正**跳到详情页**，并实现**报名**。
