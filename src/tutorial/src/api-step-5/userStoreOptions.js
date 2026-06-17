// =============================================================
//  src/stores/user.js  —— Options 语法（选项式）
//  跟 setup 版完全等价
// =============================================================

import { defineStore } from 'pinia'
import { userApi } from './userApi.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    list: [],
    current: null,
    loading: false,
    error: '',
    started: true
  }),
  getters: {
    total: (state) => state.list.length
  },
  actions: {
    async _call(fn) {
      this.loading = true
      this.error = ''
      try {
        return await fn()
      } catch (e) {
        if (!e.response) {
          this.started = false
          this.error = '连接不到后端，请确认 http://localhost:3001 已启动'
        } else {
          this.error = `${e.response.status} ${e.response.data?.message || '请求失败'}`
        }
      } finally {
        this.loading = false
      }
    },
    async fetchList() {
      const data = await this._call(() => userApi.list())
      if (data) {
        this.list = data
        this.started = true
      }
    },
    async fetchOne(id) {
      const data = await this._call(() => userApi.get(id))
      if (data) this.current = data
    },
    async addOne(form) {
      const created = await this._call(() => userApi.create(form))
      if (created) this.list.push(created)
      return created
    },
    async updateOne(id, patch) {
      const updated = await this._call(() => userApi.update(id, patch))
      if (updated) {
        const idx = this.list.findIndex(u => u.id === id)
        if (idx > -1) this.list[idx] = updated
        if (this.current?.id === id) this.current = updated
      }
    },
    async removeOne(id) {
      const removed = await this._call(() => userApi.remove(id))
      if (removed) {
        this.list = this.list.filter(u => u.id !== id)
        if (this.current?.id === id) this.current = null
      }
    }
  }
})
