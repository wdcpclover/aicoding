import request from './request'

export const messagesApi = {
  list:   (convId)         => request.get(`/api/conversations/${convId}/messages`),
  send:   (convId, content)=> request.post(`/api/conversations/${convId}/messages`, { content })
}
