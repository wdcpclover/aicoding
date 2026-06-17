// =============================================================
//  用户业务 API
//  对应后端：server/server.js
//  路径前缀 /api/users
// =============================================================

import request from './request.js'

export const userApi = {
  list:   ()         => request.get('/api/users'),
  get:    (id)       => request.get(`/api/users/${id}`),
  create: (data)     => request.post('/api/users', data),
  update: (id, data) => request.put(`/api/users/${id}`, data),
  remove: (id)       => request.delete(`/api/users/${id}`)
}
