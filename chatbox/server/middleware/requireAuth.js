// =============================================================
//  middleware/requireAuth.js
//  从 Authorization: Bearer <token> 解出 user，挂到 req.user
//  失败 → 401
// =============================================================

const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) {
    return res.status(401).json({ message: '未登录' })
  }
  try {
    const payload = jwt.verify(m[1], JWT_SECRET)
    req.user = { id: payload.uid, username: payload.username }
    next()
  } catch (e) {
    return res.status(401).json({ message: 'token 无效或已过期' })
  }
}
