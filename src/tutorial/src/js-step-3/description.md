# 数据类型与 typeof {#js-step-3}

JS 有这几种基本数据类型：

| 类型 | 说明 | 例子 |
|------|------|------|
| **string** | 字符串 | `'你好'`、`"hello"` |
| **number** | 数字 | `42`、`3.14` |
| **boolean** | 布尔 | `true`、`false` |
| **undefined** | 未定义 | 声明了没赋值 |
| **null** | 空值 | 主动设为空 |
| **array** | 数组 | `[1, 2, 3]` |
| **object** | 对象 | `{ name: '小明' }` |

## typeof：查看类型

```js
typeof 'hello'     // 'string'
typeof 42          // 'number'
typeof true        // 'boolean'
typeof undefined   // 'undefined'
typeof []          // 'object'   ← 注意：数组也是 object
typeof null        // 'object'   ← JS 历史 bug，记住就好
```

> `null` 和数组的 `typeof` 都返回 `'object'`，要判断**是不是数组**用 `Array.isArray(x)`，要判断**是不是 null** 直接 `x === null`。

## 看右边 →

REPL 里把 7 种类型各声明一个变量，并打印出值和 `typeof` 结果，看清楚哪个对应哪个。
