# 调真实 AI + 安全防护 {#proj-step-8}

> 最后一节。走 **需求 → 详细设计 → 实现**——
> 把"用户能选 AI、能填 API key、能跟真 AI 对话"做出来，**同时**把上线必备的安全防护补齐。

## 🎯 第一步：需求

兑现 [第 1 节用户故事](#proj-step-1) 的 #5 + #7：

```
# | 用户故事
──┼──────────────────────────────────
5 | 在对话里跟 AI 一问一答（真实 AI）
7 | 设置 AI 类型 + 填 API key，key 不能被其他人看到
```

**业务隐含**：

```
A. AI key 是钱袋 —— 任何泄漏 = 钱被刷干
B. 不同 AI（OpenAI / Claude / DeepSeek）协议都不一样 —— 怎么不污染业务代码
C. 用户没填 key 也希望能"看看效果" —— 给个 mock 兜底
D. 上线后会被机器人 / 脚本 / 爬虫扫 —— 必须限流
E. 暴力破解登录密码 —— 必须限流
F. 一个用户的账号被盗 → 别人用他的账号疯狂调 LLM 烧他钱 —— 也要限流
```

## 🔍 第二步：详细设计

### 设计 1 — API key 必须后端代理（**最重要的决策**）

```
方案 A：前端直连 OpenAI                方案 B：后端代理
─────────────────                     ─────────
key 打进前端 bundle                    key 只在服务端
F12 → Network → 看到 key                前端永远拿不到
几分钟你账户被刷爆 💸                    审计 / 限流 / 计费可控
浏览器 CORS 拦                          浏览器只跟自家后端通讯，没跨域
```

→ **任何"调 LLM"的项目都必须后端代理**。这是**铁律**。

```
浏览器
   ↓ POST /api/messages
后端
   ├ 从 user_settings 读这个用户的 api_key
   ├ 用那个 key 调 OpenAI
   └ 把 AI 回复返回给浏览器
```

### 设计 2 — 多 provider 用适配器模式

每家 LLM 的 API 都不一样：

```
                 OpenAI                       Claude
                 ────                         ──────
端点              /v1/chat/completions         /v1/messages
认证头            Authorization: Bearer        x-api-key
system prompt    messages 里 role:'system'    顶层独立 system 字段
max_tokens       可选                          必填
取响应文本        choices[0].message.content   content[0].text
```

```
做法                            优点                     缺点
─────                          ────                      ────
直接在 routes/messages.js if-else  简单                  逻辑混乱、加一家要改主路由
✅ 适配器模式                    业务层零修改             多一个目录层级
   llm/
   ├ index.js     ← 分发
   ├ mock.js
   ├ openai.js
   └ claude.js
```

业务层只调一个统一接口：

```js
const reply = await llm.generate({ settings, messages: history })
```

不需要知道底下是哪家。

### 设计 3 — 没 key 兜底 mock（设计 + 教学双赢）

```js
// llm/index.js
if (provider === 'mock' || !apiKey) {
  return await mock.chat({ messages })
}
```

**教学价值**：

```
学生克隆代码 → npm install → npm start
                                    ↓
                    不需要申请 OpenAI key、不用付费、不用 VPN
                    → 项目当场跑通
                    → 想接真模型 → 设置页填 key 即可
```

**工程价值**：核心路径不依赖外部资源 + 可选增强通过配置启用——**可靠系统的设计原则**。

mock.js 就是一堆规则匹配：

```js
const RULES = [
  { match: /^你好/, reply: '你好！我是教学版 chatbox 的内置 Mock。' },
  { match: /markdown/, reply: '消息支持 Markdown：\n```js\nconst x = 1\n```' },
  { match: /.+/, reply: '我是 mock 助手...' }   // 兜底
]
```

### 设计 4 — API key 脱敏：永远不完整回前端

业务约束："key 不能被其他人看到"。

但前端有个矛盾：用户进设置页要知道"我以前填过 key 了吗"。

**解法：脱敏返回**：

```js
// 后端
function publicView(row) {
  return {
    provider:      row.provider,
    api_base:      row.api_base || '',
    model:         row.model || '',
    system_prompt: row.system_prompt || '',
    has_key:       !!(row.api_key && row.api_key.length > 0),  // ← 只回布尔
    key_tail:      row.api_key ? row.api_key.slice(-4) : '',   // ← 只回尾 4 位
    updated_at:    row.updated_at
  }
}
```

前端看到 "已配置（结尾 `..x1y2`）" → 不知道完整 key 但知道"配过了"。

⚠️ 即使前端"小心不显示完整 key"，**Network 面板里响应体仍然能看见**——所以必须**后端不返回**。

### 设计 5 — PATCH 合并更新：不传字段 = 保留

业务场景：用户在设置页只想改 system_prompt，**不想重新输 api_key**。

```js
const merged = {
  provider: provider ?? prev.provider ?? 'mock',
  api_key:  api_key === undefined ? prev.api_key : api_key,   // ← 不传 → 保留旧
  ...
}
```

```
PUT 请求里：
  不传 api_key       → 后端保留旧 key  ✓
  传空字符串 ""      → 后端清空 key
  传新值 "sk-..."    → 覆盖
```

### 设计 6 — 三档限流防爬虫

```
┌──────────────────────────────────────────────────────────┐
│ globalLimiter   1 分钟 100 次 / IP                        │
│                  ↓ 防扫描 / 防爬虫                          │
│                                                          │
│ authLimiter    5 分钟 20 次 / IP                          │
│                  ↓ 防字典爆破密码（业务 E）                 │
│                                                          │
│ messageLimiter 1 分钟 30 次 / user.id ← 按用户分组           │
│                  ↓ 防一个账号烧 LLM 钱（业务 F）             │
└──────────────────────────────────────────────────────────┘
```

**为什么发消息按 user 不按 IP**：

```
按 IP：
  一家公司 / 一所学校共用一个公网 IP
  一个人爆刷 → 全公司被限流
  → 误伤

✅ 按 user.id：
  一个用户一个桶
  攻击者爆刷一个号 → 只能爆刷自己的桶
```

### 设计 7 — 上线必带的安全头（helmet）

```js
app.use(helmet({
  contentSecurityPolicy: false   // 教学版禁 CSP（不然 vite inline script 被拦）
}))
```

helmet 一行加 14 个安全头：

```
X-Frame-Options             ← 防 clickjacking（站被嵌入 iframe）
X-Content-Type-Options      ← 防 MIME 嗅探
Strict-Transport-Security   ← 强制 HTTPS
X-DNS-Prefetch-Control      ← 控制 DNS 预解析
...（9 个其他）
```

**生产环境必装**。

### 设计 8 — trust proxy（部署在 nginx 后面）

```js
app.set('trust proxy', 1)
```

```
部署到 nginx / Cloudflare / vercel 后面：
  req.ip 默认 = 127.0.0.1（代理的 IP）
  所有用户共用一个 IP
  → 限流瞬间被打爆

✅ trust proxy: 1
  从 X-Forwarded-For 头读真实客户端 IP
```

### 设计 9 — 完整发消息链路

```
1. 校验对话所有权（不能让 alice 读 bob 的对话）
2. 校验消息内容非空
3. 存用户消息到 messages 表
4. 如果对话还叫"新对话" → 用首条消息前 20 字当 title
5. 拉对话所有历史
6. 拉当前用户的 settings
7. llm.generate({ settings, messages: history })
   失败时：把错误消息写成 AI 回复（不抛错给前端）
8. 存 AI 回复到 messages 表
9. 返回 { user, assistant }
```

第 7 步的**"失败不抛错"** 是关键体验细节：

```
用户发了消息 → LLM 服务挂了 → 后端返回 500
→ 前端看到的是：用户消息已发出但屏幕上还有问号

✅ 后端把错误写成一条 AI 回复：
  "⚠️ 调用 openai 失败：429 Too Many Requests"
→ 用户看到具体原因 + 知道怎么救自己（回设置页检查）
```

### 设计 10 — 接口设计

```
POST /api/conversations/:id/messages
     入：{ content }
     出：{ user: 用户消息, assistant: AI 回复 }
     边：所有权校验 + 限流（按 user.id 30/分钟）

GET  /api/settings
     出：{ provider, has_key, key_tail, ... }  ← 脱敏（设计 4）

PUT  /api/settings
     入：{ provider?, api_key?, api_base?, model?, system_prompt? }
     行：PATCH 合并（设计 5）
     出：脱敏后的 settings
```

## 💻 第三步：实现

```
chatbox/
├── server/
│   ├── llm/
│   │   ├── index.js              # ⭐ 适配器分发
│   │   ├── mock.js               # 本地规则
│   │   ├── openai.js             # OpenAI + DeepSeek（同协议）
│   │   └── claude.js             # Anthropic
│   ├── routes/
│   │   ├── messages.js           # ⭐ 完整发消息链路
│   │   └── settings.js           # api_key 脱敏 + PATCH 合并
│   └── middleware/rateLimit.js   # 三档限流
└── web/src/
    ├── views/SettingsView.vue   # 设置页 UI
    └── stores/settings.js       # 设置 store
```

### 设置页 UI 关键细节

```vue
<!-- provider 单选：input radio + label 包整张卡片 -->
<label v-for="p in PROVIDERS" class="provider" :class="{ active: form.provider === p.id }">
  <input type="radio" name="provider" :value="p.id" v-model="form.provider">
  <span class="dot" :style="{ background: p.color }"></span>
  <div class="p-text">
    <div class="p-label">{{ p.label }}</div>
    <div class="p-desc">{{ p.desc }}</div>
  </div>
</label>

<!-- api_key：三种意图 -->
<input v-model="form.api_key" type="password">
<label class="check-row">
  <input type="checkbox" v-model="form.clear_key">
  <span>清空已保存的 key</span>
</label>
```

**三种意图**：

```
① 输入了新 key      → 覆盖
② 勾"清空"          → patch.api_key = ''
③ 都不动            → 不传 api_key 字段 → 后端保留（设计 5）
```

完整代码看右边 →

### 怎么验证整套链路通了

```
1. 没填 key 也能聊（走 mock）
   注册 → 登录 → 新对话 → "你好" → mock 回复 ✓

2. 填上真 key 走真 AI
   设置 → provider=deepseek → 填 sk-xxx → 保存
   → 回聊天页 "你好" → DeepSeek 真回复 ✓

3. 验证限流
   连续刷 31 次发消息 → 第 31 次 429 Too Many Requests ✓

4. 验证 key 不暴露
   F12 → Network → /api/settings 响应
   → 只有 has_key: true + key_tail: "x1y2"
   → 完整 key 在响应里找不到 ✓
```

## 🎓 8 节回顾

```
第 1 节：项目蓝图           需求 → 用户故事 → 数据 / 接口 / 技术栈
第 2 节：数据底座            SQLite 4 张表 + 外键级联 + 索引
第 3 节：注册登录鉴权        bcrypt + JWT + middleware
第 4 节：前端调后端          axios 三层封装 + 拦截器 + 401 钩子
第 5 节：登录态保持          store + 路由守卫 + restore + redirect
第 6 节：登录注册页          表单 7 件套 + 设计变量
第 7 节：聊天主界面          双栏 + Markdown + 乐观更新 + 自动滚动
第 8 节：调真实 AI + 安全    后端代理 + 适配器模式 + 三档限流
```

**8 节走完，你能从一份业务需求出发，做出一个能上线的现代 Web 项目。**

## ✅ 本节学完，你应该能：

- ❓ 解释为什么 API key 必须在后端 → [设计 1](#)
- ❓ 写出适配器模式的目录结构 → [设计 2](#)
- ❓ 解释为什么发消息限流按 user 不按 IP → [设计 6](#)
- ❓ 解释为什么 api_key 只回传 has_key + 尾 4 位 → [设计 4](#)
- ❓ 解释 trust proxy 解决什么问题 → [设计 8](#)
- ❓ 描述 LLM 调用失败的兜底策略 → [设计 9](#)

## 看右边 →

9 个文件：

| 文件 | 看什么 |
|---|---|
| `server/llm/index.js`           | 适配器分发 + mock 兜底 |
| `server/llm/mock.js`            | 规则匹配 + 模拟延迟 |
| `server/llm/openai.js`          | OpenAI / DeepSeek 协议 |
| `server/llm/claude.js`          | Anthropic 协议 |
| `server/routes/messages.js`     | **完整发消息链路** |
| `server/routes/settings.js`     | api_key 脱敏 + PATCH 合并 |
| `server/middleware/rateLimit.js`| 三档限流 |
| `web/src/views/SettingsView.vue`| 设置页 UI |
| `web/src/stores/settings.js`    | 设置 store |

🎉 **课程结束**——接下来挑一个你想做的项目（论坛 / 协作工具 / 数据看板 / ...）按"需求 → 详细设计 → 实现"试一遍。
