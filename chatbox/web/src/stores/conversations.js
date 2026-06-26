// =============================================================
//  stores/conversations.js
//  对话列表 + 当前对话 + 当前对话的消息
// =============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { conversationsApi } from '../api/conversations'
import { messagesApi } from '../api/messages'

export const useConversationsStore = defineStore('conversations', () => {
  const list = ref([])               // [{ id, title, message_count, last_message, ... }]
  const currentId = ref(null)
  const messages = ref([])           // 当前对话的消息列表
  const loadingList = ref(false)
  const loadingMessages = ref(false)
  const sending = ref(false)
  const error = ref('')

  const current = computed(() => list.value.find(c => c.id === currentId.value) || null)

  // —— 列表 ——
  async function fetchList() {
    loadingList.value = true
    error.value = ''
    try {
      list.value = await conversationsApi.list()
    } catch (e) {
      error.value = e.response?.data?.message || e.message
    } finally {
      loadingList.value = false
    }
  }

  async function create(title = '新对话') {
    const created = await conversationsApi.create(title)
    list.value.unshift(created)
    currentId.value = created.id
    messages.value = []
    return created
  }

  async function rename(id, title) {
    const updated = await conversationsApi.rename(id, title)
    const idx = list.value.findIndex(c => c.id === id)
    if (idx > -1) list.value[idx] = { ...list.value[idx], ...updated }
  }

  async function remove(id) {
    await conversationsApi.remove(id)
    list.value = list.value.filter(c => c.id !== id)
    if (currentId.value === id) {
      currentId.value = null
      messages.value = []
    }
  }

  // —— 选中对话 + 拉历史消息 ——
  async function select(id) {
    if (currentId.value === id) return
    currentId.value = id
    messages.value = []
    if (id == null) return
    loadingMessages.value = true
    try {
      messages.value = await messagesApi.list(id)
    } catch (e) {
      error.value = e.response?.data?.message || e.message
    } finally {
      loadingMessages.value = false
    }
  }

  // —— 发消息 ——
  async function send(content) {
    if (!currentId.value) return
    sending.value = true
    error.value = ''
    // 乐观更新：用户消息先 push
    const localUserMsg = {
      id: `tmp-${Date.now()}`,
      role: 'user',
      content,
      created_at: Date.now()
    }
    messages.value.push(localUserMsg)

    try {
      const res = await messagesApi.send(currentId.value, content)
      // 用真实记录替换乐观项
      const idx = messages.value.findIndex(m => m.id === localUserMsg.id)
      if (idx > -1) messages.value[idx] = res.user
      messages.value.push(res.assistant)

      // 列表更新：刷新当前对话的 title/last_message/updated_at
      await fetchList()
    } catch (e) {
      error.value = e.response?.data?.message || e.message
      // 失败 → 回滚乐观项
      messages.value = messages.value.filter(m => m.id !== localUserMsg.id)
    } finally {
      sending.value = false
    }
  }

  function reset() {
    list.value = []
    currentId.value = null
    messages.value = []
    error.value = ''
  }

  return {
    list, currentId, current, messages,
    loadingList, loadingMessages, sending, error,
    fetchList, create, rename, remove, select, send, reset
  }
})
