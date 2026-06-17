// =============================================================
//  src/utils/request.js  —— 与第 4 节同款
//  axios 实例 + 拦截器，整个项目就这一份。
// =============================================================

import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3001',     // 真实项目用 import.meta.env.VITE_API_BASE
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// —— 请求拦截器：加 token、加 X-Request-Id、打日志 ——
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.headers['X-Request-Id'] = Math.random().toString(36).slice(2, 10)
    console.log(`→ ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  err => Promise.reject(err)
)

// —— 响应拦截器：剥 .data + 统一错误处理 ——
request.interceptors.response.use(
  response => {
    console.log(`← ${response.status} ${response.config.url}`)
    return response.data
  },
  error => {
    if (!error.response) {
      console.error('🌐 网络错误（后端没启动？）')
      return Promise.reject(error)
    }
    const { status, data } = error.response
    switch (status) {
      case 401: console.warn('🔒 未登录 (401)，应跳登录页'); break
      case 403: console.warn('⛔ 无权限 (403)'); break
      case 404: console.warn(`🔍 资源不存在 (404)：${data?.message || ''}`); break
      case 500: console.error(`💥 服务器错误 (500)：${data?.message || ''}`); break
      default:  console.warn(`❓ HTTP ${status}：${data?.message || ''}`)
    }
    return Promise.reject(error)
  }
)

export default request
