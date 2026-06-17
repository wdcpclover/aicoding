<script setup lang="ts">
// ====== 基础类型 ======
let username: string = '小明'
// username = 123        // ❌ 取消注释看报错: Type 'number' is not assignable to type 'string'

let age: number = 20
let price: number = 9.99

let isStudent: boolean = true

let fruits: string[] = ['苹果', '香蕉', '橘子']
let scores: number[] = [85, 92, 78]
// fruits.push(123)      // ❌ 数组只能放 string

let colors: Array<string> = ['红', '绿', '蓝']

// ====== 元组 ======
const item: [string, number] = ['手机壳', 29.9]
const point: [number, number] = [10, 20]

// ====== any（不推荐） ======
let anything: any = '随便什么'
anything = 123      // ✅ 不报错（因为是 any）
anything = true     // ✅

// ====== unknown（更安全的 any） ======
let data: unknown = '可能是任何东西'
if (typeof data === 'string') {
  console.log('data 经过类型守卫后是 string，可以用 .toUpperCase():', data.toUpperCase())
}

// ====== 类型推断 ======
let city = '北京'    // 自动推断为 string
let count = 0        // 自动推断为 number
// city = 100         // ❌ 推断出来的类型一样有效

console.log('username:', username)
console.log('age:', age, ' price:', price)
console.log('fruits:', fruits, ' colors:', colors)
console.log('item:', item, ' point:', point)
console.log('city:', city, ' count:', count)
console.log('anything (any):', anything)
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>基础类型 + 推断 + 元组 + any</h1>
    <p>看右下方 <b>console 面板</b> 的输出。</p>
    <p>取消任何一行 <code>// xxx</code> 的注释，<b>TS 立刻报错</b>。</p>
  </div>
</template>
