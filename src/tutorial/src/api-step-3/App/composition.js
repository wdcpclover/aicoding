import { ref, onMounted } from 'vue'
import axios from 'axios'

const BASE = 'http://localhost:3001'
const FAKE_DOWN = 'http://localhost:39999'   // 故意不存在的端口

function pretty(v) {
  if (v == null) return ''
  return JSON.stringify(v, null, 2)
}

// 把 err 拆成"解剖图"
function dissect(err, scenarioLabel, scenarioDiag) {
  const hasResponse = !!err.response
  const hasRequest  = !!err.request

  let shape, shapeLabel, diagnosis
  if (hasResponse) {
    shape = 'shape-response'
    shapeLabel = '① 服务器给了错误响应'
    diagnosis = `${scenarioDiag} ${err.response.data?.message || ''}`
  } else if (hasRequest) {
    shape = 'shape-request'
    shapeLabel = '② 请求发出去但没收到响应'
    diagnosis = scenarioDiag
  } else {
    shape = 'shape-config'
    shapeLabel = '③ 配置错误'
    diagnosis = scenarioDiag
  }

  return {
    shape,
    shapeLabel,
    response: hasResponse
      ? pretty({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        })
      : '',
    hasRequest,
    message: err.message,
    code:    err.code,
    url:     (err.config?.baseURL || '') + (err.config?.url || ''),
    diagnosis: diagnosis
  }
}

export default {
  setup() {
    const health = ref({ status: 'checking', label: '检查后端中...', hint: '' })
    const loading = ref(false)
    const errorMsg = ref(null)
    const users = ref([])             // 演示三态时用
    const errSnapshot = ref(null)

    async function checkHealth() {
      health.value = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        health.value = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        health.value = {
          status: 'down',
          label: '后端没启动',
          hint: 'cd server && npm start'
        }
      }
    }

    // —— 通用三态模板 ——
    async function run(url, scenario) {
      loading.value = true
      errorMsg.value = null
      errSnapshot.value = null
      users.value = []
      try {
        const res = await axios.get(url, { timeout: 3000 })
        users.value = res.data
      } catch (err) {
        errSnapshot.value = dissect(err, scenario.label, scenario.diagnosis)
        if (err.response) {
          errorMsg.value = err.response.data?.message
                        || `HTTP ${err.response.status}`
        } else if (err.request) {
          errorMsg.value = '网络错误：后端没启动或被防火墙拦了'
        } else {
          errorMsg.value = `请求配置错误：${err.message}`
        }
      } finally {
        loading.value = false
      }
    }

    function trigger404() {
      run(`${BASE}/api/users/999`, {
        label: '404',
        diagnosis: '请求送到了后端，后端说"找不到 999 号用户" —— 处理逻辑：用 err.response.data.message 显示给用户。'
      })
    }

    function trigger500() {
      run(`${BASE}/api/users?_error=1`, {
        label: '500',
        diagnosis: '请求送到了后端，但后端代码崩了/主动抛错 —— 处理逻辑：提示"系统繁忙"，自己看后端日志。'
      })
    }

    function triggerNetErr() {
      // 切到不存在的端口 → 浏览器直接连不上
      run(`${FAKE_DOWN}/api/users`, {
        label: 'NET',
        diagnosis: '请求都没到达后端 —— 后端没启动 / 网线断了 / CORS 拦截。err.response 是 undefined，但 err.request 有值。'
      })
    }

    onMounted(checkHealth)

    return {
      health, loading, errorMsg, users, errSnapshot,
      checkHealth, trigger404, trigger500, triggerNetErr
    }
  }
}
