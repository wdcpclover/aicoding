<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

type FileItem = { name: string; lang: string; code: string }

const props = defineProps<{
  codesJson: string             // 当前 step 的 codes.json 字符串
}>()

const CHATBOX_API = 'http://localhost:3002'

const files = computed<FileItem[]>(() => {
  try {
    const arr = JSON.parse(props.codesJson || '[]')
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
})

const idx = ref(0)
watch(() => props.codesJson, () => { idx.value = 0 })

const current = computed(() => files.value[idx.value] || { name: '', lang: '', code: '' })
const lineCount = computed(() => current.value.code.split('\n').length)

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(current.value.code)
    copied.value = true
    setTimeout(() => copied.value = false, 1500)
  } catch {}
}

function icon(f: FileItem) {
  if (f.lang === 'vue')  return '🟢'
  if (f.lang === 'json') return '📦'
  if (f.lang === 'html') return '📄'
  if (f.lang === 'css')  return '🎨'
  if (f.lang === 'env')  return '🌱'
  if (f.name.includes('routes/'))     return '🛣️'
  if (f.name.includes('middleware/')) return '🛡️'
  if (f.name.includes('llm/'))        return '🤖'
  if (f.name.includes('stores/'))     return '🗂️'
  if (f.name.includes('api/'))        return '📡'
  if (f.name.includes('router/'))     return '🗺️'
  return '📜'
}

// 健康检查
type Health = { status: 'checking' | 'ok' | 'down'; label: string; hint: string }
const health = ref<Health>({ status: 'checking', label: '检查后端中...', hint: '' })
let healthTimer: any

async function checkHealth() {
  health.value = { status: 'checking', label: '检查后端中...', hint: '' }
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 2000)
  try {
    const r = await fetch(`${CHATBOX_API}/api/health`, { signal: ctrl.signal })
    if (!r.ok) throw new Error()
    health.value = { status: 'ok', label: 'Chatbox 后端在线', hint: `${CHATBOX_API}` }
  } catch {
    health.value = { status: 'down', label: 'Chatbox 后端没启动', hint: 'cd chatbox/server && npm start' }
  } finally {
    clearTimeout(timeout)
  }
}

onMounted(() => {
  checkHealth()
  healthTimer = setInterval(checkHealth, 20000)
})
onUnmounted(() => clearInterval(healthTimer))

// 简单语法高亮：JS / Vue / JSON 关键字 / 字符串 / 注释
const highlightedHtml = computed(() => {
  return highlight(current.value.code, current.value.lang)
})

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
}

const JS_KW = /\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|class|extends|new|this|typeof|instanceof|in|of|async|await|try|catch|finally|throw|import|export|from|default|null|undefined|true|false|require|module)\b/g
const VUE_KW = /\b(setup|defineProps|defineEmits|defineExpose|ref|reactive|computed|watch|watchEffect|onMounted|onUnmounted|onBeforeMount|onBeforeUnmount|nextTick|inject|provide)\b/g
const CSS_KW = /\b(margin|padding|color|background|border|font|display|flex|grid|width|height|position|top|left|right|bottom)\b/g

