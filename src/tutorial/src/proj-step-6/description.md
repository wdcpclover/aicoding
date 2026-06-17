# 登录 / 注册页 —— 表单 UI {#proj-step-6}

> 后端鉴权 + 前端 store 都搭好了。这一节做用户**第一眼看到的界面**。
> 走 **需求 → 详细设计 → 实现**——把"能上线品质"的登录注册做出来。

## 🎯 第一步：需求

这一节兑现 [第 1 节用户故事](#proj-step-1) 的 #1 + #2：

```
# | 用户故事
──┼─────────────────────────────────────
1 | 输入用户名 / 密码 / 注册账号
2 | 输入用户名 / 密码 / 登录
```

业务上看似简单，但**做"能上线品质"**还隐含很多细节：

```
A. 用户输完用户名按 Enter 键 → 自动提交
B. 提交中按钮不能再点（防重复请求）
C. 用户名 / 密码非空 / 长度合法 → 客户端先校验
D. 后端返回错误（用户名已存在 / 密码错）→ 前端把后端消息显示出来
E. 浏览器密码管理器 / 自动填充能工作
F. 注册页要"再输一次密码" + 校验两次一致
G. UI 美观（卡片 / 渐变背景 / focus 反馈 / 错误条）
H. 注册成功 = 登录成功 → 跳 /chat；登录成功 → 跳 redirect 或 /chat
```

## 🔍 第二步：详细设计

### 设计 1 — 一个"能上线"的表单包含 7 件事

```
① 数据绑定     v-model 把输入同步到 JS                 ── 给 D / E 用
② 提交        防默认刷新 + 防重复点击                  ── B
③ 校验        客户端预校验 + 服务端兜底校验             ── C + F
④ 状态反馈     loading / 错误 / 成功                  ── B + D
⑤ 可访问性     autofocus / autocomplete / 回车提交     ── A + E
⑥ UI 美观     卡片 / 渐变 / focus / 过渡               ── G
⑦ 跳转        登录后跳 redirect；注册后跳 /chat         ── H
```

下面 4 个设计**逐个**落地。

### 设计 2 — 数据绑定：多字段表单用 `reactive`

```
❌ 多个 ref                          ✅ 一个 reactive 对象
─────────────                       ──────────────
const username = ref('')             const form = reactive({
const password = ref('')               username: '',
                                       password: ''
                                     })

模板里写 v-model="username"          模板里写 v-model="form.username"
                                     不需要 .value
```

**原则**：单原始值用 `ref`，**多字段表单用 `reactive`**。

### 设计 3 — 防重复提交（双重保险）

业务场景：用户点登录后按钮卡 1 秒以为没响应，又点一下 → 后端记两次失败 → **被限流**。

```js
async function onSubmit() {
  if (submitting.value) return         // ① 函数级早返回
  submitting.value = true
  try { /* ... */ }
  finally { submitting.value = false } // ② 永远恢复
}
```

```vue
<button :disabled="submitting">         <!-- ③ 按钮置灰 -->
  {{ submitting ? '登录中...' : '登录' }}
</button>
```

**三道保险**——用户怎么疯狂点都点不出双提交。

### 设计 4 — 错误消息多级降级

业务场景：后端返回 `{ "message": "用户名或密码错误" }`，前端要把它**原样**给用户看。

```js
errorMsg.value = e.response?.data?.message  // ① 后端业务消息（最准）
                || e.message                 // ② axios 网络层错误
                || '未知错误'                  // ③ 兜底
```

```
裸用 e.message：
  后端明明返回 "用户名或密码错误"
  前端却显示 "Request failed with status code 401"
  → 用户看不懂

✅ 三级降级 → 永远显示最人性化的那条
```

### 设计 5 — 用 `<form>` + `@submit.prevent`，不要 div + button click

```vue
<!-- ❌ 用 div -->
<div>
  <input v-model="form.username">
  <button @click="onSubmit">登录</button>
</div>

<!-- ✅ 用 form -->
<form @submit.prevent="onSubmit" autocomplete="on">
  <input v-model="form.username">
  <button type="submit">登录</button>
</form>
```

**用 `<form>` 的好处**：

```
A: 输入框里按 Enter 自动触发 submit          ← 用 form 自带，不用写 @keyup.enter
E: 浏览器密码管理器、自动填充                 ← 只对真实 <form> 生效
   屏幕阅读器更友好（视障用户）
```

`@submit.prevent` = `event.preventDefault()` —— 阻止默认行为（整页刷新）。

### 设计 6 — `autocomplete` 写对值（浏览器密码管理器关键）

业务场景：用户希望浏览器记住密码下次自动填。

```vue
<input autocomplete="username">          <!-- 登录页用户名 -->
<input autocomplete="current-password">  <!-- 登录页密码 → 触发"自动填充" -->
<input autocomplete="new-password">      <!-- 注册页密码 → 触发"建议生成强密码" -->
```

这些是 HTML 标准——浏览器密码管理器**靠 autocomplete 值判断**这是登录还是注册。

> 很多教程随手写 `autocomplete="off"` → **把用户体验删了**。

### 设计 7 — `<label>` 包 `<input>`（无障碍 + 移动端）

```vue
<label>
  <span>用户名</span>
  <input v-model="form.username">
</label>
```

→ 点 label 文字**自动 focus 到 input**。移动端尤其友好（小屏幕点击区域大）。

### 设计 8 — 注册页比登录页多 4 件事

```
① 多一个"确认密码"字段
② 客户端校验两次密码一致
③ 注册成功不需要 redirect（直接跳 /chat）
④ autocomplete 用 new-password 不是 current-password
```

**为什么不合并成一个 AuthView 用 `v-if="mode==='register'"` 切换**？

```
两页面差异虽然少但都是关键差异
合并会引入很多 v-if 分支
逻辑变难懂，维护成本反而高

✅ 简单胜过 DRY ── 两个文件 95% 重复也没关系
```

### 设计 9 — UI 设计变量系统

业务场景：老板说"换个绿色品牌色"。

```css
/* ❌ 不用变量 */
.primary { background: #4f46e5; }
.link    { color: #4f46e5; }
/* → 全项目搜替换 #4f46e5 */

/* ✅ 用变量 */
:root {
  --accent:        #4f46e5;
  --accent-hover:  #4338ca;
  --bg-elevated:   #ffffff;
  --border:        #e4e4e7;
  --danger:        #ef4444;
  --radius:        10px;
}
.primary { background: var(--accent); }
/* → 改 :root 一处 */
```

**附带好处**：以后加暗色主题 → 写一组 `[data-theme="dark"]` 下的变量即可。

### 设计 10 — UI 高质感的"小心机"

```css
/* 1) 双 radial-gradient 背景 —— 不规则光晕 */
background:
  radial-gradient(circle at 80% 10%, rgba(99,102,241,0.08), transparent 55%),
  radial-gradient(circle at 10% 90%, rgba(34,211,238,0.08), transparent 55%);

/* 2) input focus ring —— 外侧 3px 半透明色环 */
input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* 3) 按钮悬浮微抬 1px —— 微妙的"凸起"感 */
.primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* 4) 错误条"左红条"—— 比满红柔和 */
.error {
  background: var(--danger-bg);
  border-left: 3px solid var(--danger);
  border-radius: 0 4px 4px 0;
}
```

## 💻 第三步：实现

```
chatbox/web/src/
├── views/LoginView.vue        # 登录页
├── views/RegisterView.vue     # 注册页（比登录多一个"确认密码"）
├── components/Logo.vue        # inline SVG logo
└── assets/global.css          # 设计变量 :root
```

### LoginView.vue 完整骨架

```vue
<script setup>
const form = reactive({ username: '', password: '' })
const submitting = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  if (submitting.value) return            // 设计 3 ①
  errorMsg.value = ''
  if (!form.username || !form.password) { // 设计 1 ③
    errorMsg.value = '请填写用户名和密码'; return
  }
  submitting.value = true                  // 设计 3 ②
  try {
    await authStore.login(form)
    router.push(route.query.redirect || { name: 'chat' })  // 设计 1 ⑦
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message  // 设计 4
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" autocomplete="on">          <!-- 设计 5 -->
    <label>
      <span>用户名</span>                                       <!-- 设计 7 -->
      <input v-model="form.username" autofocus autocomplete="username">
                                                                <!-- 设计 6 -->
    </label>
    <label>
      <span>密码</span>
      <input v-model="form.password" type="password"
             autocomplete="current-password">
    </label>

    <p v-if="errorMsg" class="error">⚠️ {{ errorMsg }}</p>

    <button type="submit" :disabled="submitting" class="primary">
      {{ submitting ? '登录中...' : '登录' }}
    </button>
  </form>
</template>
```

### Logo.vue：inline SVG

```vue
<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="lg-grad">
        <stop offset="0%"   stop-color="#6366f1"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg-grad)"/>
    <!-- 机器人脸 ... -->
  </svg>
</template>
```

**为什么 inline SVG 不用 `<img>` / emoji**：

```
<img> PNG/JPG    多一次 HTTP、不能 CSS 控色
<img> SVG        多一次 HTTP、不支持 currentColor
emoji 🤖          平台渲染不一样、不能精确控大小
✅ inline SVG    0 额外请求、size prop、CSS 控色、支持渐变
```

完整代码看右边 →

## ✅ 本节学完，你应该能：

- ❓ 列出"能上线表单"的 7 件套 → [设计 1](#)
- ❓ 解释为什么用 reactive 不用多个 ref → [设计 2](#)
- ❓ 写出防重复提交的 3 道保险 → [设计 3](#)
- ❓ 解释错误消息多级降级的顺序 → [设计 4](#)
- ❓ 列出 `autocomplete` 的 3 个常用值 → [设计 6](#)
- ❓ 解释为什么注册和登录不合并成一个组件 → [设计 8](#)

## 看右边 →

| 文件 | 看什么 |
|---|---|
| `web/src/views/LoginView.vue`    | 完整登录页 |
| `web/src/views/RegisterView.vue` | 注册页（对比登录页找差异） |
| `web/src/components/Logo.vue`    | inline SVG 组件 |
| `web/src/assets/global.css`      | 设计变量 + 全局 reset |

下一节解决「**用户故事 #3 + #4 + #5 + #6：聊天主界面——双栏、消息流、Markdown、自动滚动、乐观更新**」
