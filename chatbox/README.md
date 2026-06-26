# Chatbox · 教学版

一个**简易版的 chatbox**——参考 [chatboxai/chatbox](https://github.com/chatboxai/chatbox)，刻意做小，专给教学用。

技术栈复用本仓库前置课程教过的全部内容：

- **前端**：Vue 3（组合式）+ Vue Router + Pinia + axios + marked
- **后端**：Express + SQLite（better-sqlite3）+ JWT + bcrypt + helmet + express-rate-limit

## 功能

- 用户注册 / 登录 / JWT 鉴权 / 自动恢复登录态
- 多对话：新建、切换、重命名、删除
- 消息：用户发送 → 后端存 → 调 LLM 取回复 → 也存 → 推给前端展示
- Markdown 渲染 + 代码块
- **设置页填 API key**：默认走 **Mock**（无 key 也能跑），可切到 **OpenAI / DeepSeek / Claude**
- key 只存服务端，前端响应只能看到尾 4 位 + `has_key` 标记
- 速率限制：登录爆破防御 + 单用户消息限流

## 目录结构

```
chatbox/
├── server/                # Express 后端（端口 3002）
│   ├── server.js          # 入口（dev: API only；prod: 同时托管 web/dist）
│   ├── db.js              # SQLite 初始化
│   ├── config.js          # PORT / JWT_SECRET
│   ├── middleware/
│   │   ├── requireAuth.js # JWT 校验
│   │   └── rateLimit.js   # 全局 + 登录 + 消息 三档限流
│   ├── routes/            # auth · settings · conversations · messages
│   └── llm/               # mock(默认) · openai/deepseek(同协议) · claude
└── web/                   # Vue 前端（端口 5173）
    ├── .env.development   # VITE_API_BASE=http://localhost:3002
    ├── .env.production    # 留空 → 走相对路径，同域部署
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/        # 路由 + 守卫（未登录跳 /login）
        ├── stores/        # auth · conversations · settings
        ├── api/           # request.js + 4 个业务接口模块
        ├── views/         # Login · Register · Chat · Settings
        ├── components/    # ConversationList · MessageBubble · MessageInput · Logo · UserMenu
        └── assets/global.css
```

## 启动（开发环境）

需要两个终端：

### 终端 1 — 后端

```bash
cd chatbox/server
npm install
npm start            # 监听 http://localhost:3002
```

### 终端 2 — 前端

```bash
cd chatbox/web
npm install
npm run dev          # http://localhost:5173/
```

浏览器打开 [http://localhost:5173/](http://localhost:5173/) → 注册 → 登录 → 新对话 → 发"你好"。

## 切到真实 AI

1. 顶部右下角用户菜单 → **设置**
2. 选 provider（openai / deepseek / claude）
3. 填 api_key、可选填 api_base / model
4. 保存 → 回到聊天页

> 没填 key 或 provider = mock 时，自动走内置规则回复——保证教学环境永远能跑。

## 上线部署（同域单端口）

最省心的部署方式：前后端打包到**同一个 Express 进程**，浏览器只看到一个端口。

```bash
# 1) 前端构建
cd chatbox/web
npm install
npm run build              # 产物在 chatbox/web/dist/

# 2) 后端进程会自动托管 web/dist
cd ../server
npm install
NODE_ENV=production npm start
```

启动后访问 `http://你的服务器:3002/` 就能看到完整应用：

- 前端静态资源由 Express 的 `express.static(web/dist)` 直接发
- API 请求走相对路径 `/api/*`（`web/.env.production` 的 `VITE_API_BASE` 留空就是这个效果）
- **不会跨域、不需要 nginx 转发**

### 想前后端分开部署（前端走 CDN）

把 `.env.production` 改成：

```env
VITE_API_BASE=https://chatbox-api.example.com
```

重新 build 前端，然后把 `dist/` 上传到任意静态托管（Vercel / Netlify / nginx 静态目录）。
后端独立启动，**确保 cors() 中间件开着**（cross-origin 必须）。

### 生产环境必须改的几样

| 配置 | 现在 | 上线 |
|---|---|---|
| `config.js` 里的 `JWT_SECRET` | 写死的教学字符串 | 走 `process.env.JWT_SECRET`，长随机串 |
| HTTPS | 没启用 | 用 nginx / Caddy 反代加证书 |
| `chatbox.db` 文件位置 | 跟代码同目录 | 移到挂载卷（容器化部署时） |

---

## 教学点清单（后续做课件时讲）

这套项目刚好把"前后端联通"涉及的几个关键概念都铺到了。每个都可以单做一节：

### 1. 鉴权（Authentication）——"你是谁"

- bcrypt 密码哈希：为什么不能存明文？盐是什么？
- JWT 工作机制：header.payload.signature 三段
- token 怎么存（localStorage vs httpOnly cookie 的取舍）
- 怎么"带"——`Authorization: Bearer <token>` 请求头
- 服务端怎么"验"——`jwt.verify()` 用 secret 验签
- 文件：`server/routes/auth.js` + `server/middleware/requireAuth.js`

### 2. 保持登录 —— 刷新页面别掉

- token 持久化到 `localStorage`（trade-off：方便 vs XSS 风险）
- 启动时调 `/api/auth/me` 验证 token 是否还有效（过期？被服务端拉黑？）
- 路由守卫：未登录访问受保护页面 → 跳登录 → 登录后跳回原页面
- axios 响应拦截器：401 自动清 token + 跳登录
- 文件：`web/src/stores/auth.js`（`restore()`） + `web/src/router/index.js`（`beforeEach`） + `web/src/api/request.js`（401 处理）

### 3. 防爬虫 / 防爆破

- 限流：`express-rate-limit`，分三档：全局 / 登录 / 单用户消息
- 安全头：`helmet` 默认开 X-Frame-Options / X-Content-Type-Options 等
- `trust proxy`：部署在反向代理后面才能拿到真实 IP
- 验证码？可以提一句但不实现（hCaptcha / Cloudflare Turnstile）
- 文件：`server/middleware/rateLimit.js` + `server/server.js`

### 4. baseURL 与环境变量

- 为什么不能把后端地址写死？
- Vite 的 `import.meta.env.VITE_*`：哪些变量会注入到前端代码？
- `.env.development` vs `.env.production`：`npm run dev` 和 `npm run build` 自动选哪个
- 同域部署 vs 跨域部署的两种 baseURL 策略
- 文件：`web/.env.*` + `web/src/api/request.js`

### 5. axios 工程化封装（沿用本仓库前面的课程）

- 实例 + 拦截器 = 全项目共用的 HTTP 管道
- 拦截器三件事：加 token / 剥 .data / 401 跳登录
- 业务 API 模块：组件只 import `xxxApi`，不直接 import axios
- 文件：`web/src/api/*`

### 6. 状态管理（沿用 Pinia 课程）

- auth store / conversations store / settings store 三块独立
- `storeToRefs` 保响应式，actions 普通解构
- 乐观更新：用户消息先 push，失败回滚
- 文件：`web/src/stores/*`

### 7. CRUD + 关系建模（沿用 Express 课程）

- SQLite + better-sqlite3：同步 API，事务简单
- 表关系：`users` 1-N `conversations` 1-N `messages`
- 级联删除：`ON DELETE CASCADE` 自动清孤儿
- 索引：列表查询的 `idx_conv_user(user_id, updated_at DESC)`
- 文件：`server/db.js`

### 8. 调外部 API（LLM 接入）

- 后端做"代理转发"：为什么不让前端直接调 OpenAI？(API key 不能暴露)
- OpenAI 兼容协议 vs Anthropic 协议
- 失败兜底：调用失败把错误消息回写成 AI 回复，不让用户卡住
- 文件：`server/llm/*`

## 数据持久化

SQLite 数据库文件：`chatbox/server/chatbox.db`（不入 git）。

四张表：
- `users(id, username, password_hash, created_at)`
- `user_settings(user_id, provider, api_key, api_base, model, system_prompt, updated_at)`
- `conversations(id, user_id, title, created_at, updated_at)`
- `messages(id, conversation_id, role, content, created_at)`

删库：直接 `rm chatbox/server/chatbox.db`，重启后端会自动重建。
