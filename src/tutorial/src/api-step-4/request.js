// =============================================================
//  src/utils/request.js
//  axios 实例 + 请求/响应拦截器
//  整个项目就这一份，所有业务 API 都基于它。
// =============================================================

import axios from 'axios'

// 把拦截器日志推到一个全局数组，方便 App.vue 实时显示
// 真实项目里这个数组不需要，全部 console.log 即可
const logs = (window.__interceptorLogs ||= [])
function log(line) {
  console.log(line)
  logs.push({ time: Date.now(), line })
  if (logs.length > 50) logs.shift()
}

// —— 1) 创建实例（不污染全局 axios）——
const request = axios.create({
  baseURL: 'http://localhost:3001',     // 真实项目用 import.meta.env.VITE_API_BASE
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// —— 2) 请求拦截器：加 token、加 X-Request-Id、打日志 ——
request.interceptors.request.use(
  config => {
    // 自动加 token
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    // 加请求 ID 让前后端日志能对上
    config.headers['X-Request-Id'] = Math.random().toString(36).slice(2, 10)

    // 调试日志
    log(`→ ${config.method.toUpperCase()} ${config.url}`)

    return config        // ⚠️ 必须 return，否则请求发不出去
  },
  err => Promise.reject(err)
)

// —— 3) 响应拦截器：剥 .data + 统一错误处理 ——
request.interceptors.response.use(
  // 成功：把 response.data 直接 return 出去
  response => {
    log(`← ${response.status} ${response.config.url}`)
    return response.data
  },
  // 失败：第 3 节的"三态判断"被一次性收进这里
  error => {
    if (!error.response) {
      log(`🌐 网络错误：${error.message}`)
      return Promise.reject(error)
    }
    const { status, data } = error.response
    switch (status) {
      case 401: log(`🔒 未登录 (401)，应跳登录页`); break
      case 403: log(`⛔ 无权限 (403)`); break
      case 404: log(`🔍 资源不存在 (404)：${data?.message || ''}`); break
      case 500: log(`💥 服务器错误 (500)：${data?.message || ''}`); break
      default:  log(`❓ HTTP ${status}：${data?.message || ''}`)
    }
    return Promise.reject(error)
  }
)

export default request
