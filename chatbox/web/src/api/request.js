// =============================================================
//  src/api/request.js
//  axios 实例 + 拦截器：
//    - baseURL 来自环境变量 VITE_API_BASE（开发/生产自动切换）
//    - 自动加 Authorization
//    - 自动剥 .data
//    - 401 → 清 token + 通知路由跳登录
// =============================================================

import axios from 'axios'

const request = axios.create({
  // 开发环境：http://localhost:3002（.env.development）
  // 生产环境：留空 → 走相对路径 /api/xxx → 同域部署最省心
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 30000
})

// ——— 请求拦截器：自动带 token ———
request.interceptors.request.use(config => {
  const token = localStorage.getItem('chatbox_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ——— 响应拦截器：剥 .data + 统一处理 401 ———
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

request.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('chatbox_token')
      onUnauthorized?.()
    }
    return Promise.reject(err)
  }
)

export default request
