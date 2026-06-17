# 循环 {#js-step-10}

## 1. for 循环

```js
for (let i = 0; i < 5; i++) {
  console.log(`第 ${i} 次`)
}
```

`break` 和 `continue`：

```js
for (let i = 0; i < 10; i++) {
  if (i === 3) continue   // 跳过本次
  if (i === 7) break      // 直接结束
  console.log(i)          // 0, 1, 2, 4, 5, 6
}
```

## 2. while 循环

不知道循环几次时用 `while`：

```js
let attempts = 0
let success = false
while (!success && attempts < 5) {
  attempts++
  success = Math.random() > 0.5
}
```

## 3. for...of（推荐遍历数组）

```js
const fruits = ['苹果', '香蕉', '橘子']
for (const fruit of fruits) {
  console.log(fruit)
}
```

## 4. for...in（遍历对象的键）

```js
const student = { name: '小明', age: 20 }
for (const key in student) {
  console.log(`${key}: ${student[key]}`)
}
```

## 选哪个？

| 场景 | 推荐 |
|---|---|
| 遍历数组 | `for...of` 或 `forEach` / `map` |
| 遍历对象的键 | `for...in` 或 `Object.entries(...).forEach` |
| 需要 index | `forEach((item, i) => ...)` |
| 不知道次数 | `while` |
| 需要 break / continue | `for` 或 `for...of` |

> 很多场景用上一节学的数组方法（`map`、`filter`、`reduce`）会更简洁，**优先用方法、少用循环**。

## 看右边 →

REPL 里把 4 种循环 + forEach 都跑了一遍。
