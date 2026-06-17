<script setup lang="ts">
// ====== 1. 联合类型 ======
let input: string | number
input = 'hello'
console.log('input =', input)
input = 42
console.log('input =', input)
// input = true   // ❌ 不能是 boolean

// ====== 2. 字面量联合类型 ======
type Direction = 'up' | 'down' | 'left' | 'right'
let dir: Direction = 'up'
console.log('dir =', dir)
// dir = 'forward'   // ❌ Type '"forward"' is not assignable to type 'Direction'

type ButtonType = 'primary' | 'success' | 'warning' | 'danger'
const btn: ButtonType = 'primary'
console.log('button type =', btn)

// ====== 3. 类型收窄 ======
function printValue(value: string | number): void {
  if (typeof value === 'string') {
    console.log('字符串大写:', value.toUpperCase())
  } else {
    console.log('数字保留 2 位:', value.toFixed(2))
  }
}
printValue('hello')
printValue(3.14159)

// ====== 4. 可辨识联合（API 响应处理）======
interface SuccessResult {
  status: 'success'
  data: { id: number; name: string }
}
interface ErrorResult {
  status: 'error'
  message: string
}
type ApiResult = SuccessResult | ErrorResult

function handle(res: ApiResult) {
  if (res.status === 'success') {
    console.log('✅ 成功，data =', res.data)
  } else {
    console.log('❌ 失败:', res.message)
  }
}

handle({ status: 'success', data: { id: 1, name: '小明' } })
handle({ status: 'error', message: '用户不存在' })
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>联合类型 + 类型收窄</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>取消 <code>// dir = 'forward'</code> 看字面量联合类型怎么拦下不允许的值。</p>
  </div>
</template>
