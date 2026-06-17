<script setup lang="ts">
// ====== 1. type 描述对象 ======
type Point = {
  x: number
  y: number
}
const origin: Point = { x: 0, y: 0 }
console.log('origin:', origin)

// ====== 2. 联合类型（type 独有）======
type Status = '成功' | '失败' | '加载中'
let status: Status = '加载中'
console.log('status:', status)
// status = '完成'   // ❌ Type '"完成"' is not assignable to type 'Status'

type ID = string | number
const id1: ID = 100
const id2: ID = 'user-001'
console.log('ids:', id1, id2)

// ====== 3. 函数类型别名 ======
type Callback = (data: string) => void
const log: Callback = (data) => console.log('收到:', data)
log('hello')

// ====== 4. 交叉类型 & ======
type HasName = { name: string }
type HasAge = { age: number }
type Person = HasName & HasAge

const p: Person = { name: '小明', age: 20 }   // 必须同时有 name 和 age
console.log('Person:', p)

// ====== 5. 实战：组件 props 拼接 ======
type WithLoading = { loading: boolean }
type UserCardProps = {
  name: string
  avatar: string
} & WithLoading

const card: UserCardProps = {
  name: '小红',
  avatar: 'https://example.com/avatar.png',
  loading: false
}
console.log('UserCardProps:', card)
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>type 别名 + 交叉类型</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>取消 <code>// status = '完成'</code> 看 TS 怎么报"不在允许的字面量里"。</p>
  </div>
</template>
