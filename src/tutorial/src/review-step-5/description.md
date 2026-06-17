# 【实战 1】登录 + Token：axios 实例 {#review-step-5}

> 知识点过完了，从这里进入**考试实战**。我们用一道往年真题——「校园活动管理平台」（A 卷）当主线，把前面复习的 **Vue + 路由 + Pinia + Express** 串成一个能跑的完整项目，每一步都标注**它对应试卷里哪个文件、值多少分**。
>
> 本节先啃考试的第一道坎：**登录拿 token → 存起来 → 之后每个请求自动带上**。对应试卷里的 `utils/request.js`、`LoginView.vue`、登录相关 store。

## 这一节解决三件事 {#three-things}

1. **创建 axios 实例**（试卷明确要求「使用创建 axios 实例的方式处理请求」）
2. **请求拦截器自动带 token**（A 卷：Header 加 `Token: {token}`）
3. **token 存 localStorage**，刷新页面**自动保持登录**

## 一、axios 实例 + 两个拦截器 {#request-js}

这就是试卷里的 `utils/request.js`，**全卷所有请求都走它**：

```js
import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端地址
  timeout: 5000
})

// 请求拦截器：自动带 token（考试最爱考这里）
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Token = token   // B 卷换成 'Auth-Token'
  return config
})

// 响应拦截器：剥壳 + 统一错误
request.interceptors.response.use(
  response => {
    const body = response.data            // { code, data, message }
    if (body.code === 200) return body.data
    return Promise.reject(new Error(body.message))
  },
  error => Promise.reject(error)
)

export default request
```

> 📌 **关键记忆点**：token 不是在每个组件里手动拼到 header，而是**在拦截器里统一加一次**。组件里只写 `request.get('/activities')`，token 自动就带上了。

## 二、登录 → 存 token {#login}

<div class="composition-api">

```js
async function login() {
  // data = { token, user }
  const data = await request.post('/login', {
    student_id: form.value.student_id,
    password: form.value.password
  })
  localStorage.setItem('token', data.token)              // ★ 存起来
  localStorage.setItem('user', JSON.stringify(data.user))
}
```

</div>

## 三、刷新后自动保持登录 {#persist}

诀窍就一句：**组件初始化时，从 localStorage 读初始值**。

```js
const token = ref(localStorage.getItem('token') || '')
const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
```

刷新页面 → JS 重新执行 → 又从 localStorage 把 token 读回来 → 还是登录态。**这就是「刷新不掉登录」的全部秘密**，没有别的魔法。

## 看右边 → {#try}

右边是一个**能跑的登录页**：

- 随便填学号密码 → 登录 → 看到 token 存进了 localStorage
- 点「带 token 调受保护接口」→ 成功（拦截器把 token 带上了）
- 点「假装没 token 再调一次」→ 被后端拦截（这正是下一步「访问控制」要处理的）
- **刷新整个页面** → 依然登录，因为 token 在 localStorage 里

> 💡 右边 `request.js` 顶部用了 `adapter: mockAdapter` 假装一个后端，纯粹是为了 demo 离线能跑。**真实考试你删掉那一行**，再写真正的 `server/index.js`（第 6 步讲）。

➡️ 下一步：把活动数据收进 **Pinia store**。
