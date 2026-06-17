# 注册 / 登录 / 鉴权 —— bcrypt + JWT {#proj-step-3}

> 第 2 节我们已经能把 `username + password_hash` 存进 `users` 表。
> 这一节走完 **需求 → 详细设计 → 实现**——把"用户能注册、能登录、登录后下次还认得他"做出来。

## 🎯 第一步：需求

挑出 [第 1 节用户故事](#proj-step-1) 里跟"身份"有关的 4 条：

```
# | 用户故事
──┼─────────────────────────────────────
1 | 注册账号                  ← 这一节
2 | 登录账号                  ← 这一节
8 | 关闭浏览器再回来还认得他   ← 第 5 节配合
10| 退出登录                  ← 这一节
```

还要兼容一条**隐含的业务约束**：

> 「**其他业务接口**（看对话、发消息、改设置）必须知道当前是哪个用户」

所以这一节实际要解决**三件事**：

```
① 注册：怎么把密码安全地存？
② 登录：怎么验证密码 + 给用户一个"凭证"？
③ 凭证：之后每次请求怎么"自动证明我是谁"？
```

## 🔍 第二步：详细设计

### 设计 1 — 密码必须哈希存（绝不能明文）

业务约束："数据库泄露了，用户密码不能裸奔"。

```
存什么                     问题
──────                     ─────
明文 'pass123'              DB 一泄漏 → 所有人密码可见
                            用户多网站同密码 → 全网被攻破

md5(password)               GPU 一秒亿次暴力试 → 弱密码秒破
                            彩虹表早就预先算好

✅ bcrypt(password, 10)     ① 故意算得慢（100 ms/次）
                            ② 自动加盐 → 同密码每次结果不同
                            ③ 验证时 bcrypt 自动解出盐
```

**bcrypt 两大杀手锏**：

```js
bcrypt.hashSync('pass123', 10)
//                          ↑
//                  cost = 10 → ≈100ms/次
//                  攻击者爆破 1 亿次 → 11 年

bcrypt.hashSync('pass123', 10)  // → '$2b$10$N9qo8...'
bcrypt.hashSync('pass123', 10)  // → '$2b$10$KIXxX...'   ← 同密码不同结果（自动加盐）

bcrypt.compareSync('pass123', '$2b$10$N9qo8...')   // → true / false
```

cost 选 **10**：普通登录 100ms 用户无感，攻击者爆破跑 N 年。

### 设计 2 — "凭证"用 JWT 不用 session

业务约束："换电脑登同账号还能看到对话"——所以**服务端必须能识别"这个请求是哪个用户"**。

```
方案 A：服务端 Session              方案 B：JWT
─────────────────                  ────────────
登录 → 后端生成 sessionId → 存表    登录 → 后端签 token → 客户端存
之后请求带 sessionId                之后请求带 token
后端查 session 表 → 找出用户         后端用密钥**验签** → token 里就有用户 ID

✗ 多台服务器要共享 session 表        ✓ 服务端不存 session
✗ 退出登录要"删 session"             ✓ 退出 = 客户端扔掉 token
✓ 撤销容易（直接删表里）             ✗ 撤销难（改 JWT_SECRET 让所有 token 失效）
```

教学项目选 **JWT**。

### 设计 3 — JWT 长什么样

一个 JWT 三段，用 `.` 隔开：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInVzZXJuYW1lIjoiYWxpY2UifQ.SIG
└──────── header ──────────┘ └─────── payload ────────┘ └─ sig ─┘
                            "uid":1, "username":"alice", "iat":..., "exp":..."
```

- **header**：算法 + 类型（Base64URL 编码）
- **payload**：你想"塞进通行证"的信息（**Base64URL 编码 = 任何人都能解码看到，不是加密！**）
- **signature**：用密钥对前两段 HMAC-SHA256 → 防伪

**⚠️ payload 是明文**——绝不能放密码、银行卡号、敏感隐私。

### 设计 4 — payload 放什么、过期多久

```
✅ 放：                                ❌ 不放：
─ uid       （以后改用户名 token 不失效）   ─ password / password_hash
─ username  （前端展示用）                  ─ 邮箱 / 电话等隐私
─ exp       （JWT 库自动加）                 ─ 大对象（token 越长越烦）
```

过期时间业务定：

```
网银 / 后台    ── 15 min ~ 1 h   ← 短：安全
内容站         ── 7 ~ 30 days    ← 长：体验好
我们选         ── 7 天
```

### 设计 5 — token 怎么"带" + 怎么"验"

**带**——按 OAuth 2.0 标准用 `Authorization: Bearer <token>` 请求头：

```
GET /api/conversations HTTP/1.1
Host: localhost:3002
Authorization: Bearer eyJhbGc...
```

**验**——后端中间件解出 token、验签、挂用户信息到 `req.user`：

```js
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return res.status(401).json({ message: '未登录' })

  try {
    const payload = jwt.verify(m[1], JWT_SECRET)
    req.user = { id: payload.uid, username: payload.username }
    next()
  } catch (e) {
    return res.status(401).json({ message: 'token 无效或已过期' })
  }
}
```

之后任何路由只要挂上它，就能拿到 `req.user`：

```js
router.use(requireAuth)
router.get('/', (req, res) => {
  const list = db.prepare('SELECT ... WHERE user_id = ?').all(req.user.id)
  res.json(list)
})
```

### 设计 6 — 安全细节：登录失败的错误消息

**反面教材**：

```
用户名错 → "用户不存在"
密码错   → "密码错误"

