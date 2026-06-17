# 实战类型 {#ts-step-8}

`Record` / `Pick` / `Omit` / `Partial` / `enum` / `typeof` / `as const` 都是 Vue 项目里**真用得到**的工具。

## 1. readonly：只读属性

```ts
interface Config {
  readonly appName: string    // 创建后不能改
  version: string             // 可以改
}

const config: Config = { appName: 'MyApp', version: '1.0' }
config.version = '1.1'         // ✅
config.appName = 'Other'       // ❌ 只读属性
```

## 2. Record：键值对类型

```ts
type ScoreMap = Record<string, number>

const scores: ScoreMap = {
  '数学': 95,
  '英语': 88
}
```

## 3. Pick / Omit：选取 / 排除属性

```ts
interface User {
  id: number
  name: string
  email: string
  password: string
}

type UserPreview = Pick<User, 'id' | 'name'>
//                 → { id: number; name: string }

type SafeUser = Omit<User, 'password'>
//             → { id; name; email }
```

## 4. Partial：全部变可选

更新数据时常用：

```ts
type UserUpdate = Partial<User>
// 所有属性都变可选

const updates: UserUpdate = { name: '新名字' }   // ✅ 只传一个也行
```

## 5. enum：一组有名字的常量

```ts
enum OrderStatus {
  Pending = '待付款',
  Paid = '已付款',
  Shipped = '已发货',
  Delivered = '已收货'
}

const status: OrderStatus = OrderStatus.Pending
```

> 也可以用联合类型代替，Vue 项目里更常见：
> ```ts
> type OrderStatus = '待付款' | '已付款' | '已发货' | '已收货'
> ```

## 6. typeof：从已有变量推导类型

```ts
const defaultConfig = {
  theme: 'dark',
  fontSize: 14,
  language: 'zh-CN'
}

type AppConfig = typeof defaultConfig
//             → { theme: string; fontSize: number; language: string }
```

不用重复写一遍 interface。

## 7. as const：常量断言

让 TS 把值当作**字面量类型**而不是宽泛的类型：

```ts
const colors = ['red', 'green', 'blue'] as const
// 类型 readonly ['red', 'green', 'blue']

type Color = typeof colors[number]
// 'red' | 'green' | 'blue'
```

实用场景——一处定义，类型 + 数据都拿到：

```ts
const STATUS_OPTIONS = [
  { value: 'active',   label: '启用' },
  { value: 'inactive', label: '停用' }
] as const

type StatusValue = typeof STATUS_OPTIONS[number]['value']
// 'active' | 'inactive'
```

## 看右边 →

REPL 里把 7 个工具类型都演示了一遍。这些是 Vue 3 项目里**最常用**的 TS 工具。
