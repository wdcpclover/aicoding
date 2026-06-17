# 回调与闭包 {#js-step-7}

## 1. 回调函数（callback）

函数可以作为参数传给另一个函数，这叫**回调函数**：

```js
const numbers = [1, 2, 3, 4, 5]

// forEach：遍历
numbers.forEach(n => console.log(n))

// map：映射成新数组
numbers.map(n => n * 2)         // [2, 4, 6, 8, 10]

// filter：过滤
numbers.filter(n => n % 2 === 0) // [2, 4]

// find：找第一个符合条件的
numbers.find(n => n > 3)         // 4
```

这些数组方法**非常重要**，Vue 开发中天天用到。

## 2. 闭包（closure）

函数可以返回另一个函数，内层函数能"记住"外层的变量：

```js
const createCounter = () => {
  let count = 0
  return () => {
    count++
    return count
  }
}

const counter = createCounter()
counter()   // 1
counter()   // 2
counter()   // 3
// count 被"关"在里面，外面访问不到，但每次调用都还在
```

这就是**闭包**。Vue 3 的 `setup()` 函数本质就是一个闭包——把响应式数据"关"在里面，模板能用但外面改不了。

## 看右边 →

REPL 上半部分演示了 4 个常用回调（forEach / map / filter / find），下半部分演示了一个**带私有变量的银行账户**——`balance` 对外不可见，但通过返回的方法能存、能取、查余额。这就是闭包模拟"私有"的经典写法。
