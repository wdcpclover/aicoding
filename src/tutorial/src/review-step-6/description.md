# 【实战 2】Pinia store：管数据 + 搜索 {#review-step-6}

> 对应试卷 **`store/activity.js`（15 分）**——全卷分值最高的文件之一。
>
> store 的职责：**把"数据 + 请求 + loading"收进一个地方**，让任何组件都能读同一份。

## 一、一个 store 的标准骨架 {#skeleton}

考试就按这个套路写（组合式）：

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useActivityStore = defineStore('activity', () => {
  // ① state：响应式数据
  const list = ref([])
  const keyword = ref('')
  const loading = ref(false)

  // ② getter：派生数据
  const total = computed(() => list.value.length)

  // ③ action：异步请求 + 改 state
  async function fetchList() {
    loading.value = true
    try {
      list.value = await request.get('/activities', {
        params: { keyword: keyword.value }   // 搜索词作为 query
      })
    } finally {
      loading.value = false
    }
  }

  // ④ 一定要 return 出去，组件才用得到
  return { list, keyword, loading, total, fetchList }
})
```

> 📌 三段式背下来：**state（ref）→ getter（computed）→ action（async function）→ return**。

## 二、组件里怎么用 {#use-in-component}

```js
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/store/activity'

const store = useActivityStore()
const { list, keyword, loading } = storeToRefs(store)  // state/getter 用它，保响应式
const { fetchList } = store                            // action 直接解构
```

> ⚠️ **最易错点**：`const { list } = store` 会**丢响应式**！state 和 getter 必须用 `storeToRefs`，action 不用。

## 三、搜索两种做法 {#search}

| 做法 | 怎么写 | 适用 |
|---|---|---|
| **后端搜**（本 demo） | keyword 作为 query 传给后端，后端返回过滤后的列表 | 数据量大 |
| **前端搜** | 列表全拿回来，用 `computed` 本地 `filter` | 数据量小 |

前端搜的写法（考试也常用）：

```js
const filtered = computed(() =>
  list.value.filter(a => a.title.includes(keyword.value))
)
```

## 看右边 → {#try}

右边搜索框的输入**直接 `v-model` 绑到 `store.keyword`**，回车就 `fetchList()`。试搜「编程」「简历」。

➡️ 下一步：把这个朴素列表升级成**卡片组件**，练 `props` 父传子。
