<script setup lang="ts">
// ====== 1. readonly：只读属性 ======
interface Config {
  readonly appName: string
  version: string
}
const config: Config = { appName: 'MyApp', version: '1.0' }
config.version = '1.1'           // ✅
// config.appName = 'Other'       // ❌ Cannot assign to 'appName' because it is a read-only property
console.log('config:', config)

// ====== 2. Record：键值对 ======
type ScoreMap = Record<string, number>
const scores: ScoreMap = {
  '数学': 95,
  '英语': 88,
  '物理': 92
}
console.log('scores:', scores)

// ====== 3. Pick / Omit ======
interface User {
  id: number
  name: string
  email: string
  password: string
}
type UserPreview = Pick<User, 'id' | 'name'>
type SafeUser = Omit<User, 'password'>

const preview: UserPreview = { id: 1, name: '小明' }
const safe: SafeUser = { id: 1, name: '小明', email: 'xm@example.com' }
console.log('Pick<User,"id"|"name">  →', preview)
console.log('Omit<User,"password">   →', safe)

// ====== 4. Partial：全部变可选（更新数据用）======
type UserUpdate = Partial<User>
const updates: UserUpdate = { name: '新名字' }
console.log('Partial<User> 只更新 name:', updates)

// ====== 5. enum ======
enum OrderStatus {
  Pending = '待付款',
  Paid = '已付款',
  Shipped = '已发货',
  Delivered = '已收货'
}
const status: OrderStatus = OrderStatus.Pending
console.log('OrderStatus.Pending =', status)

// ====== 6. typeof：从对象推导类型 ======
const defaultConfig = {
  theme: 'dark',
  fontSize: 14,
  language: 'zh-CN'
}
type AppConfig = typeof defaultConfig
const cfg: AppConfig = { theme: 'light', fontSize: 16, language: 'en-US' }
console.log('typeof defaultConfig 推出的 AppConfig:', cfg)

// ====== 7. as const + typeof ======
const STATUS_OPTIONS = [
  { value: 'active',   label: '启用' },
  { value: 'inactive', label: '停用' }
] as const

type StatusValue = typeof STATUS_OPTIONS[number]['value']
//                → 'active' | 'inactive'
const v: StatusValue = 'active'
console.log('STATUS_OPTIONS[0].value 的字面量类型:', v)
console.log('全部选项:', STATUS_OPTIONS)

// ↓ 取消注释看 TS 立刻报错
// const wrong: StatusValue = 'banned'   // ❌ 不在 'active' | 'inactive' 里
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>实战类型工具</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>试试取消 <code>// const wrong: StatusValue = 'banned'</code>，看 <b>as const + typeof</b> 怎么把字符串数组变成精确的字面量类型。</p>
  </div>
</template>
