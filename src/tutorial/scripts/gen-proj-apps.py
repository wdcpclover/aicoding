#!/usr/bin/env python3
"""
gen-proj-apps.py —— 给 proj-step-1..8 全部生成同款代码浏览器 App
(template.html / composition.js / options.js / style.css)
内容相同；每个 step 通过 import './codes.js' 拿到自己的 FILES 数组
"""
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
STEPS_DIR = REPO / "vue3" / "src" / "tutorial" / "src"

TEMPLATE = r'''<div class="panel">
  <div class="health" :class="health.status">
    <span class="dot"></span>
    <b>{{ health.label }}</b>
    <span class="hint">{{ health.hint }}</span>
    <button class="recheck" @click="checkHealth">重新检查</button>
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
      <pre class="code"><code>{{ current.code }}</code></pre>
    </div>
  </div>

  <p class="footnote">
    💡 这里展示的是 <code>chatbox/</code> 项目里的**真实源码**——克隆代码后跟着教程一边读一边对照本机文件。
  </p>
</div>
'''

COMPOSITION = r'''import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { FILES } from './codes.js'

const CHATBOX_API = 'http://localhost:3002'

function iconFor(file) {
  if (file.lang === 'vue')  return '🟢'
  if (file.lang === 'json') return '📦'
  if (file.lang === 'html') return '📄'
  if (file.lang === 'css')  return '🎨'
  if (file.lang === 'env')  return '🌱'
  if (file.name.includes('routes/'))     return '🛣️'
  if (file.name.includes('middleware/')) return '🛡️'
  if (file.name.includes('llm/'))        return '🤖'
  if (file.name.includes('stores/'))     return '🗂️'
  if (file.name.includes('api/'))        return '📡'
  if (file.name.includes('router/'))     return '🗺️'
  return '📜'
}

export default {
  setup() {
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })
    const idx = ref(0)
    const copied = ref(false)

    const files = computed(() => FILES)
    const current = computed(() => FILES[idx.value])
    const lineCount = computed(() => current.value.code.split('\n').length)

    function icon(f) { return iconFor(f) }

    async function copy() {
      try {
        await navigator.clipboard.writeText(current.value.code)
        copied.value = true
        setTimeout(() => copied.value = false, 1500)
      } catch {}
    }

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${CHATBOX_API}/api/health`, { timeout: 2000 })
        health.value = {
          status: 'ok',
          label: 'Chatbox 后端在线',
          hint: `${CHATBOX_API} — 配合右边代码对着读`
        }
      } catch {
        health.value = {
          status: 'down',
          label: 'Chatbox 后端没启动',
          hint: 'cd chatbox/server && npm start（不启动不影响读代码）'
        }
      }
    }

    onMounted(checkHealth)

    return { health, idx, files, current, lineCount, copied, icon, copy, checkHealth }
  }
}
'''

OPTIONS = r'''import axios from 'axios'
import { FILES } from './codes.js'

const CHATBOX_API = 'http://localhost:3002'

function iconFor(file) {
  if (file.lang === 'vue')  return '🟢'
  if (file.lang === 'json') return '📦'
  if (file.lang === 'html') return '📄'
  if (file.lang === 'css')  return '🎨'
  if (file.lang === 'env')  return '🌱'
  if (file.name.includes('routes/'))     return '🛣️'
  if (file.name.includes('middleware/')) return '🛡️'
  if (file.name.includes('llm/'))        return '🤖'
  if (file.name.includes('stores/'))     return '🗂️'
  if (file.name.includes('api/'))        return '📡'
  if (file.name.includes('router/'))     return '🗺️'
  return '📜'
}

export default {
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      idx: 0,
      copied: false,
      files: FILES
    }
  },
  computed: {
    current() { return this.files[this.idx] },
    lineCount() { return this.current.code.split('\n').length }
  },
  mounted() {
    this.checkHealth()
  },
  methods: {
    icon(f) { return iconFor(f) },
    async copy() {
      try {
        await navigator.clipboard.writeText(this.current.code)
        this.copied = true
        setTimeout(() => this.copied = false, 1500)
      } catch {}
    },
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${CHATBOX_API}/api/health`, { timeout: 2000 })
        this.health = {
          status: 'ok',
          label: 'Chatbox 后端在线',
          hint: `${CHATBOX_API} — 配合右边代码对着读`
        }
      } catch {
        this.health = {
          status: 'down',
          label: 'Chatbox 后端没启动',
          hint: 'cd chatbox/server && npm start（不启动不影响读代码）'
        }
      }
    }
  }
}
'''

STYLE = r'''.panel {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 16px;
  max-width: 920px;
}
.panel code { font-size: 12px; background: #eef1f5; padding: 1px 5px; border-radius: 3px; color: #c44323; }

/* —— 健康检查条 —— */
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

/* —— 代码浏览器 —— */
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
  font-size: 13px;
  font-weight: 600;
  color: #1858b0;
}
.b-meta { font-size: 11px; color: #94a3b8; }

/* tabs */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 8px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
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
.tab:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.tab.active {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
}
.t-icon { font-size: 11px; }

/* code area */
.c-head {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 14px;
  background: #1e293b;
  color: #cbd5e1;
  font-size: 11.5px;
  font-family: ui-monospace, SFMono-Regular, monospace;
}
.c-head .path {
  flex: 1;
  color: #fff;
  font-weight: 500;
}
.c-head .lang {
  padding: 1px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  font-size: 10.5px;
  text-transform: uppercase;
}
.c-head .lines { color: #94a3b8; }
.c-head .copy {
  padding: 2px 10px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}
.c-head .copy:hover { background: rgba(255, 255, 255, 0.18); }

.code {
  margin: 0;
  padding: 14px 16px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", monospace;
  font-size: 12px;
  line-height: 1.65;
  max-height: 560px;
  overflow: auto;
  white-space: pre;
  tab-size: 2;
}
.code code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}

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
'''

IMPORT_MAP = '''{
  "imports": {
    "axios": "https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm"
  }
}
'''


def main():
    for step in range(1, 9):
        step_dir = STEPS_DIR / f"proj-step-{step}"
        app_dir = step_dir / "App"
        app_dir.mkdir(parents=True, exist_ok=True)

        (app_dir / "template.html").write_text(TEMPLATE, encoding="utf-8")
        (app_dir / "composition.js").write_text(COMPOSITION, encoding="utf-8")
        (app_dir / "options.js").write_text(OPTIONS, encoding="utf-8")
        (app_dir / "style.css").write_text(STYLE, encoding="utf-8")
        (step_dir / "import-map.json").write_text(IMPORT_MAP, encoding="utf-8")

        print(f"✓ wrote proj-step-{step}/App/*")


if __name__ == "__main__":
    main()
