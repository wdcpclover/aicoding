// mockServer.js —— 用 axios 的「自定义 adapter」假装一个后端，让 demo 在 REPL 里离线就能跑。
// ⚠️ 这不是考试要写的东西！真实考试你要写真正的 Express（server/index.js）。
//    本文件只是替身：把 request.js 里的 `adapter: mockAdapter` 删掉，请求就会真的发到 baseURL。

// 假数据（相当于 MySQL 里的几张表）
const activities = [
  { id: 1, title: '校园歌手大赛',   location: '大学生活动中心',   start_time: '2025-05-20 18:30', end_time: '2025-05-20 21:30', participants: 120,
    description: '展示你的才华，赢取丰厚奖品！本次比赛面向全校学生，不限专业。', organizer: '校团委学生会', contact: '李老师 (138****5678)' },
  { id: 2, title: '编程马拉松',     location: '计算机学院实验室', start_time: '2025-05-25 09:00', end_time: '2025-05-26 09:00', participants: 50,
    description: '24 小时连续编程挑战，组队参赛，导师全程指导。',           organizer: '计算机学院',   contact: '王老师 (139****1234)' },
  { id: 3, title: '求职简历工作坊', location: '就业指导中心',     start_time: '2025-05-30 14:00', end_time: '2025-05-30 16:00', participants: 80,
    description: 'HR 手把手教你写出能过初筛的简历，现场修改。',             organizer: '就业指导中心', contact: '张老师 (137****9999)' }
]
let myActivities = []
let registerSeq = 300

const ok = (data, message = '操作成功') => ({ code: 200, data, message })
const res = (payload, config) => ({ data: payload, status: 200, statusText: 'OK', headers: {}, config })

// adapter 的签名：(config) => Promise<响应对象>
export function mockAdapter(config) {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const headers = config.headers || {}
  const body = config.data ? JSON.parse(config.data) : {}
  // axios 1.x 的 headers 是 AxiosHeaders 实例，用 get 取最稳妥；兼容普通对象
  const token =
    (typeof headers.get === 'function' && (headers.get('Token') || headers.get('Auth-Token'))) ||
    headers.Token || headers.token || headers['Auth-Token']

  return new Promise(resolve => {
    setTimeout(() => {
      // ① 登录：唯一不需要 token 的接口
      if (url === '/login' && method === 'post') {
        if (!body.student_id || !body.password) {
          return resolve(res({ code: 400, data: null, message: '学号和密码不能为空' }, config))
        }
        return resolve(res(ok(
          { token: 'zzu123456', user: { id: 1001, student_id: body.student_id, name: '张三' } },
          '登录成功'
        ), config))
      }

      // ② 其余接口都要校验 Header 里的 Token（演示「请求拦截器自动带 token」）
      if (token !== 'zzu123456') {
        return resolve(res({ code: 401, data: null, message: '未登录或 token 失效，请重新登录' }, config))
      }

      const detail = url.match(/^\/activities\/(\d+)$/)
      const register = url.match(/^\/activities\/(\d+)\/register$/)

      if (url === '/activities' && method === 'get') {
        const kw = (config.params && config.params.keyword) || ''
        const list = activities
          .filter(a => a.title.includes(kw))
          .map(({ id, title, location, start_time, end_time, participants }) =>
            ({ id, title, location, start_time, end_time, participants }))
        return resolve(res(ok(list, '获取成功'), config))
      }
      if (detail && method === 'get') {
        const a = activities.find(x => x.id === Number(detail[1]))
        return resolve(res(
          a ? ok({ ...a, is_registered: myActivities.some(m => m.id === a.id) }, '获取成功')
            : { code: 404, data: null, message: '活动不存在' },
          config
        ))
      }
      if (register && method === 'post') {
        const a = activities.find(x => x.id === Number(register[1]))
        if (a && !myActivities.some(m => m.id === a.id)) {
          myActivities.push({ id: a.id, title: a.title, location: a.location, start_time: a.start_time, register_time: '2025-05-18 14:30' })
        }
        return resolve(res(ok({ register_id: registerSeq++, register_time: '2025-05-18 14:30' }, '报名成功'), config))
      }
      if (url === '/my-activities' && method === 'get') {
        return resolve(res(ok(myActivities, '获取成功'), config))
      }

      resolve(res({ code: 404, data: null, message: `接口不存在: ${method.toUpperCase()} ${url}` }, config))
    }, 300)
  })
}
