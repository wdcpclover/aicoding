<script setup lang="ts">
import { Repl, useStore, useVueImportMap } from '@vue/repl'
import CodeMirror from '@vue/repl/codemirror-editor'
import { inject, watch, Ref, ref, computed, nextTick } from 'vue'
import { data } from './tutorial.data'
import {
  resolveSFCExample,
  resolveNoBuildExample,
  onHashChange
} from '../examples/utils'
import ProjCodeView from './ProjCodeView.vue'
import PreferenceSwitch from '@theme/components/PreferenceSwitch.vue'
import {
  VTFlyout,
  VTIconChevronLeft,
  VTIconChevronRight,
  VTLink
} from '@vue/theme'

const { vueVersion, defaultVersion, importMap } = useVueImportMap({
  runtimeDev: () =>
    `https://unpkg.com/vue@${
      vueVersion.value || defaultVersion
    }/dist/vue.esm-browser.js`
})
const store = useStore({
  builtinImportMap: importMap
})

const instruction = ref<HTMLElement>()

const preferComposition = inject('prefer-composition') as Ref<boolean>
const preferSFC = inject('prefer-sfc') as Ref<boolean>

// 篇序：JS → TS → Vue → 路由 → Pinia → 前后端 → 项目实战（学生学习路径）
// review 篇单列在最后，是考前复习的整合演练，不算正式学习路径
const TRACKS = [
  { id: 'js', label: 'JavaScript 篇' },
  { id: 'ts', label: 'TypeScript 篇' },
  { id: 'vue', label: 'Vue 篇' },
  { id: 'router', label: '路由篇' },
  { id: 'pinia', label: 'Pinia 篇' },
  { id: 'api', label: '前后端篇' },
  { id: 'proj', label: '项目实战篇（Chatbox）' },
  { id: 'review', label: '考前复习篇' }
] as const
type TrackId = typeof TRACKS[number]['id']

const STEP_RE = /^(js|ts|vue|router|pinia|api|proj|review)-step-(\d+)$/

function parseStep(key: string): { track: TrackId; num: number } | null {
  const m = key.match(STEP_RE)
  if (!m) return null
  return { track: m[1] as TrackId, num: Number(m[2]) }
}

const currentStep = ref('')
const keys = Object.keys(data)
  .filter(k => parseStep(k) && data[k]['description.md'])
  .sort((a, b) => {
    const pa = parseStep(a)!, pb = parseStep(b)!
    const ta = TRACKS.findIndex(t => t.id === pa.track)
    const tb = TRACKS.findIndex(t => t.id === pb.track)
    return ta - tb || pa.num - pb.num
  })
const titleRE = /<h1.*?>(.+?)<a class="header-anchor/

const currentParsed = computed(() => parseStep(currentStep.value))

// 只展示当前篇的步骤；切换篇时菜单整个换一批
const allSteps = computed(() => {
  const currentTrack = currentParsed.value?.track
  if (!currentTrack) return []
  const trackLabel = TRACKS.find(t => t.id === currentTrack)?.label
  return keys
    .filter(k => parseStep(k)!.track === currentTrack)
    .map((key, i) => {
      const desc = data[key]['description.md'] as string
      const parsed = parseStep(key)!
      return {
        text: `${parsed.num}. ${desc.match(titleRE)![1]}`,
        link: `#${key}`,
        groupLabel: i === 0 ? trackLabel : undefined,
        track: parsed.track
      }
    })
})

const currentDescription = computed(() => {
  return data[currentStep.value]?.['description.md']
})

// 每篇从 1 开始独立编号，顶部计数器也按本篇 track 显示
const totalSteps = computed(() => {
  const p = currentParsed.value
  if (!p) return keys.length
  return keys.filter(k => parseStep(k)!.track === p.track).length
})

const currentStepIndex = computed(() => currentParsed.value?.num ?? 0)

const isVueLikeStep = computed(() => {
  const t = currentParsed.value?.track
  return t === 'vue' || t === 'router' || t === 'pinia' || t === 'api'
})

const prevStep = computed(() => {
  const p = currentParsed.value
  if (!p) return
  const candidate = `${p.track}-step-${p.num - 1}`
  if (data.hasOwnProperty(candidate)) return candidate
})

const nextStep = computed(() => {
  const p = currentParsed.value
  if (!p) return
  const candidate = `${p.track}-step-${p.num + 1}`
  if (data.hasOwnProperty(candidate)) return candidate
})

// 老链接 #step-N 兼容：1-16 → vue-step-N，17-22 → router-step-{N-16}
function migrateLegacyHash(hash: string): string | undefined {
  const m = hash.match(/^step-(\d+)$/)
  if (!m) return
  const n = Number(m[1])
  if (n >= 1 && n <= 16) return `vue-step-${n}`
  if (n >= 17 && n <= 22) return `router-step-${n - 16}`
}

// JS / TS 篇：把 step 文件夹里的文本文件原样交给 REPL，跳过 Vue 解析
function resolveRawExample(raw: any): Record<string, string> {
  const files: Record<string, string> = {}
  for (const k in raw) {
    if (k === 'description.md' || k === 'description.txt' || k === '_hint') continue
    if (typeof raw[k] === 'string') files[k] = raw[k]
  }
  return files
}

function pickMainFile(track: TrackId, files: Record<string, string>): string {
  if (track === 'ts' && files['App.vue']) return 'App.vue'
  if (files['index.html']) return 'index.html'
  return Object.keys(files)[0]
}

