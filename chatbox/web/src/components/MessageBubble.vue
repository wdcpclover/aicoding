<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  role: { type: String, required: true },
  content: { type: String, required: true }
})

marked.setOptions({ breaks: true, gfm: true })

const html = computed(() => {
  if (props.role === 'user') return ''
  return marked.parse(props.content || '')
})
</script>

<template>
  <div class="row" :class="role">
    <div class="bubble">
      <div class="avatar" :class="role">
        <template v-if="role === 'user'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </template>
        <template v-else>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="3"/>
            <path d="M8 2v4M16 2v4"/>
            <circle cx="9" cy="13" r="1.2" fill="currentColor"/>
            <circle cx="15" cy="13" r="1.2" fill="currentColor"/>
          </svg>
        </template>
      </div>
      <div class="content">
        <div v-if="role === 'assistant'" class="markdown" v-html="html"></div>
        <div v-else class="plain">{{ content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  max-width: 760px;
  margin: 0 auto 18px;
  padding: 0 24px;
  display: flex;
}
.row.user { justify-content: flex-end; }

.bubble {
  display: flex;
  gap: 10px;
  max-width: 88%;
}
.row.user .bubble { flex-direction: row-reverse; }

.avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.avatar.user {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: #fff;
}
.avatar.assistant {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.content {
  padding: 11px 14px;
  border-radius: 14px;
  line-height: 1.65;
  font-size: 14px;
  word-break: break-word;
}
.row.user .content {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.row.assistant .content {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  color: var(--text);
}

.plain { white-space: pre-wrap; }

/* —— Markdown 内部样式 —— */
.markdown :deep(p) { margin: 0 0 8px; }
.markdown :deep(p:last-child) { margin-bottom: 0; }
.markdown :deep(ul),
.markdown :deep(ol) { margin: 8px 0; padding-left: 22px; }
.markdown :deep(li) { margin-bottom: 4px; }
.markdown :deep(li > p) { margin-bottom: 0; }
.markdown :deep(code) {
  background: var(--bg-subtle);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12.5px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #be123c;
}
.markdown :deep(pre) {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 10px 0;
  font-size: 12.5px;
  line-height: 1.6;
}
.markdown :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}
.markdown :deep(blockquote) {
  margin: 8px 0;
  padding: 4px 12px;
  border-left: 3px solid var(--border-strong);
  color: var(--text-muted);
  background: var(--bg-subtle);
  border-radius: 0 4px 4px 0;
}
.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3) {
  margin: 14px 0 8px;
  font-weight: 600;
  line-height: 1.35;
}
.markdown :deep(h1) { font-size: 17px; }
.markdown :deep(h2) { font-size: 15.5px; }
.markdown :deep(h3) { font-size: 14.5px; }
.markdown :deep(a) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.markdown :deep(strong) { font-weight: 600; color: var(--text); }
.markdown :deep(table) {
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 13px;
  width: 100%;
}
.markdown :deep(th),
.markdown :deep(td) {
  border: 1px solid var(--border);
  padding: 6px 10px;
}
.markdown :deep(th) { background: var(--bg-subtle); }
.markdown :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 14px 0;
}
</style>
