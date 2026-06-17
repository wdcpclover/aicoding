<script setup lang="ts">
// ====== 1. 泛型函数 ======
function identity<T>(value: T): T {
  return value
}

const s = identity('hello')   // 推断为 string
const n = identity(42)        // 推断为 number
const arr = identity<number[]>([1, 2, 3])
console.log('identity("hello") =', s, '   typeof:', typeof s)
console.log('identity(42)      =', n, '   typeof:', typeof n)
console.log('identity([1,2,3]) =', arr, ' length:', arr.length)

// ====== 2. 对比 any（失去类型信息）======
function identityAny(value: any): any {
  return value
}
const bad = identityAny('hello')
// bad 是 any，下面这样写不会报错也不会有提示：
console.log('any 版本: bad.length =', bad.length, '（TS 不知道 bad 是 string）')

// ====== 3. 泛型接口 ======
interface ApiResult<T> {
  code: number
  message: string
  data: T
}

interface User { id: number; name: string }
interface Product { id: number; title: string; price: number }

const userRes: ApiResult<User> = {
  code: 200, message: '成功',
  data: { id: 1, name: '小明' }
}

const productRes: ApiResult<Product> = {
  code: 200, message: '成功',
  data: { id: 1, title: '手机壳', price: 29.9 }
}

console.log('userRes.data.name      =', userRes.data.name)
console.log('productRes.data.price  =', productRes.data.price)

// ====== 4. 泛型函数：返回数组的第一个元素 ======
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}
console.log('first(["a","b"])  =', first(['a', 'b']))
console.log('first([10,20,30]) =', first([10, 20, 30]))
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>泛型入门</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>把 <code>const n = identity(42)</code> 改成 <code>const n: string = identity(42)</code>，看 TS 怎么提示「不能把 number 赋给 string」。</p>
  </div>
</template>
