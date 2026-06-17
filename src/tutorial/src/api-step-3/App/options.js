import axios from 'axios'

const BASE = 'http://localhost:3001'
const FAKE_DOWN = 'http://localhost:39999'

function pretty(v) {
  if (v == null) return ''
  return JSON.stringify(v, null, 2)
}

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
  data() {
    return {
      health: { status: 'checking', label: '检查后端中...', hint: '' },
      loading: false,
      errorMsg: null,
      users: [],
      errSnapshot: null
    }
  },
  mounted() {
    this.checkHealth()
  },
  methods: {
    async checkHealth() {
      this.health = { status: 'checking', label: '检查后端中...', hint: '' }
      try {
        await axios.get(`${BASE}/api/health`, { timeout: 2000 })
        this.health = { status: 'ok', label: '后端在线', hint: BASE }
      } catch {
        this.health = {
          status: 'down',
          label: '后端没启动',
          hint: 'cd server && npm start'
        }
      }
    },
    async run(url, scenario) {
      this.loading = true
      this.errorMsg = null
      this.errSnapshot = null
      this.users = []
      try {
        const res = await axios.get(url, { timeout: 3000 })
        this.users = res.data
      } catch (err) {
        this.errSnapshot = dissect(err, scenario.label, scenario.diagnosis)
        if (err.response) {
          this.errorMsg = err.response.data?.message
                       || `HTTP ${err.response.status}`
        } else if (err.request) {
          this.errorMsg = '网络错误：后端没启动或被防火墙拦了'
        } else {
          this.errorMsg = `请求配置错误：${err.message}`
        }
      } finally {
        this.loading = false
      }
    },
    trigger404() {
      this.run(`${BASE}/api/users/999`, {
        label: '404',
        diagnosis: '请求送到了后端，后端说"找不到 999 号用户" —— 处理逻辑：用 err.response.data.message 显示给用户。'
      })
    },
    trigger500() {
      this.run(`${BASE}/api/users?_error=1`, {
        label: '500',
        diagnosis: '请求送到了后端，但后端代码崩了/主动抛错 —— 处理逻辑：提示"系统繁忙"，自己看后端日志。'
      })
    },
    triggerNetErr() {
      this.run(`${FAKE_DOWN}/api/users`, {
        label: 'NET',
        diagnosis: '请求都没到达后端 —— 后端没启动 / 网线断了 / CORS 拦截。err.response 是 undefined，但 err.request 有值。'
      })
    }
  }
}
