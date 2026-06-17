# 数据存哪？怎么存？—— SQLite 4 张表 {#proj-step-2}

> 第 1 节我们已经从业务需求**推出**要存 4 类数据。
> 这一节走完 **需求 → 详细设计 → 实现** ——把这 4 张表真正建出来。

## 🎯 第一步：需求

回到 [第 1 节的"用户故事 + 存什么"表](#proj-step-1)，挑出**所有需要持久化**的那几行：

```
# | 用户故事            | 存什么
──┼─────────────────────┼─────────────────────────
1 | 注册                | 用户的账号（用户名、密码哈希、注册时间）
4 | 新对话              | 一个对话（属于谁、标题、何时建）
5 | 一问一答            | 多条消息（属于哪个对话、是用户还是 AI、内容）
7 | 设置 AI + API key   | 每个用户的 AI 配置（provider、key、模型）
```

**4 类数据要长期保存**。其余故事（登录、查列表、删除...）不新增数据。

**业务约束**：

- 每个用户的数据**只对他自己可见**（alice 看不到 bob 的）
- 用户**注销**时，他的对话、消息、设置**全部清掉**（GDPR-like）
- 一个用户能有**任意多个**对话；一个对话能有**任意多条**消息

## 🔍 第二步：详细设计

### 设计 1 — 把"存什么"画成 ER 关系图

四类数据合并成 4 张表，关系是这样：

```
┌─────────────┐
│   users     │
│─────────────│
│ id (PK)     │ ───┬──── 1 : 1 ──── ┌───────────────┐
│ username    │    │                 │ user_settings  │
│ password_hash│    │                 └───────────────┘
│ created_at  │    │
└─────────────┘    │
                   │
                   └──── 1 : N ──── ┌──────────────┐
                                     │ conversations│
                                     │──────────────│
                                     │ id           │
                                     │ user_id (FK) │
                                     │ title        │
                                     │ ...          │
                                     └──────┬───────┘
                                            │
                                            └─ 1 : N ── ┌──────────┐
                                                         │ messages  │
                                                         │ id        │
                                                         │ conv_id   │
                                                         │ role      │
                                                         │ content   │
                                                         └──────────┘
```

**三句话总结**：

1. **users 1 : 1 user_settings**——一人一份 AI 配置
2. **users 1 : N conversations**——一人多对话
3. **conversations 1 : N messages**——一对话多消息

### 设计 2 — 每个字段怎么定（从业务推出）

**users 表**：

```
业务问题 ────────────────────  字段决策
"登录用什么"                 username TEXT NOT NULL UNIQUE
"密码怎么存"                  password_hash TEXT NOT NULL  （绝不存明文 → 第 3 节细讲）
"什么时候注册的"              created_at INTEGER NOT NULL  （epoch ms 数字）
"主键怎么定"                  id INTEGER PRIMARY KEY AUTOINCREMENT
```

**conversations 表**：

```
业务问题 ────────────────────  字段决策
"属于哪个用户"                user_id INTEGER NOT NULL REFERENCES users
"对话叫什么"                  title TEXT NOT NULL DEFAULT '新对话'
"什么时候建的"                created_at INTEGER NOT NULL
"最后什么时候活跃"            updated_at INTEGER NOT NULL  （排序用）
```

**messages 表**：

```
业务问题 ────────────────────  字段决策
"属于哪个对话"                conversation_id INTEGER NOT NULL
"谁发的"                      role TEXT NOT NULL  （'user' / 'assistant'）
"消息内容"                    content TEXT NOT NULL
"什么时候发的"                created_at INTEGER NOT NULL
```

**user_settings 表**：

```
业务问题 ────────────────────  字段决策
"属于哪个用户"                user_id INTEGER PRIMARY KEY  （同时是主键和外键 → 强制 1:1）
"用哪个 AI"                   provider TEXT NOT NULL DEFAULT 'mock'
"API key"                     api_key TEXT
"模型 / API base / system"    model / api_base / system_prompt （可选）
"最后更新时间"                updated_at INTEGER NOT NULL
```

### 设计 3 — 时间戳类型选 INTEGER 不选 DATETIME

```
DATETIME 字符串              ✅ INTEGER (epoch ms)
─────────────                ──────────────
跨语言要解析格式               JS / Python / Go 全是数字
排序、比较慢                  整数比较，索引天然支持
时区是个无底洞                 没有时区问题
前端要转字符串                 new Date(ts).toLocaleString()
```

→ 所有时间字段都用 `INTEGER NOT NULL`，存 `Date.now()`。

### 设计 4 — 主键用 AUTOINCREMENT

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

**AUTOINCREMENT 让 id 严格递增**，不重用已删的 id。

```
没 AUTOINCREMENT：删了 id=4 → 下次 INSERT 可能拿到 4 → 日志里"鬼影"
✅ AUTOINCREMENT：永远递增 → 任何 id 都可追溯
```

### 设计 5 — 外键级联删除（业务约束的兑现）

业务约束："注销用户 → 他的对话、消息、设置全部清掉"。

最 naive 的实现是业务代码里写 4 条 DELETE：

```js
db.exec('DELETE FROM messages WHERE conversation_id IN (...)')
db.exec('DELETE FROM conversations WHERE user_id = ?')
db.exec('DELETE FROM user_settings WHERE user_id = ?')
db.exec('DELETE FROM users WHERE id = ?')
```

**容易漏一步 + 顺序错了 + 没事务**。

正确做法——在表定义里**直接告诉数据库**：

```sql
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

业务代码退化成一行：

```js
db.prepare('DELETE FROM users WHERE id = ?').run(userId)
// → 自动级联：user_settings / conversations / messages 全部清掉
```

⚠️ **SQLite 默认外键约束是关的**——必须显式打开：

```js
db.pragma('foreign_keys = ON')
```

### 设计 6 — 索引（让"列出我的对话"飞快）

业务最高频查询：「**列出我的对话，按最近活跃倒序**」。

```sql
SELECT * FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
```

**没索引** → 全表扫描 → 100 个用户、10000 条对话全部读出来过滤+排序，慢。

加一个**复合索引**：

```sql
CREATE INDEX idx_conv_user ON conversations(user_id, updated_at DESC);
```

→ SQLite 按索引顺序直接拿到数据，**0 扫描 0 排序**。

**索引设计两条原则**：

1. **WHERE 用的列放前面**，**ORDER BY 用的列放后面**
2. 不要给每个字段都建索引——**写入会变慢**

### 设计 7 — 技术选型（SQLite + better-sqlite3）

```
                 教学场景                    生产场景
                 ────────                    ────────
MySQL/Postgres   ❌ 要装 Docker / 服务      ✅ 大型项目用
                    半小时装不完
MongoDB          ❌ 不能教 SQL              ✅ 文档型场景
JSON 文件        ❌ 没并发、没事务、没索引   ❌ 不能
✅ SQLite         零依赖、单文件、真 SQL     ✅ 中小项目 / 嵌入式
                    `rm chatbox.db` = 重置
```

**better-sqlite3 vs sqlite3**：同步 API，教学示例少一层 await。

### 设计 8 — SQL 操作的约定（5 种用法）

整个项目所有 SQL 操作只用这 5 种。**永远用占位符，绝不字符串拼接**（防 SQL 注入）：

```js
// ① INSERT / UPDATE / DELETE 用 .run()
const info = db.prepare('INSERT INTO users (...) VALUES (?, ?, ?)')
                .run(username, hash, Date.now())
info.lastInsertRowid   // 新插入 id

// ② 查单行用 .get()
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1)

