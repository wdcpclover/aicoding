<script setup>
import { onMounted, watch, nextTick, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useConversationsStore } from '../stores/conversations'
import { useSettingsStore } from '../stores/settings'
import ConversationList from '../components/ConversationList.vue'
import MessageBubble from '../components/MessageBubble.vue'
import MessageInput from '../components/MessageInput.vue'
import Logo from '../components/Logo.vue'
import UserMenu from '../components/UserMenu.vue'

const authStore = useAuthStore()
const convStore = useConversationsStore()
const settingsStore = useSettingsStore()

const {
  list, currentId, current, messages,
  loadingMessages, sending, error
} = storeToRefs(convStore)
const { data: settings } = storeToRefs(settingsStore)

const messagesRef = ref(null)

const providerLabel = computed(() => {
  const p = settings.value?.provider || 'mock'
  if (p === 'mock') return 'Mock'
  if (!settings.value?.has_key) return `${p} · 未配置 key`
  return settings.value.model ? `${p} · ${settings.value.model}` : p
})
const providerOk = computed(() =>
  settings.value?.provider === 'mock' || settings.value?.has_key
)

async function scrollToBottom() {
  await nextTick()
  const el = messagesRef.value
  if (el) el.scrollTop = el.scrollHeight
}

async function onCreate() {
  await convStore.create()
}

async function onSend(content) {
  if (!currentId.value) await onCreate()
  await convStore.send(content)
}

watch(messages, scrollToBottom, { deep: true })
watch(currentId, scrollToBottom)

onMounted(async () => {
  await Promise.all([convStore.fetchList(), settingsStore.fetch()])
  if (!convStore.currentId && convStore.list.length) {
    await convStore.select(convStore.list[0].id)
  }
})
</script>

<template>
  <div class="app">
    <!-- ============== 侧栏 ============== -->
    <aside class="sidebar dark-scroll">
      <header class="side-head">
        <div class="brand">
          <Logo :size="22" />
          <span>Chatbox</span>
        </div>
      </header>

      <div class="new-wrap">
        <button class="new-btn" @click="onCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新对话
        </button>
      </div>

      <ConversationList class="side-scroll" />

      <footer class="side-foot">
        <UserMenu />
      </footer>
    </aside>

    <!-- ============== 主区 ============== -->
    <main class="main">
      <header class="main-head">
        <div class="title">
          <span v-if="current">{{ current.title }}</span>
          <span v-else class="muted">未选择对话</span>
        </div>
        <div class="provider" :class="{ ok: providerOk, warn: !providerOk }">
          <span class="dot"></span>
          <span>{{ providerLabel }}</span>
        </div>
      </header>

      <div ref="messagesRef" class="messages">
        <div v-if="!currentId" class="welcome">
          <Logo :size="56" />
          <h2>有什么可以帮你的？</h2>
          <p class="hint">
            点上方 <b>新对话</b> 开始聊天，或在<RouterLink to="/settings">设置</RouterLink>里换上你自己的 AI 模型。
          </p>

          <div class="suggest">
            <button class="chip" @click="onSend('你好')">👋 你好</button>
            <button class="chip" @click="onSend('markdown 怎么用')">📝 Markdown 怎么用</button>
            <button class="chip" @click="onSend('讲个笑话')">😄 讲个笑话</button>
            <button class="chip" @click="onSend('api key 怎么配')">🔑 怎么配 API key</button>
          </div>
        </div>

        <div v-else-if="loadingMessages && !messages.length" class="loading">
          <div class="spinner"></div>
        </div>

        <template v-else>
          <MessageBubble
            v-for="m in messages"
            :key="m.id"
            :role="m.role"
            :content="m.content"
          />
          <div v-if="sending" class="thinking-row">
            <div class="thinking">
              <span class="d"></span><span class="d"></span><span class="d"></span>
            </div>
          </div>
        </template>
      </div>

      <div class="input-bar">
        <p v-if="error" class="err">⚠️ {{ error }}</p>
        <MessageInput :disabled="sending" @send="onSend" />
        <p class="foot-note">AI 可能产生不准确的信息，请独立核实。</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

/* ============== 侧栏 ============== */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex; flex-direction: column;
  background: var(--side-bg);
  color: var(--side-text);
}

.side-head {
  padding: 14px 16px;
  display: flex; align-items: center;
}
.brand {
  display: flex; align-items: center; gap: 10px;
  font-weight: 600; font-size: 15px;
  color: #fff;
  letter-spacing: 0.01em;
}

.new-wrap { padding: 0 10px 8px; }
.new-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px;
  background: transparent;
  border: 1px solid var(--side-border);
  border-radius: 8px;
  color: var(--side-text);
  font-size: 13px;
  font-weight: 500;
  transition: background 0.12s, border-color 0.12s;
}
.new-btn:hover {
  background: var(--side-bg-hover);
  border-color: var(--side-bg-active);
}

.side-scroll {
  flex: 1;
  overflow-y: auto;
}

.side-foot {
  padding: 8px 10px;
  border-top: 1px solid var(--side-border);
}

/* ============== 主区 ============== */
.main {
  flex: 1;
  display: flex; flex-direction: column;
  background: var(--bg-base);
  overflow: hidden;
}

.main-head {
  height: 56px;
  padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elevated);
  flex-shrink: 0;
}
.main-head .title {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.main-head .muted { color: var(--text-dim); font-weight: 400; }

.provider {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.provider .dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--text-dim);
}
.provider.ok    { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
.provider.ok    .dot { background: var(--success); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18); }
.provider.warn  { color: #92400e; background: #fffbeb; border-color: #fcd34d; }
.provider.warn  .dot { background: var(--warn); }

/* ============== 消息区 ============== */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 28px 0 8px;
}

/* 欢迎页 */
.welcome {
  max-width: 560px;
  margin: 80px auto 0;
  padding: 0 24px;
  text-align: center;
  color: var(--text-muted);
}
.welcome h2 {
  margin: 18px 0 6px;
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}
.welcome .hint { margin: 0 0 24px; font-size: 13.5px; color: var(--text-muted); }
.welcome .hint a { color: var(--accent); text-decoration: underline; }

.suggest {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.chip {
  padding: 8px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text);
  transition: border-color 0.12s, transform 0.12s;
}
.chip:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.spinner {
  width: 28px; height: 28px;
  border: 2.5px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.thinking-row {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px;
}
.thinking {
  display: inline-flex; gap: 4px; align-items: center;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  margin-left: 44px;
}
.thinking .d {
  width: 6px; height: 6px;
  background: var(--text-dim);
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}
.thinking .d:nth-child(2) { animation-delay: 0.15s; }
.thinking .d:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-5px); opacity: 1; }
}

/* ============== 底部输入栏 ============== */
.input-bar {
  padding: 8px 24px 14px;
  background: var(--bg-base);
}
.input-bar > * { max-width: 760px; margin: 0 auto; }

.err {
  margin: 0 auto 8px;
  padding: 8px 12px;
  background: var(--danger-bg);
  border-left: 3px solid var(--danger);
  border-radius: 0 4px 4px 0;
  color: #b91c1c;
  font-size: 13px;
  max-width: 760px;
}
.foot-note {
  margin: 8px auto 0;
  text-align: center;
  font-size: 11.5px;
  color: var(--text-dim);
}
</style>
