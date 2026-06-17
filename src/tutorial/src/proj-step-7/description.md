# 聊天主界面 —— ChatView 全套 {#proj-step-7}

> 项目的"门面"。走 **需求 → 详细设计 → 实现**——
> 把"用户看到对话、新建对话、跟 AI 一问一答、删 / 改对话"做出来。

## 🎯 第一步：需求

兑现 [第 1 节用户故事](#proj-step-1) 的 #3 #4 #5 #6：

```
# | 用户故事
──┼──────────────────────────────────
3 | 看我自己所有的对话列表
4 | 新对话（开一个空对话）
5 | 在对话里输入一句话，几秒后看到 AI 回复
6 | 删除 / 重命名对话
```

业务侧期望的**体验细节**（来自实际用 ChatGPT/Claude 的直觉）：

```
A. 点开页面立刻看到对话列表 + 当前对话
B. 新消息进来自动滚到底（不用手动拉）
C. AI 回复支持代码块、列表、表格（Markdown）
D. 我发送时立刻看到自己消息（不要等 AI 回完）
E. 按 Enter 发送，Shift+Enter 换行
F. 中文输入法选字时按 Enter 不要发送
G. 输入框跟着我打字长度自适应高度
H. 点对话外面菜单自动关
I. 顶部一眼看到"用的是哪个 AI"
```

**业务约束**：

- 一个用户只看到**自己的**对话（数据隔离）
- 删 / 改对话**只能删自己的**（鉴权 + 所有权校验）

## 🔍 第二步：详细设计

### 设计 1 — 整体布局：双栏 Flex + 内部独立滚动

```
┌────────────┬───────────────────────────────────┐
│            │  ┌─ header（标题 + provider）──┐  │
│  侧栏       │  ├─────────────────────────────┤  │
│  width:260  │  │                              │  │
│  flex-      │  │  消息区  flex:1              │  │
│  shrink:0   │  │  overflow-y: auto            │  │
│            │  │  ← 只这块滚动                 │  │
│  ←─ 头     │  │                              │  │
│     列表    │  │                              │  │
│     底     │  │                              │  │
│            │  ├─────────────────────────────┤  │
│            │  │  输入区（固定底部）          │  │
│            │  └─────────────────────────────┘  │
└────────────┴───────────────────────────────────┘
.app {
  display: flex;
  height: 100vh;        ← 占满视口
  overflow: hidden;     ← 整体不滚
}
```

→ 顶部 header + 底部 input **永远在视野**，只有中间消息列表滚动。**所有现代聊天应用都是这套结构**（VS Code / Slack / Discord / ChatGPT）。

### 设计 2 — 拆组件的 3 条规则

ChatView 容易写成一个 800 行的怪物。**拆**：

```
什么时候拆？
  ① 单文件超过 150 行
  ② 能在另一个页面复用
  ③ 职责单一

ChatView 拆分：
  ChatView.vue            ← 整体布局 + 数据流"指挥"
   ├─ ConversationList    ← 左侧对话列表
   ├─ MessageBubble       ← 单条消息气泡（用户/AI 通用）
   ├─ MessageInput        ← 底部输入框
   ├─ UserMenu            ← 左下角用户菜单
   └─ Logo                ← 顶部 logo
```

**MessageBubble 拆出来的理由**：

- 100 行（拆得动）
- 之后"对话搜索结果"页可能复用
- 职责单一：只渲染**一条消息**，不管它从哪来

### 设计 3 — 数据流：所有数据走 conversations store

```
ChatView 不存任何业务数据
   ↓ 全部从
useConversationsStore() 拿：
   list                   ← 我的对话列表
   currentId              ← 当前选中的对话 id
   current  (computed)    ← 当前对话对象
   messages               ← 当前对话的消息
   loadingMessages
   sending                ← 正在等 AI 回复
   error
```

**Store action**（业务动作的"统一入口"）：

```
fetchList()        ← 故事 #3
create(title)      ← 故事 #4
select(id)         ← 切对话 + 拉历史消息
send(content)      ← 故事 #5（带乐观更新）
rename(id, title)  ← 故事 #6
remove(id)        ← 故事 #6
```

### 设计 4 — 乐观更新（Optimistic UI）

业务场景：用户发消息要等几秒 AI 才回。

```
不做乐观更新：
  用户点发送 → 等 3 秒 → 同时弹出"用户消息 + AI 回复"
  → 看起来卡顿、用户会以为系统挂了

✅ 乐观更新：
  用户点发送
   ↓ 立刻
  把用户消息 push 进列表（UI 马上看到自己说了什么）
   ↓ 后端响应
  替换乐观项 + 追加 AI 回复
   ↓ 如果失败
  回滚那条乐观项（用户知道没发出去）
```

```js
async function send(content) {
  const localUserMsg = { id: `tmp-${Date.now()}`, role: 'user', content, ... }
  messages.value.push(localUserMsg)              // ← 立刻显示

  try {
    const res = await messagesApi.send(currentId, content)
    // 替换乐观项
    const idx = messages.value.findIndex(m => m.id === localUserMsg.id)
    if (idx > -1) messages.value[idx] = res.user
    messages.value.push(res.assistant)
  } catch {
    // 回滚
    messages.value = messages.value.filter(m => m.id !== localUserMsg.id)
  }
}
```

### 设计 5 — Markdown 渲染（marked + XSS 防护 + :deep）

需求 C："AI 回复支持代码块、列表、表格"。

```vue
<!-- 只 AI 消息走 Markdown，用户消息原样显示 -->
<div v-if="role === 'assistant'" class="markdown" v-html="html"></div>
<div v-else class="plain">{{ content }}</div>
```

**为什么只 AI 走 Markdown**？

```
AI 输出本来就是 Markdown 格式 → 必须渲染
用户输入是文字 → 不渲染 → 用户输的 **xxx** 应该原样显示
```

⚠️ **`v-html` 有 XSS 风险**：

```
风险：如果内容里有 <script> 会执行

教学版我们的 AI 回复来自后端，相对可控
真实项目必须用 DOMPurify 清洗：
  import DOMPurify from 'dompurify'
  const html = computed(() => DOMPurify.sanitize(marked.parse(content)))
```

**CSS `:deep()` 穿透 scoped**：

```css
/* 这样写没用 —— scoped 不会作用到 v-html 插入的内容 */
.markdown pre { ... }

/* ✅ 用 :deep() 穿透 */
.markdown :deep(pre) {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 10px;
}
```

### 设计 6 — Enter 发送 + 中文输入法兼容

需求 E + F。**最容易踩的坑**：

```js
function onKeydown(e) {
  if (e.key === 'Enter'
      && !e.shiftKey                // Shift+Enter 换行
      && !e.isComposing) {          // ⚠️ 中文输入法选字时不触发
    e.preventDefault()
    submit()
  }
}
```

```
没 isComposing：
  中文用户输入"你好" → 按 Enter 选词 → 发送消息！
  → 用户骂"狗屎产品"

✅ 加了 isComposing：
  输入法合成期间 isComposing=true → Enter 留给输入法 → 不触发 submit
```

`isComposing` 是浏览器原生事件属性。**几乎所有"自己造 chat input"的人第一版都会忘**。

### 设计 7 — 自适应高度

需求 G。textarea 不会随内容自动撑高，**手动两步**：

```js
async function autoresize() {
  await nextTick()
  const el = textareaRef.value
  el.style.height = 'auto'                                      // ① 重置（必须）
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'       // ② 撑到内容高度，最高 200
}
```

⚠️ **第 ① 步重置不能省**：

```
不重置：scrollHeight 永远是当前高度 → 永远撑不大也缩不小
✅ 重置成 'auto' → scrollHeight 重新算成真实内容高度
```

### 设计 8 — 自动滚到底（watch + nextTick）

需求 B。

```js
const messagesRef = ref(null)

async function scrollToBottom() {
  await nextTick()              // ← 等 Vue 渲染完
  const el = messagesRef.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(messages, scrollToBottom, { deep: true })
watch(currentId, scrollToBottom)
```

**为什么 `await nextTick()`**：

```
messages.push(newMsg)         ← 数据变了
↓
el.scrollTop = scrollHeight   ← 但 DOM 还没更新！scrollHeight 还是旧的
↓
✅ await nextTick() → 等 Vue 完成 DOM patch → 再滚
```

### 设计 9 — 点击外部关闭下拉

需求 H（用户菜单 / 删除菜单）。

```js
function onDocClick(e) {
  if (open.value && wrapRef.value && !wrapRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
//                ↑
//   必须解绑 —— 否则组件卸载后监听还在，内存泄漏
```

`wrapRef.value.contains(e.target)` 是浏览器原生 API——判断点击是否发生在菜单组件内部。

## 💻 第三步：实现

```
chatbox/web/src/
├── views/ChatView.vue                  # ⭐ 布局 + 数据流"指挥"
├── components/
│   ├── ConversationList.vue            # 左侧列表 + 重命名 + 删除
│   ├── MessageBubble.vue               # 单条消息 + Markdown
│   ├── MessageInput.vue                # 输入框 + 自适应 + Enter 发送
│   └── UserMenu.vue                    # 右下角用户菜单
└── stores/conversations.js             # ⭐ 5 个 action + 乐观更新
```

完整代码看右边 →

## ✅ 本节学完，你应该能：

- ❓ 解释双栏布局为什么要 `height:100vh` + `overflow:hidden` → [设计 1](#)
- ❓ 列出拆组件的 3 条规则 → [设计 2](#)
- ❓ 写出乐观更新的"先 push → 失败回滚"流程 → [设计 4](#)
- ❓ 解释 `:deep()` 选择器为什么必要 → [设计 5](#)
- ❓ 说出 `isComposing` 防什么 → [设计 6](#)
- ❓ 解释 `autoresize` 第一步为什么要 `height = 'auto'` → [设计 7](#)
- ❓ 解释 `scrollToBottom` 为什么要 `nextTick` → [设计 8](#)

## 看右边 →

| 文件 | 看什么 |
|---|---|
| `web/src/views/ChatView.vue`               | **核心** —— 布局 + 数据流指挥 |
| `web/src/components/ConversationList.vue`  | 行内重命名 + 删除菜单 |
| `web/src/components/MessageBubble.vue`     | Markdown 渲染 + `:deep()` |
| `web/src/components/MessageInput.vue`      | 自适应 + Enter 发送 + 中文兼容 |
| `web/src/components/UserMenu.vue`          | 点击外部关闭 |
| `web/src/stores/conversations.js`          | 5 个 action + 乐观更新 |

下一节是最后一节，解决「**用户故事 #5 + #7：怎么调真实 OpenAI / Claude？API key 怎么藏？防爬虫怎么做？**」
