// =============================================================
//  config.js
//  教学项目所以配置写在文件里。真实项目应该走 .env + process.env
// =============================================================

module.exports = {
  PORT:       3002,
  JWT_SECRET: 'chatbox-teach-secret-please-change-in-prod',
  JWT_EXPIRES_IN: '7d'
}
