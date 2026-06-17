# 数组与常用方法 {#js-step-8}

## 1. 数组基础

```js
const fruits = ['苹果', '香蕉', '橘子']

fruits[0]                // '苹果' （从 0 开始）
fruits.length            // 3
fruits.push('葡萄')      // 末尾添加
fruits.pop()             // 末尾删除
fruits.includes('香蕉')  // true
```

更多操作：

```js
const arr = [1, 2, 3, 4, 5]
arr.slice(1, 3)                       // [2, 3]   （截取，不改原数组）
['小明', '小红'].join('、')             // '小明、小红'
[1, 2, 3].reverse()                   // [3, 2, 1]
[10, 2, 30].sort()                    // [10, 2, 30]  ← 错！默认按字符排
[10, 2, 30].sort((a, b) => a - b)    // [2, 10, 30]  ← 对！按数字排
```

## 2. 链式调用：filter → map → join

实际开发中很少手写 for 循环，更多用数组方法：

```js
const scores = [85, 92, 78, 96, 63, 88]

const result = scores
  .filter(s => s >= 80)        // [85, 92, 96, 88]
  .map(s => `${s}分`)          // ['85分', '92分', '96分', '88分']
  .join('、')                  // '85分、92分、96分、88分'
```

## 3. reduce：归纳成一个值

```js
const scores = [85, 92, 78, 96, 63]

scores.reduce((sum, s) => sum + s, 0)             // 414  （求和）
scores.reduce((m, s) => s > m ? s : m, 0)         // 96   （找最大）
```

## 4. some / every：表单验证

```js
const passwords = ['abc', 'hello123', 'x']

passwords.some(p => p.length >= 6)    // true   （至少有一个）
passwords.every(p => p.length >= 6)   // false  （不是全部都）

// 实际场景：检查表单是否全部填写
const fields = ['小明', '', '计算机']
fields.every(f => f !== '')           // false
```

## 速查表

| 方法 | 作用 | 返回值 |
|---|---|---|
| `forEach` | 遍历 | 无 |
| `map` | 每个元素变换 | 新数组 |
| `filter` | 过滤 | 新数组 |
| `find` | 找第一个匹配 | 单个元素 |
| `some` | 至少一个满足 | true/false |
| `every` | 全部满足 | true/false |
| `reduce` | 累计计算 | 累计值 |
| `includes` | 是否包含 | true/false |

## 看右边 →

REPL 里跑了一遍数组基础操作 + filter/map/reduce/some/every 的链式与组合用法。