function updateExample(scroll = false) {
  let hash = location.hash.slice(1)

  const migrated = migrateLegacyHash(hash)
  if (migrated) {
    location.replace(`/tutorial/#${migrated}`)
    hash = migrated
  }

  if (!data.hasOwnProperty(hash)) {
    hash = keys[0] || 'vue-step-1'
    location.replace(`/tutorial/#${hash}`)
  }
  currentStep.value = hash

  const parsed = parseStep(hash)!
  if (parsed.track === 'proj') {
    // proj 篇不走 vue/repl，靠下方独立组件读 codes.json 渲染
  } else if (parsed.track === 'review') {
    // 复习篇：考题强制组合式 API + SFC，固定按「组合式 + 单文件组件」渲染，不受全站偏好开关影响
    store.setFiles(resolveSFCExample(data[hash], true), 'App.vue')
  } else if (parsed.track === 'vue' || parsed.track === 'router' || parsed.track === 'pinia' || parsed.track === 'api') {
    store.setFiles(
      preferSFC.value
        ? resolveSFCExample(data[hash], preferComposition.value)
        : resolveNoBuildExample(data[hash], preferComposition.value),
      preferSFC.value ? 'App.vue' : 'index.html'
    )
  } else {
    const files = resolveRawExample(data[hash])
    store.setFiles(files, pickMainFile(parsed.track, files))
  }

  if (scroll) {
    nextTick(() => {
      instruction.value!.scrollTop = 0
    })
  }
}

watch([preferComposition, preferSFC], () => updateExample())

onHashChange(() => {
  updateExample(true)
})

updateExample()
</script>

<template>
  <section class="tutorial">
    <article class="instruction" ref="instruction">
      <PreferenceSwitch v-if="isVueLikeStep" />
      <VTFlyout :button="`${currentStepIndex} / ${totalSteps}`">
        <template v-for="(step, i) of allSteps" :key="step.link">
          <div v-if="step.groupLabel" class="vt-menu-group-label">{{ step.groupLabel }}</div>
          <VTLink
            class="vt-menu-link"
            :class="{ active: i + 1 === currentStepIndex }"
            :href="step.link"
            >{{ step.text }}</VTLink
          >
        </template>
      </VTFlyout>
      <div class="vt-doc" v-html="currentDescription"></div>
      <footer>
        <a v-if="prevStep" :href="`#${prevStep}`"
          ><VTIconChevronLeft class="vt-link-icon" style="margin: 0" />
          Prev</a
        >
        <a class="next-step" v-if="nextStep" :href="`#${nextStep}`"
          >Next <VTIconChevronRight class="vt-link-icon"
        /></a>
      </footer>
    </article>
    <ProjCodeView
      v-if="currentParsed?.track === 'proj'"
      :codes-json="(data[currentStep]?.['codes.json'] as string) || '[]'"
    />
    <Repl
      v-else
      layout="vertical"
      :editor="CodeMirror"
      :store="store"
      :showCompileOutput="false"
      :clearConsole="false"
      :showImportMap="false"
    />
  </section>
</template>

<style scoped>
.tutorial {
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  --height: calc(
    100vh - var(--vt-nav-height) - var(--vt-banner-height, 0px)
  );
}

.preference-switch {
  position: relative;
}

.instruction {
  width: 45%;
  height: var(--height);
  padding: 0 32px 24px;
  border-right: 1px solid var(--vt-c-divider-light);
  font-size: 15px;
  overflow-y: auto;
  position: relative;
  --vt-nav-height: 40px;
}

.vue-repl {
  width: 55%;
  height: var(--height);
}

.vt-flyout {
  z-index: 9;
  position: absolute;
  right: 20px;
}

.vt-menu-group-label {
  padding: 6px 20px 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vt-c-text-2);
  border-top: 1px solid var(--vt-c-divider-light);
  margin-top: 4px;
}

.vt-menu-group-label:first-child {
  border-top: none;
  margin-top: 0;
}

.vt-menu-link.active {
  font-weight: 500;
  color: var(--vt-c-brand);
}

footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--vt-c-divider);
  margin-top: 1.5em;
  padding-top: 1em;
}

footer a {
  font-weight: 500;
  color: var(--vt-c-brand);
}

.next-step {
  margin-left: auto;
}

.vt-doc :deep(h1) {
  font-size: 1.4em;
  margin: 1em 0;
}

.vt-doc :deep(h2) {
  font-size: 1.1em;
  margin: 1.2em 0 0.5em;
  padding: 0;
  border-top: none;
}

.vt-doc :deep(.header-anchor) {
  display: none;
}

.vt-doc :deep(summary) {
  cursor: pointer;
}

@media (min-width: 1377px) {
  .vue-repl {
    border-right: 1px solid var(--vt-c-divider-light);
  }
}

@media (min-width: 1441px) {
  .tutorial {
    padding-right: 32px;
  }
}

:deep(.narrow) {
  display: none;
}

@media (max-width: 720px) {
  .tutorial {
    display: block;
  }
  .instruction {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--vt-c-divider-light);
    height: 30vh;
    padding: 0 24px 24px;
  }
  .vue-repl {
    width: 100%;
    height: calc(
      70vh - var(--vt-nav-height) - var(--vt-banner-height, 0px)
    );
  }
  :deep(.wide) {
    display: none;
  }
  :deep(.narrow) {
    display: inline;
  }
}
</style>
