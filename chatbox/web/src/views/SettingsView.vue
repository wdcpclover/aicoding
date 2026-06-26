<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import Logo from '../components/Logo.vue'

const router = useRouter()
const store = useSettingsStore()
const { data, loading } = storeToRefs(store)

const PROVIDERS = [
  { id: 'mock',     label: 'Mock',     desc: '内置规则，无需 API key，离线可跑',   color: '#94a3b8' },
  { id: 'openai',   label: 'OpenAI',   desc: '官方 API；可填中转 api_base',         color: '#10a37f' },
  { id: 'deepseek', label: 'DeepSeek', desc: '便宜好用，OpenAI 兼容协议',           color: '#4f46e5' },
  { id: 'claude',   label: 'Claude',   desc: 'Anthropic 官方 API',                  color: '#d97706' }
]

const form = reactive({
  provider: 'mock',
  api_key: '',
  clear_key: false,
  api_base: '',
  model: '',
  system_prompt: ''
})

const msg = ref('')
const msgType = ref('')

watch(data, v => {
  form.provider = v.provider
  form.api_base = v.api_base
  form.model = v.model
  form.system_prompt = v.system_prompt
  form.api_key = ''
  form.clear_key = false
}, { immediate: true })

async function onSave() {
  msg.value = ''
  const patch = {
    provider:      form.provider,
    api_base:      form.api_base.trim(),
    model:         form.model.trim(),
    system_prompt: form.system_prompt
  }
  if (form.clear_key) patch.api_key = ''
  else if (form.api_key.trim()) patch.api_key = form.api_key.trim()

  const ok = await store.update(patch)
  if (ok) {
    msg.value = '已保存'
    msgType.value = 'ok'
    form.api_key = ''
    form.clear_key = false
  } else {
    msg.value = store.error || '保存失败'
    msgType.value = 'err'
  }
}

onMounted(store.fetch)
</script>

<template>
  <div class="settings-wrap">
    <div class="page">
      <header class="page-head">
        <button class="back" @click="router.push({ name: 'chat' })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回
        </button>
        <div class="title-block">
          <Logo :size="22" />
          <h1>设置</h1>
        </div>
      </header>

      <div class="content">
        <!-- 提供商 -->
        <section class="card">
          <header class="card-head">
            <h2>AI 提供商</h2>
            <p class="card-desc">选择 chatbox 用哪个模型回复你的消息</p>
          </header>
          <div class="providers">
            <label
              v-for="p in PROVIDERS"
              :key="p.id"
              class="provider"
              :class="{ active: form.provider === p.id }"
            >
              <input type="radio" name="provider" :value="p.id" v-model="form.provider">
              <span class="dot" :style="{ background: p.color }"></span>
              <div class="p-text">
                <div class="p-label">{{ p.label }}</div>
                <div class="p-desc">{{ p.desc }}</div>
              </div>
              <span v-if="form.provider === p.id" class="check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            </label>
          </div>
        </section>

        <!-- API Key -->
        <section class="card" v-if="form.provider !== 'mock'">
          <header class="card-head">
            <h2>API Key</h2>
            <p class="card-desc">
              <template v-if="data.has_key && !form.clear_key">
                已配置（结尾 <code>...{{ data.key_tail }}</code>）。不填则保留原 key。
              </template>
              <template v-else>
                填写你的 {{ form.provider }} API key。明文储存在服务端 SQLite，仅本账号可见。
              </template>
            </p>
          </header>
          <input
            v-model="form.api_key"
            type="password"
            placeholder="sk-..."
            autocomplete="off"
          >
          <label class="check-row">
            <input type="checkbox" v-model="form.clear_key">
            <span>清空已保存的 key</span>
          </label>
        </section>

        <!-- 高级 -->
        <section class="card" v-if="form.provider !== 'mock'">
          <header class="card-head">
            <h2>高级</h2>
            <p class="card-desc">不填走默认；遇到中转或想换模型时改这里</p>
          </header>

          <label>
            <span>API Base</span>
            <input v-model="form.api_base" placeholder="留空走默认（如 https://api.deepseek.com/v1）">
          </label>

          <label>
            <span>Model</span>
            <input v-model="form.model" placeholder="留空走默认（gpt-4o-mini / deepseek-chat / claude-sonnet-4-5）">
          </label>
        </section>

        <!-- 人设 -->
        <section class="card">
          <header class="card-head">
            <h2>System Prompt</h2>
            <p class="card-desc">给 AI 设定一个固定人设；留空则使用默认</p>
          </header>
          <textarea
            v-model="form.system_prompt"
            rows="3"
            placeholder="例如：你是一个 Vue 教学助手，回答简洁专业..."
          ></textarea>
        </section>
      </div>

      <footer class="page-foot">
        <p v-if="msg" class="msg" :class="msgType">
          <span v-if="msgType === 'ok'">✓</span>
          <span v-else>⚠️</span>
          {{ msg }}
        </p>
        <button class="primary" :disabled="loading" @click="onSave">
          {{ loading ? '保存中...' : '保存设置' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.settings-wrap {
  min-height: 100vh;
  background: var(--bg-base);
  overflow-y: auto;
}
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px 100px;
}

.page-head {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 24px;
}
.back {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  color: var(--text-muted);
  transition: border-color 0.12s;
}
.back:hover { border-color: var(--border-strong); color: var(--text); }

.title-block {
  display: flex; align-items: center; gap: 10px;
}
h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }

.content {
  display: flex; flex-direction: column; gap: 16px;
}

.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
}
.card-head { margin-bottom: 14px; }
.card-head h2 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.card-desc {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.55;
}
.card-desc code {
  background: var(--bg-subtle);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #be123c;
}

/* providers */
.providers { display: grid; gap: 8px; }
.provider {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.provider:hover { background: var(--bg-subtle); }
.provider.active {
  border-color: var(--accent);
  background: var(--accent-light);
}
.provider input[type=radio] { display: none; }
.provider .dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0;
}
.p-text { flex: 1; }
.p-label { font-size: 13.5px; font-weight: 500; color: var(--text); }
.p-desc { margin-top: 2px; font-size: 12px; color: var(--text-muted); }
.check {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* form fields */
label:not(.provider):not(.check-row) {
  display: flex; flex-direction: column; gap: 6px;
  margin-bottom: 12px;
}
label:not(.provider):not(.check-row):last-child { margin-bottom: 0; }
label span { font-size: 12px; color: var(--text-muted); font-weight: 500; }

input[type=text],
input[type=password],
input:not([type]),
textarea {
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  outline: none;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--text);
  width: 100%;
  transition: border-color 0.12s, box-shadow 0.12s;
}
input:focus, textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
textarea { resize: vertical; min-height: 70px; line-height: 1.55; }

.check-row {
  display: flex; align-items: center; gap: 8px;
  margin-top: 10px;
  font-size: 12.5px; color: var(--text-muted);
  cursor: pointer;
}
.check-row input { accent-color: var(--accent); }

/* footer */
.page-foot {
  position: sticky;
  bottom: 16px;
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow);
}
.msg {
  margin: 0;
  display: flex; align-items: center; gap: 6px;
  font-size: 13px;
}
.msg.ok  { color: var(--success); }
.msg.err { color: var(--danger); }

.primary {
  margin-left: auto;
  padding: 9px 22px;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background 0.12s, transform 0.12s;
}
.primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
.primary:disabled { opacity: 0.55; cursor: not-allowed; }
</style>
