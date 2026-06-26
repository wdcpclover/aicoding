// =============================================================
//  stores/settings.js
//  当前用户的 LLM 设置（provider / api_key / api_base / model / system_prompt）
// =============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '../api/settings'

export const useSettingsStore = defineStore('settings', () => {
  const data = ref({
    provider: 'mock',
    api_base: '',
    model: '',
    system_prompt: '',
    has_key: false,
    key_tail: ''
  })
  const loading = ref(false)
  const error = ref('')

  async function fetch() {
    loading.value = true
    error.value = ''
    try {
      data.value = await settingsApi.get()
    } catch (e) {
      error.value = e.response?.data?.message || e.message
    } finally {
      loading.value = false
    }
  }

  async function update(patch) {
    loading.value = true
    error.value = ''
    try {
      data.value = await settingsApi.update(patch)
      return true
    } catch (e) {
      error.value = e.response?.data?.message || e.message
      return false
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = {
      provider: 'mock', api_base: '', model: '',
      system_prompt: '', has_key: false, key_tail: ''
    }
    error.value = ''
  }

  return { data, loading, error, fetch, update, reset }
})
