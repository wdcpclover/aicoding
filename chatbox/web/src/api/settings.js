import request from './request'

export const settingsApi = {
  get:    ()        => request.get('/api/settings'),
  update: (patch)   => request.put('/api/settings', patch)
}
