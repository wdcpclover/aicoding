import axios from 'axios'
import { mockAdapter } from './mockServer.js'

// ===== 考点：用「创建 axios 实例」的方式处理请求（对应试卷 utils/request.js）=====

// ① 创建实例：统一 baseURL、超时
const request = axios.create({
  baseURL: 'http://localhost:3000/api', // 真实考试填后端地址；本 demo 被下面的 mock 拦截，不会真发出去
  timeout: 5000,
  adapter: mockAdapter // ⚠️ 仅 demo：假后端。真实考试删掉这一行 + 顶部 import
})

// ② 请求拦截器：每次请求自动从 localStorage 取 token，塞进请求头
//    A 卷要求：所有 API 请求在 Header 里加 "Token: {token}"
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Token = token // B 卷是 config.headers['Auth-Token'] = token
  }
  return config
})

// ③ 响应拦截器：统一剥壳（{code,data,message} → data）+ 错误处理
request.interceptors.response.use(
  response => {
    const body = response.data // 后端统一返回 { code, data, message }
    if (body.code === 200) {
      return body.data // 业务层直接拿最里层 data，看不到 code/message
    }
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  error => Promise.reject(error)
)

export default request
