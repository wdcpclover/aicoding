<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const authStore = useAuthStore()
const convStore = useConversationsStore()
const settingsStore = useSettingsStore()

const open = ref(false)
const wrapRef = ref(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }

function go(name) {
  close()
  router.push({ name })
}

function logout() {
  close()
  authStore.logout()
  convStore.reset()
  settingsStore.reset()
  router.push({ name: 'login' })
}

function onDocClick(e) {
  if (open.value && wrapRef.value && !wrapRef.value.contains(e.target)) close()
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="user-menu" ref="wrapRef">
    <button class="trigger" @click="toggle" :class="{ active: open }">
      <span class="avatar">{{ (authStore.user?.username || '?').slice(0, 1).toUpperCase() }}</span>
      <span class="name">{{ authStore.user?.username || '...' }}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" :class="{ flip: open }">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="open" class="dropdown">
      <button class="item" @click="go('settings')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        设置
      </button>
      <div class="sep"></div>
      <button class="item danger" @click="logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出登录
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-menu { position: relative; }

.trigger {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px 6px 6px;
  border-radius: 8px;
  color: var(--side-text);
  transition: background 0.12s;
  width: 100%;
}
.trigger:hover,
.trigger.active { background: var(--side-bg-hover); }

.avatar {
  width: 26px; height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: #fff;
  font-size: 12px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.name {
  flex: 1;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.trigger svg { color: var(--side-text-mute); transition: transform 0.15s; }
.trigger svg.flip { transform: rotate(180deg); }

.dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0; right: 0;
  background: var(--side-bg-hover);
  border: 1px solid var(--side-border);
  border-radius: 10px;
  padding: 4px;
  box-shadow: var(--shadow-lg);
  z-index: 50;
  animation: dropin 0.12s ease-out;
}
@keyframes dropin {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.item {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--side-text);
  text-align: left;
}
.item:hover { background: var(--side-bg-active); }
.item.danger { color: #fca5a5; }
.item.danger:hover { background: rgba(239, 68, 68, 0.12); }
.item svg { flex-shrink: 0; }

.sep {
  height: 1px;
  background: var(--side-border);
  margin: 4px 0;
}
</style>
