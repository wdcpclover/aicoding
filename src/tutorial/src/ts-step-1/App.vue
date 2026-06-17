<script setup lang="ts">
// ====== 没类型的 JS 写法：什么都能传 ======
function add_js(a: any, b: any): any {
  return a + b
}
console.log('add_js(1, 2)         =', add_js(1, 2))
console.log("add_js('1', '2')     =", add_js('1', '2'), '← JS 不报错，但变成字符串拼接了！')

// ====== TS 加类型：写错立刻报错 ======
function add_ts(a: number, b: number): number {
  return a + b
}
console.log('add_ts(1, 2)         =', add_ts(1, 2))

// ↓ 取消下面这行的注释：TS 立刻报错
//   "Argument of type 'string' is not assignable to parameter of type 'number'"
// console.log(add_ts('1', '2'))
</script>

<template>
  <div style="padding: 20px; font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8;">
    <h1>TS 是什么 + 为什么用</h1>
    <p>看右下方 <b>console 面板</b> 的输出。</p>
    <p>试着取消最后一行 <code>// console.log(add_ts('1', '2'))</code> 的注释，<b>TS 编译时立刻拦下来</b>。</p>
  </div>
</template>