// ③ 查多行用 .all()
const list = db.prepare('SELECT * FROM users').all()

// ④ 参数多用命名占位符 @name
db.prepare('INSERT INTO ... VALUES (@a, @b, @c)').run({ a: 1, b: 2, c: 3 })

// ⑤ "插入或更新" 用 UPSERT —— user_settings 一人一行用这个
db.prepare(`
  INSERT INTO user_settings (...) VALUES (...)
  ON CONFLICT(user_id) DO UPDATE SET ...
`).run({...})
```

**反面教材**：

```js
// ❌ SQL 注入根源
db.exec(`INSERT INTO users VALUES ('${username}')`)
// 用户名输入 "x'); DROP TABLE users; --" → 表没了

// ✅ 占位符自动转义
db.prepare('INSERT INTO users VALUES (?)').run(username)
```

## 💻 第三步：实现

`server/db.js` 把上面 8 个设计写进 60 行：

```js
const Database = require('better-sqlite3')
const db = new Database(path.join(__dirname, 'chatbox.db'))

db.pragma('journal_mode = WAL')     // 并发写更好
db.pragma('foreign_keys = ON')       // ⚠️ 设计 5 必须打开

db.exec(`
  CREATE TABLE IF NOT EXISTS users (...)
  CREATE TABLE IF NOT EXISTS user_settings (...) FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  CREATE TABLE IF NOT EXISTS conversations (...)  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  CREATE TABLE IF NOT EXISTS messages (...)       FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id, updated_at DESC);
`)

module.exports = db
```

完整代码看右边 →

### 怎么验证设计对不对

```bash
cd chatbox/server
npm install
npm start
# → 自动建 chatbox.db 文件 + 自动建 4 张表

# 用 SQLite 命令行验
sqlite3 chatbox.db ".schema"
# → 看到 4 张表 + 索引
```

```bash
# 删库重来 = 删一个文件
rm chatbox.db
npm start                 # → 自动重建空表
```

## ✅ 本节学完，你应该能：

- ❓ 从需求**推出**为什么是 4 张表 → [设计 1](#)
- ❓ 解释为什么时间戳用 INTEGER 不用 DATETIME → [设计 3](#)
- ❓ 解释为什么 `pragma foreign_keys = ON` 不能省 → [设计 5](#)
- ❓ 看一条查询 SQL，知道需要什么索引 → [设计 6](#)
- ❓ 写出 better-sqlite3 五种用法，分清 .run / .get / .all → [设计 8](#)

## 看右边 →

右边是 `server/db.js` 的**完整真实源码**——60 行不到，把上面 8 个设计一次性看完。

> 💡 想真改 SQL 看效果 → 启动后端后，VS Code 装 "SQLite Viewer" 插件打开 `chatbox/server/chatbox.db`，GUI 查看 / 改数据所见即所得。

下一节解决「**用户故事 #1 #2：注册和登录怎么做？密码怎么安全存？登录后下次访问怎么"记住"是谁？**」——bcrypt + JWT 链路。
