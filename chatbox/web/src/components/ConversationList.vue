<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConversationsStore } from '../stores/conversations'

const store = useConversationsStore()
const { list, currentId, loadingList } = storeToRefs(store)

const renamingId = ref(null)
const renamingText = ref('')
const menuId = ref(null)

function startRename(c) {
  menuId.value = null
  renamingId.value = c.id
  renamingText.value = c.title
}

async function commitRename(id) {
  const title = renamingText.value.trim()
  if (title) {
    try { await store.rename(id, title) } catch (e) { console.error(e) }
  }
  renamingId.value = null
}

async function onRemove(c) {
  menuId.value = null
  if (!confirm(`删除对话「${c.title}」？此操作不可恢复。`)) return
  try {
    await store.remove(c.id)
  } catch (e) {
    alert(e.response?.data?.message || e.message)
  }
}

function fmt(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toTimeString().slice(0, 5)
  }
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return '昨天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="conv-list">
    <p v-if="loadingList && !list.length" class="state">加载中...</p>
    <p v-else-if="!list.length" class="state">还没有对话<br><span>点上方"新对话"开始</span></p>

    <div
      v-for="c in list"
      :key="c.id"
      class="conv-item"
      :class="{ active: c.id === currentId }"
      @click="store.select(c.id)"
    >
      <input
        v-if="renamingId === c.id"
        v-model="renamingText"
        class="rename-input"
        autofocus
        @keyup.enter="commitRename(c.id)"
        @keyup.esc="renamingId = null"
        @blur="commitRename(c.id)"
        @click.stop
      >
      <template v-else>
        <span class="title" :title="c.title">{{ c.title }}</span>
        <span class="time">{{ fmt(c.updated_at) }}</span>

        <button
          class="more"
          @click.stop="menuId = (menuId === c.id ? null : c.id)"
          :class="{ open: menuId === c.id }"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.6"/>
            <circle cx="12" cy="12" r="1.6"/>
            <circle cx="19" cy="12" r="1.6"/>
          </svg>
        </button>

        <div v-if="menuId === c.id" class="menu" @click.stop>
          <button @click="startRename(c)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            重命名
          </button>
          <button class="danger" @click="onRemove(c)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
            </svg>
            删除
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.conv-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px 8px;
}

.state {
  margin: 36px 12px;
  text-align: center;
  color: var(--side-text-dim);
  font-size: 12.5px;
  line-height: 1.7;
}
.state span { color: var(--side-text-dim); opacity: 0.7; }

.conv-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}
.conv-item:hover { background: var(--side-bg-hover); }
.conv-item.active {
  background: var(--side-bg-active);
}

.title {
  flex: 1;
  font-size: 13px;
  color: var(--side-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-item.active .title { color: #fff; }

.time {
  font-size: 11px;
  color: var(--side-text-dim);
  flex-shrink: 0;
  transition: opacity 0.12s;
}
.conv-item:hover .time { opacity: 0; }

.more {
  position: absolute;
  right: 6px; top: 50%;
  transform: translateY(-50%);
  width: 24px; height: 24px;
  border-radius: 5px;
  color: var(--side-text-mute);
  display: none;
  align-items: center;
  justify-content: center;
}
.conv-item:hover .more,
.more.open { display: flex; }
.more:hover { background: var(--side-bg-active); color: #fff; }

.menu {
  position: absolute;
  right: 6px; top: calc(100% - 2px);
  background: #2a2a2e;
  border: 1px solid var(--side-bg-active);
  border-radius: 8px;
  padding: 4px;
  min-width: 130px;
  z-index: 20;
  box-shadow: var(--shadow-lg);
}
.menu button {
  display: flex; align-items: center; gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 13px;
  color: var(--side-text);
  text-align: left;
}
.menu button:hover { background: var(--side-bg-active); }
.menu button.danger { color: #fca5a5; }
.menu button.danger:hover { background: rgba(239, 68, 68, 0.14); }

.rename-input {
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
  background: var(--side-bg-active);
  border: 1px solid var(--accent);
  border-radius: 5px;
  color: #fff;
  outline: none;
}
</style>
