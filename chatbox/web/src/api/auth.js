import request from './request'

export const authApi = {
  register: ({ username, password }) =>
    request.post('/api/auth/register', { username, password }),

  login: ({ username, password }) =>
    request.post('/api/auth/login', { username, password }),

  me: () => request.get('/api/auth/me')
}
