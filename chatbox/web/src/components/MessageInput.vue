<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  disabled: Boolean,
  placeholder: { type: String, default: '给 AI 发送消息...' }
})
const emit = defineEmits(['send'])

const text = ref('')
const textareaRef = ref(null)

async function autoresize() {
  await nextTick()
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

function submit() {
  const trimmed = text.value.trim()
  if (!trimmed || props.disabled) return
  emit('send', trimmed)
  text.value = ''
  autoresize()
}
</script>

<template>
  <div class="input-wrap" :class="{ disabled, focused: text.length }">
    <textarea
      ref="textareaRef"
      v-model="text"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="1"
      @keydown="onKeydown"
      @input="autoresize"
    ></textarea>

    <div class="actions">
      <span class="hint">Enter 发送 · Shift+Enter 换行</span>
      <button class="send" :disabled="!text.trim() || disabled" @click="submit">
        <svg v-if="!disabled" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="1.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-wrap {
  display: flex; flex-direction: column;
  padding: 10px 12px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: var(--shadow-sm);
}
.input-wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.input-wrap.disabled { opacity: 0.7; }

textarea {
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14.5px;
  line-height: 1.55;
  max-height: 200px;
  padding: 4px 4px;
  color: var(--text);
}
textarea::placeholder { color: var(--text-dim); }
textarea:disabled { cursor: not-allowed; }

.actions {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 4px;
}
.hint {
  font-size: 11px;
  color: var(--text-dim);
}
.send {
  width: 30px; height: 30px;
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, transform 0.12s;
}
.send:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
.send:disabled {
  background: var(--bg-muted);
  color: var(--text-dim);
  cursor: not-allowed;
}
</style>
