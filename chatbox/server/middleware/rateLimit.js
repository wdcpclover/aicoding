// =============================================================
//  middleware/rateLimit.js
//  教学项目级别的限流：防爬虫、防爆破登录
//  生产环境建议接 Redis（这里用内存版方便教学）
// =============================================================

const rateLimit = require('express-rate-limit')

// 全局：每个 IP 每分钟最多 100 次请求
// （刷消息很正常，单值给宽松点；攻击者刷出量级会被拦）
exports.globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '请求过于频繁，请稍后再试' }
})

// 登录/注册：每个 IP 每 5 分钟最多 20 次
// 防的是「拿字典爆破密码」「批量注册」
exports.authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '登录尝试过多，请 5 分钟后再试' }
})

// 发消息：每个用户每分钟最多 30 条
// 防的是「拿一个账号疯狂调 LLM 烧钱」「机器人灌水」
// 这里按 user.id 而不是 IP 分组（要求 requireAuth 在前面跑过）
exports.messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
  message: { message: '发送过于频繁，请稍等' }
})
