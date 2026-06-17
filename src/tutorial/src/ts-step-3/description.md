# 函数类型 + 类型断言 {#ts-step-3}

## 1. 参数和返回值类型

```ts
function greet(name: string): string {
  return `你好，${name}！`
}

greet('小明')   // ✅
greet(123)      // ❌ 参数必须是 string
```

箭头函数同理：

```ts
const add = (a: number, b: number): number => a + b
```

## 2. 返回值类型推断

TS 能根据 `return` 自动推断返回值，**通常可以省略返回值类型**：

```ts
const multiply = (a: number, b: number) => a * b   // 返回 number
const hello = (name: string) => `你好，${name}`    // 返回 string
```

## 3. 没有返回值：void

```ts
function sayHello(name: string): void {
  console.log(`Hello, ${name}`)
}
```

## 4. 可选参数（`?`）

```ts
function introduce(name: string, age?: number): string {
  if (age !== undefined) return `我叫${name}，今年${age}岁`
  return `我叫${name}`
}

introduce('小明')        // ✅
introduce('小明', 20)    // ✅
```

> 可选参数必须放在必选参数后面。

## 5. 默认参数

```ts
function createUser(name: string, role: string = '学生'): string {
  return `${name}（${role}）`
}

createUser('小红')              // 小红（学生）
createUser('张老师', '教师')    // 张老师（教师）
```

## 6. 类型断言（`as`）

有时你比 TS 更清楚一个值的类型，用 `as` 告诉它：

```ts
// 场景：DOM 元素
const inputEl = document.getElementById('username') as HTMLInputElement
inputEl.value   // ✅ 现在能访问 .value

// 场景：JSON 解析
interface User { name: string; age: number }
const data = JSON.parse('{"name":"小明","age":20}') as User
data.name       // ✅ 当作 User 类型
```

> ⚠️ 类型断言**不做运行时检查**，只是告诉编译器"相信我"。断错了照样运行时出 bug。

## 看右边 →

REPL 里把 6 种函数写法 + `as` 断言都演示了一遍。