→ 攻击者枚举：发一堆用户名，看"用户不存在"还是"密码错误"
→ 反推出哪些 username 已注册 → 撞库
```

**正确做法**：用户名错和密码错**返回同一条消息 + 同一个状态码**：

```js
if (!user || !bcrypt.compareSync(password, user.password_hash)) {
  return res.status(401).json({ message: '用户名或密码错误' })
}
```

配合下一节会讲的**限流**——爆破账号也试不动。

### 设计 7 — 接口设计

按"业务动作 → URL 方法 → 输入输出"列出 3 个接口：

```
POST /api/auth/register                        ── 用户故事 #1
     入：{ username, password }
     出：{ token, user: { id, username } }
     边：用户名 ≥ 2，密码 ≥ 4；重名 → 409

POST /api/auth/login                           ── 用户故事 #2
     入：{ username, password }
     出：{ token, user }
     边：错误 → 401 "用户名或密码错误"

GET  /api/auth/me                              ── 用户故事 #8 配合
     入：Authorization 头
     出：{ user }
     用：前端启动时用它"验证 token 还有效 + 拿用户信息"
```

注册 / 登录**返回 token**——前端拿到立刻有"凭证"，**注册即登录**省一步。

## 💻 第三步：实现

代码分三个文件：

```
chatbox/server/
├── config.js                   # ① 配置：JWT_SECRET、过期时间
├── routes/auth.js              # ② 三条路由：register / login / me
└── middleware/requireAuth.js   # ③ 12 行中间件：JWT 验签 + 挂 req.user
```

### config.js：把秘密集中放

```js
module.exports = {
  PORT:           3002,
  JWT_SECRET:     'chatbox-teach-secret-please-change-in-prod',
  JWT_EXPIRES_IN: '7d'
}
```

**生产环境必须改**——走 `process.env.JWT_SECRET`，不允许 fallback：

```js
JWT_SECRET: process.env.JWT_SECRET   // 没设 → 启动失败
```

### routes/auth.js：三条路由

```js
const sign = user => jwt.sign(
  { uid: user.id, username: user.username },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
)

router.post('/register', (req, res) => {
  // 校验 → 查重 → bcrypt.hashSync → INSERT users → INSERT user_settings 默认
  // → 返回 { token: sign(user), user }
})

router.post('/login', (req, res) => {
  // SELECT users → bcrypt.compareSync → 通过 → 返回 token
  // 失败 → 401 统一消息
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})
```

完整代码看右边 →

### 怎么验证整套链路

```bash
# ① 注册
curl -X POST http://localhost:3002/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"pass1234"}'
# → {"token":"eyJ...","user":{"id":1,"username":"alice"}}

# ② 拿 token 调 /me
TOKEN='复制上面的 token'
curl http://localhost:3002/api/auth/me -H "Authorization: Bearer $TOKEN"
# → {"user":{"id":1,"username":"alice"}}

# ③ 不带 token
curl http://localhost:3002/api/auth/me
# → 401 {"message":"未登录"}

# ④ token 改一个字符
curl http://localhost:3002/api/auth/me -H "Authorization: Bearer $TOKEN-X"
# → 401 {"message":"token 无效或已过期"}
```

**让学生亲手把这四条跑一遍**——真正建立直觉。

## ✅ 本节学完，你应该能：

- ❓ 解释为什么不能 md5(password) 存密码 → [设计 1](#)
- ❓ 比较 JWT vs Session 的 4 个差异 → [设计 2](#)
- ❓ 解释 JWT payload 是不是加密，为什么不能放密码 → [设计 3](#)
- ❓ 写出 `Authorization: Bearer xxx` 是什么意思 → [设计 5](#)
- ❓ 解释"用户名错"和"密码错"为什么用同一条消息 → [设计 6](#)

## 看右边 →

| 文件 | 看什么 |
|---|---|
| `server/config.js`                   | JWT_SECRET 与过期时间 |
| `server/routes/auth.js`              | register / login / me 三个 handler |
| `server/middleware/requireAuth.js`   | 12 行 = JWT 验签 + 挂 req.user |

下一节解决「**前端怎么调后端这些接口？怎么让每个请求自动带上 token？401 怎么处理？**」
