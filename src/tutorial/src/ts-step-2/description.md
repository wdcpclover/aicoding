# 基础类型 + 推断 + 元组 + any {#ts-step-2}

## 1. 类型注解

在变量名后加 `: 类型`：

```ts
let username: string = '小明'
let age: number = 20
let isStudent: boolean = true
let fruits: string[] = ['苹果', '香蕉']
```

## 2. 类型保护

```ts
let username: string = '小明'
username = 123      // ❌ 不能把 number 赋给 string

let fruits: string[] = ['苹果']
fruits.push(123)    // ❌ 数组只能放 string
```

## 3. 类型推断

有初始值时，**TS 自己能推断**，不用写：

```ts
let city = '北京'    // 自动推断为 string
let count = 0        // 自动推断为 number

city = 100           // ❌ 推断出来的类型一样有效
```

> **实战习惯**：能推断的就不写注解；没初始值或类型不明确才写。

## 4. 元组（Tuple）

固定长度和类型的数组：

```ts
const item: [string, number] = ['手机壳', 29.9]

item[0]   // string
item[1]   // number
```

> React 的 `useState` 就是这个模式，Vue 项目里偶尔会遇到。

## 5. any（逃生舱口）

`any` = 关闭类型检查：

```ts
let anything: any = '随便什么'
anything = 123     // ✅
anything = true    // ✅
```

> ⚠️ **尽量不用** `any`，否则就失去了 TS 的意义。临时迁移老代码或处理第三方库时可以用。

`unknown` 是更安全的替代——接受任何值，但**用之前必须先判断类型**：

```ts
let data: unknown = '可能是任何东西'
if (typeof data === 'string') {
  data.toUpperCase()   // ✅
}
```

## 看右边 →

REPL 里把上面所有类型都演示了一遍。试着取消注释 `// username = 123`、`// fruits.push(123)` 等行看 TS 报错。
