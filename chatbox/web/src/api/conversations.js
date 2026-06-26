import request from './request'

export const conversationsApi = {
  list:   ()         => request.get('/api/conversations'),
  create: (title)    => request.post('/api/conversations', { title }),
  rename: (id, title)=> request.patch(`/api/conversations/${id}`, { title }),
  remove: (id)       => request.delete(`/api/conversations/${id}`)
}
