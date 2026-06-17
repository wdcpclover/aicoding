# type 别名 + 交叉类型 {#ts-step-5}

## 1. type 基本用法

`type` 和 `interface` 都能描述对象类型：

```ts
type Point = {
  x: number
  y: number
}

const origin: Point = { x: 0, y: 0 }
```

## 2. type 的独特能力

`type` 比 `interface` 更灵活，还能定义：

**联合类型**（很常用）：

```ts
type Status = '成功' | '失败' | '加载中'
type ID = string | number
```

**类型别名**：

```ts
type StringArray = string[]
type Callback = (data: string) => void
```

## 3. 交叉类型（`&`）

把多个类型合并成一个，相当于"都要满足"：

```ts
type HasName = { name: string }
type HasAge = { age: number }

type Person = HasName & HasAge

const p: Person = { name: '小明', age: 20 }    // ✅ 必须有 name 和 age
```

实际场景——给组件 props 加上公共属性：

```ts
type WithLoading = { loading: boolean }

type UserCardProps = {
  name: string
  avatar: string
} & WithLoading
// 结果：{ name; avatar; loading }
```

## 4. interface 还是 type？

| | interface | type |
|---|---|---|
| 描述对象形状 | ✅ | ✅ |
| 继承 extends | ✅ | ❌（用 `&` 代替） |
| 联合类型 | ❌ | ✅ |
| 字面量类型 | ❌ | ✅ |
| 交叉类型 | ❌ | ✅ |

**简单原则**：
- 描述**对象 / 类** → 用 `interface`
- **联合 / 交叉 / 别名** → 用 `type`
- 不确定 → `interface`（Vue 社区惯例）

## 看右边 →

REPL 里跑了一遍 type 的几种主要用法 + 交叉类型 `&` 的合并效果。
