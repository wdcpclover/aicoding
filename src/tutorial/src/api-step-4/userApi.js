// =============================================================
//  src/api/user.js
//  用户相关业务 API —— 暴露语义化方法
//  组件只 import 这个文件，不直接接触 axios。
// =============================================================

import request from './request.js'

export const userApi = {
  // GET /api/users
  list() {
    return request.get('/api/users')
  },

  // GET /api/users/:id
  get(id) {
    return request.get(`/api/users/${id}`)
  },

  // POST /api/users   body: { name, email, age }
  create(data) {
    return request.post('/api/users', data)
  },

  // PUT /api/users/:id   body: 任意字段
  update(id, data) {
    return request.put(`/api/users/${id}`, data)
  },

  // DELETE /api/users/:id
  remove(id) {
    return request.delete(`/api/users/${id}`)
  },

  // 故意触发 500（演示响应拦截器统一打错）
  boom() {
    return request.get('/api/users?_error=1')
  }
}
