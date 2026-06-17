# 泛型入门 {#ts-step-7}

## 1. 什么是泛型

泛型就是**类型的参数**。函数能传值参数，**类型也能传"参数"**。

**问题**：写一个函数，传什么类型就返回什么类型。

```ts
// ❌ 用 any：能用，但失去类型信息
function identity(value: any): any {
  return value
}
const r = identity('hello')   // r 是 any，不是 string
```

```ts
// ✅ 用泛型：T 是类型参数
function identity<T>(value: T): T {
  return value
}
const r = identity('hello')   // r 自动推断为 string
const n = identity(42)        // n 自动推断为 number
```

`<T>` 中的 `T` 是占位符，调用时被替换成实际类型。

## 2. 泛型接口（API 响应模式）

```ts
// T 代表 data 的类型，用到时再确定
interface ApiResult<T> {
  code: number
  message: string
  data: T
}
```

使用：

```ts
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

// TS 自动提示：userRes.data.name ✅
// TS 自动提示：productRes.data.price ✅
```

## 3. 在 Vue 3 中

后面学 Vue 时会经常看到泛型：

```ts
const count = ref<number>(0)
const name = ref<string>('')
const users = ref<User[]>([])

const form = reactive<User>({ id: 0, name: '' })
```

> 现在只需要**理解概念**：用 `<T>` 让类型变得灵活，具体类型在使用时确定。

## 看右边 →

REPL 里有 `identity<T>` 和 `ApiResult<T>` 的完整演示。
