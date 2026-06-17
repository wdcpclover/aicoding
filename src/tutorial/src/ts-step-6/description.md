# 联合类型 + 类型收窄 {#ts-step-6}

## 1. 联合类型

用 `|` 表示一个值可以是多种类型之一：

```ts
let input: string | number
input = 'hello'    // ✅
input = 42         // ✅
input = true       // ❌ 只能是 string 或 number
```

## 2. 字面量联合类型（很常用）

把具体的值作为类型，限制变量只能是某几个：

```ts
type Direction = 'up' | 'down' | 'left' | 'right'
let dir: Direction = 'up'    // ✅
dir = 'forward'              // ❌

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// Vue / UI 组件中很常见
type ButtonType = 'primary' | 'success' | 'warning' | 'danger'
type Size = 'large' | 'default' | 'small'
```

## 3. 类型收窄

变量是联合类型时，TS 需要你**先判断**才能用对应类型的方法：

```ts
function printValue(value: string | number): void {
  if (typeof value === 'string') {
    // TS 知道这里 value 是 string
    console.log(value.toUpperCase())
  } else {
    // TS 知道这里 value 是 number
    console.log(value.toFixed(2))
  }
}
```

## 4. 可辨识联合（处理 API 响应的常用模式）

通过一个**公共字段**区分不同类型的对象：

```ts
interface SuccessResult {
  status: 'success'
  data: any
}

interface ErrorResult {
  status: 'error'
  message: string
}

type ApiResult = SuccessResult | ErrorResult

function handle(res: ApiResult) {
  if (res.status === 'success') {
    console.log(res.data)        // TS 知道是 SuccessResult
  } else {
    console.log(res.message)     // TS 知道是 ErrorResult
  }
}
```

> 这种模式叫**可辨识联合**（Discriminated Union），处理 API 响应时非常实用。

## 看右边 →

REPL 里有联合类型 + 类型收窄 + 可辨识联合的完整演示。