function highlight(code: string, lang: string): string {
  if (!code) return ''
  let html = escapeHtml(code)

  // 注释（行注释 // 和块注释 /* */）
  html = html.replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>')
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>')

  // 字符串（'...' / "..." / `...`）—— 简化版，不处理嵌套转义
  html = html.replace(/(&quot;[^&]*?&quot;|'[^']*?'|`[^`]*?`)/g, '<span class="s">$1</span>')

  // 数字
  html = html.replace(/\b(\d+)\b/g, '<span class="n">$1</span>')

  if (lang === 'js' || lang === 'vue') {
    html = html.replace(JS_KW, '<span class="k">$1</span>')
    html = html.replace(VUE_KW, '<span class="kv">$1</span>')
  }
  if (lang === 'css') {
    html = html.replace(CSS_KW, '<span class="kc">$1</span>')
  }
  if (lang === 'json') {
    // JSON 的 key（"xxx":）
    html = html.replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="key">$1</span>$2')
  }

  return html
}
</script>

<template>
  <div class="proj-view">
    <div class="health" :class="health.status">
      <span class="dot"></span>
      <b>{{ health.label }}</b>
      <span class="hint">{{ health.hint }}</span>
      <button class="recheck" @click="checkHealth">重检</button>
    </div>

    <div class="browser">
      <header class="b-head">
        <span class="b-title">📁 chatbox/</span>
        <span class="b-meta">{{ files.length }} 个文件 · 真实源码</span>
      </header>

      <div class="tabs">
        <button
          v-for="(f, i) in files"
          :key="f.name"
          class="tab"
          :class="{ active: idx === i }"
          @click="idx = i"
        >
          <span class="t-icon">{{ icon(f) }}</span>
          <span class="t-name">{{ f.name }}</span>
        </button>
      </div>

      <div class="code-wrap">
        <header class="c-head">
          <span class="path">{{ current.name }}</span>
          <span class="lang">{{ current.lang }}</span>
          <span class="lines">{{ lineCount }} 行</span>
          <button class="copy" @click="copy">{{ copied ? '✓ 已复制' : '复制' }}</button>
        </header>
        <pre class="code"><code v-html="highlightedHtml"></code></pre>
      </div>
    </div>

    <p class="footnote">
      💡 这里展示的是 <code>chatbox/</code> 项目里的<b>真实源码</b>——克隆代码后跟着教程一边读一边对照本机文件。
    </p>
  </div>
</template>

<style scoped>
.proj-view {
  width: 55%;
  height: calc(100vh - var(--vt-nav-height, 64px) - var(--vt-banner-height, 0px));
  padding: 14px 18px;
  overflow-y: auto;
  background: #f8fafc;
  box-sizing: border-box;
}
.proj-view * { box-sizing: border-box; }
.proj-view code { font-size: 12px; padding: 1px 5px; border-radius: 3px; color: #c44323; background: #eef1f5; }

/* 健康检查 */
.health {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 6px; font-size: 13px;
  border: 1px solid; margin-bottom: 14px;
}
.health .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.health b { font-weight: 600; }
.health .hint { color: inherit; opacity: 0.7; font-size: 12px; }
.health .recheck {
  margin-left: auto; font-size: 12px; padding: 2px 8px;
  border-radius: 4px; border: 1px solid currentColor;
  background: transparent; color: inherit; cursor: pointer;
}
.health.checking { background: #f5f7fa; border-color: #d1d5db; color: #6b7280; }
.health.checking .dot { background: #9ca3af; }
.health.ok       { background: #ecfdf5; border-color: #34d399; color: #047857; }
.health.ok .dot  { background: #10b981; }
.health.down     { background: #fef2f2; border-color: #fca5a5; color: #b91c1c; }
.health.down .dot{ background: #ef4444; }

/* 浏览器外壳 */
.browser {
  border: 1px solid #e3e8ee;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.b-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px;
  background: #f5f7fa;
  border-bottom: 1px solid #e3e8ee;
}
.b-title {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 13px; font-weight: 600; color: #1858b0;
}
.b-meta { font-size: 11px; color: #94a3b8; }

/* tabs */
.tabs {
  display: flex; flex-wrap: wrap; gap: 2px;
  padding: 6px 8px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
  max-height: 110px;
  overflow-y: auto;
}
.tab {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  font-size: 11.5px;
  border: 1px solid transparent;
  background: transparent;
  color: #475569;
  border-radius: 4px;
  cursor: pointer;
  font-family: ui-monospace, SFMono-Regular, monospace;
  white-space: nowrap;
  transition: all 0.1s;
}
.tab:hover { background: #f1f5f9; color: #1e293b; }
.tab.active { background: #1e293b; color: #fff; border-color: #1e293b; }
.t-icon { font-size: 11px; }

/* code header */
.c-head {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 14px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11.5px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.c-head .path { flex: 1; color: #fff; font-weight: 500; }
.c-head .lang {
  padding: 1px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  font-size: 10.5px; text-transform: uppercase;
}
.c-head .lines { color: #94a3b8; }
.c-head .copy {
  padding: 2px 10px; font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px; cursor: pointer;
}
.c-head .copy:hover { background: rgba(255, 255, 255, 0.18); }

/* code body */
.code {
  margin: 0;
  padding: 14px 16px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", monospace;
  font-size: 12.5px;
  line-height: 1.7;
  max-height: calc(100vh - 280px);
  overflow: auto;
  white-space: pre;
  tab-size: 2;
}
.code code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
  display: block;
}

/* 高亮 */
.code :deep(.c)   { color: #64748b; font-style: italic; }
.code :deep(.s)   { color: #a5f3fc; }
.code :deep(.k)   { color: #f472b6; }
.code :deep(.kv)  { color: #c084fc; }
.code :deep(.kc)  { color: #fbbf24; }
.code :deep(.n)   { color: #fcd34d; }
.code :deep(.key) { color: #93c5fd; }

.footnote {
  margin: 14px 0 0;
  padding: 10px 14px;
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  border-radius: 0 4px 4px 0;
  font-size: 12px;
  color: #78350f;
  line-height: 1.7;
}
.footnote code {
  background: #fef3c7;
  color: #78350f;
  font-size: 11.5px;
}
</style>
