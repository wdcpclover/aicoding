<script setup lang="ts">
// ====== 参数和返回值类型 ======
function greet(name: string): string {
  return `你好，${name}！`
}
console.log(greet('小明'))
// console.log(greet(123))   // ❌ Argument of type 'number' is not assignable to parameter of type 'string'

// ====== 箭头函数 ======
const add = (a: number, b: number): number => a + b
console.log('add(3, 5) =', add(3, 5))

// ====== 返回值推断（推荐：省略返回值类型）======
const multiply = (a: number, b: number) => a * b   // 返回 number
const hello = (name: string) => `你好，${name}`    // 返回 string
console.log('multiply:', multiply(4, 5))
console.log('hello:', hello('小红'))

// ====== void：没返回值 ======
function sayHello(name: string): void {
  console.log(`Hello, ${name}`)
}
sayHello('小刚')

// ====== 可选参数 ======
function introduce(name: string, age?: number): string {
  if (age !== undefined) return `我叫${name}，今年${age}岁`
  return `我叫${name}`
}
console.log(introduce('小明'))
console.log(introduce('小明', 20))

// ====== 默认参数 ======
function createUser(name: string, role: string = '学生'): string {
  return `${name}（${role}）`
}
console.log(createUser('小红'))
console.log(createUser('张老师', '教师'))

// ====== 类型断言 as ======
interface User { name: string; age: number }
const data = JSON.parse('{"name":"小明","age":20}') as User
console.log('JSON 解析后断言为 User:', data.name, data.age)
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>函数类型 + 类型断言</h1>
    <p>看右下方 <b>console</b>。</p>
    <p>取消 <code>// console.log(greet(123))</code> 看 TS 怎么拦下错误参数。</p>
  </div>
</template>
