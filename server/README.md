# mobile2026 / server

教学用的极简 Express 后端，配合 [`vue3` 课件 → 前后端篇](../vue3/src/tutorial/src) 一起使用。
所有数据放在内存数组里，**重启后清零**，专门用来给学生看「前端 axios 调后端 → 后端处理 → 返回数据」的完整链路。

## 启动

```bash
cd server
npm install      # 第一次需要装依赖（express + cors）
npm start        # 启动后端，监听 http://localhost:3001
# 或
npm run dev      # 用 node --watch，改完代码自动重启
```

启动成功会打印：

```
🚀 Express 后端已启动: http://localhost:3001
   健康检查:  http://localhost:3001/api/health
   用户列表:  http://localhost:3001/api/users
```

## 路由

| 方法 | 路径 | 说明 |
|---|---|---|
| GET    | `/api/health`        | 健康检查 |
| GET    | `/api/users`         | 用户列表 |
| GET    | `/api/users/:id`     | 用户详情 |
| POST   | `/api/users`         | 新增用户，body: `{ name, email, age }` |
| PUT    | `/api/users/:id`     | 更新用户 |
| DELETE | `/api/users/:id`     | 删除用户 |

**演示用的"作弊"参数**（只在 `GET /api/users` 上有效）：

- `?_error=1` 让接口返回 500，演示 axios 错误拦截
- `?_slow=1`  人为延迟 2 秒，演示 loading 状态

## 端口约定

| 服务 | 端口 |
|---|---|
| vue3 课件 (VitePress) | 3000 |
| 本后端 (Express)      | 3001 |

CORS 已经全开（`app.use(cors())`），课件里直接打 `http://localhost:3001/...` 即可。
