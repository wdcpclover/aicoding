import { ref, computed } from 'vue'

// 一张「假后端」的路由表（只看结构，不真正执行）
const routes = [
  { method: 'POST', pattern: '/api/login' },
  { method: 'GET',  pattern: '/api/products' },
  { method: 'GET',  pattern: '/api/products/:id' },
  { method: 'POST', pattern: '/api/products/:id/register' },
  { method: 'GET',  pattern: '/api/my-products' }
]

// 把 '/api/products/:id' 编译成正则 + 参数名列表
function compile(pattern) {
  const keys = []
  const re = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, k) => {
    keys.push(k)
    return '([^/]+)'
  }) + '$')
  return { re, keys }
}

export default {
  setup() {
    const method = ref('GET')
    const url = ref('/api/products/2?keyword=book')
    const bodyText = ref('{\n  "phone": "13800138000",\n  "password": "123456"\n}')

    const result = computed(() => {
      // 拆出 pathname 和 query
      const [pathname, queryStr = ''] = url.value.trim().split('?')
      const query = {}
      if (queryStr) {
        for (const pair of queryStr.split('&')) {
          const [k, v = ''] = pair.split('=')
          if (k) query[decodeURIComponent(k)] = decodeURIComponent(v)
        }
      }

      // 逐条匹配方法 + 路径
      for (const r of routes) {
        if (r.method !== method.value) continue
        const { re, keys } = compile(r.pattern)
        const m = pathname.match(re)
        if (m) {
          const params = {}
          keys.forEach((k, i) => (params[k] = m[i + 1]))

          // POST 才有 body
          let body = {}
          let bodyErr = ''
          if (method.value === 'POST') {
            try { body = bodyText.value.trim() ? JSON.parse(bodyText.value) : {} }
            catch { bodyErr = 'JSON 格式错误' }
          }

          return {
            matched: `${r.method} ${r.pattern}`,
            params, query, body, bodyErr, status: 200
          }
        }
      }
      return { matched: null, status: 404 }
    })

    return { method, url, bodyText, routes, result }
  }
}
