# interface 接口 {#ts-step-4}

## 1. 描述对象的"形状"

接口就像一个**模具**，规定对象必须有哪些属性、每个属性是什么类型：

```ts
interface Student {
  name: string
  age: number
  major: string
  score?: number   // 可选属性
}
```

使用：

```ts
// ✅
const student: Student = {
  name: '小明',
  age: 20,
  major: '计算机科学'
}

// ❌ 缺少必填属性
const bad: Student = { name: '小刚' }

// ❌ 多了未定义的属性
const bad2: Student = {
  name: '小刚',
  age: 20,
  major: '数学',
  height: 175    // 接口里没有 height
}
```

## 2. 接口用于函数参数（最常用）

```ts
function printStudent(s: Student): void {
  console.log(`${s.name}，${s.age}岁，${s.major}专业`)
}
```

## 3. 嵌套接口

```ts
interface Course {
  name: string
  teacher: string
  students: Student[]   // Student 数组
}
```

## 4. 接口继承

用 `extends` 让接口继承另一个接口：

```ts
interface Person {
  name: string
  age: number
}

interface Teacher extends Person {
  subject: string
  yearsOfExperience: number
}

const teacher: Teacher = {
  name: '张老师',
  age: 35,
  subject: '前端开发',
  yearsOfExperience: 10
}
```

## 看右边 →

REPL 里依次演示了 Student 接口、嵌套 Course、Teacher extends Person 的实际用法。
