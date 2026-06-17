# 对象 / 解构 / 展开 / 对象方法 {#js-step-9}

## 1. 对象基础

对象是**键值对的集合**，描述一个事物的各种属性：

```js
const student = {
  name: '小明',
  age: 20,
  hobbies: ['写代码', '打游戏'],
  score: { math: 95, english: 88 }
}

student.name           // '小明'   （点号取值）
student['age']         // 20       （方括号取值）
student.score.math     // 95       （嵌套取值）
```

## 2. 常用对象操作

```js
Object.keys(student)     // ['name', 'age', ...]
Object.values(student)   // ['小明', 20, ...]
Object.entries(student)  // [['name','小明'], ['age',20], ...]

// 遍历对象
Object.entries(student).forEach(([key, value]) => {
  console.log(`${key}: ${value}`)
})
```

## 3. 解构赋值（ES6）

```js
// 对象解构
const { name, age } = student

// 解构时重命名
const { name: studentName } = student

// 解构时设默认值
const { phone = '未填写' } = student

// 嵌套解构
const { score: { math } } = student
```

函数参数也能直接解构 —— Vue 组件里经常见到：

```js
const showUser = ({ name, age }) => `${name}, ${age}岁`
```

## 4. 展开运算符 (...)

```js
// 对象展开（合并 / 复制）
const updated = { ...student, age: 21 }
// 复制 student 所有属性，把 age 改成 21
```

> **浅拷贝注意**：`{ ...obj }` 只复制第一层。嵌套的数组 / 对象还是共享引用。

## 5. 可选链 (?.)

安全地访问可能不存在的属性，不会报错：

```js
const user = { name: '小红', address: null }

user.address.city        // ❌ 报错！address 是 null
user.address?.city       // undefined （不报错）
user.phone?.number       // undefined （不报错）
```

## 6. 对象方法（method）

对象里的函数叫**方法**，里面用 `this` 指向当前对象：

```js
const student = {
  name: '小明',
  introduce() {
    return `我叫 ${this.name}`
  }
}
student.introduce()   // "我叫 小明"
```

## 看右边 →

REPL 里依次演示了对象基础、解构、展开、可选链，以及一个带 `this` 和方法的 `student` 对象。
