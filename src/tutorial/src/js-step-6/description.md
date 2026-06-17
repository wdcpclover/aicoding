# 函数：普通 / 箭头 / 默认 / 剩余 {#js-step-6}

函数是**一段可以重复使用的代码**。给它输入，它给你输出。

## 1. 普通函数

```js
function greet(name) {
  return `你好，${name}！`
}
greet('小明')   // "你好，小明！"
```

- `function` 关键字定义函数
- `name` 是参数（输入）
- `return` 返回结果（输出）

## 2. 箭头函数（ES6，推荐）

写法更简洁：

```js
// 完整写法
const add = (a, b) => {
  return a + b
}

// 简写：只有一行表达式时可以省略 {} 和 return
const add = (a, b) => a + b

// 只有一个参数时可以省略括号
const double = n => n * 2
```

箭头函数是**现代 JS 最常用的写法**，Vue 里大量使用。

## 3. 默认参数

```js
const sayHello = (name = '同学') => `Hello, ${name}!`

sayHello('小刚')   // "Hello, 小刚!"
sayHello()         // "Hello, 同学!"  （没传，用默认值）
```

## 4. 剩余参数（...args）

不确定有多少个参数时，用 `...` 收集成数组：

```js
const sum = (...nums) => nums.reduce((total, n) => total + n, 0)

sum(1, 2)            // 3
sum(1, 2, 3, 4, 5)   // 15
```

## 看右边 →

REPL 里把这 4 种写法都演示了一遍，注意 **箭头函数 + 默认参数** 是 Vue 项目里最常见的组合。
