# 异步编程 {#js-step-12}

## 1. 什么是异步？

你去餐厅吃饭：
- **同步**：点完菜站在厨房门口等，做好了再去做别的（傻等）
- **异步**：点完菜回座位玩手机，做好了服务员叫你（不阻塞）

JS 里，**网络请求、定时器、文件读取**都是异步的——发出请求后不会卡住，结果回来再处理。

## 2. setTimeout（定时器）

```js
console.log('开始')
setTimeout(() => {
  console.log('2 秒后执行')
}, 2000)
console.log('我先执行')
// 输出顺序：开始 → 我先执行 → 2 秒后执行
```

## 3. Promise

Promise 表示**一个未来会完成的操作**：

```js
const fetchData = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('数据获取成功')   // 成功
    // reject('获取失败')     // 失败
  }, 1000)
})

fetchData
  .then(result => console.log(result))     // 成功时执行
  .catch(error => console.log(error))      // 失败时执行
```

## 4. async / await（推荐写法）

`async/await` 是 Promise 的语法糖，让异步代码**看起来像同步**：

```js
async function getData() {
  try {
    const result = await fetchData
    console.log(result)
  } catch (error) {
    console.log(error)
  }
}
```

- `async` 标记这是一个异步函数
- `await` 等待 Promise 完成
- `try / catch` 处理成功和失败

## 5. fetch：发网络请求

`fetch` 是浏览器内置的请求 API：

```js
async function getAdvice() {
  try {
    const response = await fetch('https://api.adviceslip.com/advice')
    const data = await response.json()
    console.log(data.slip.advice)
  } catch (error) {
    console.log('请求失败:', error)
  }
}
```

## 6. Promise.all：并行请求

同时发多个请求，全部完成后一起处理：

```js
const [users, orders, stats] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/orders').then(r => r.json()),
  fetch('/api/stats').then(r => r.json())
])
```

Vue 的页面初始化中很常用——一个页面可能需要同时请求好几个接口。

## 看右边 →

REPL 里依次演示了 5 个按钮：定时器 / Promise / async-await / fetch 真实 API / 同步 vs 异步执行顺序。**点最后那个"观察执行顺序"** 看看 Promise.then 和 setTimeout 的微任务/宏任务先后差异。
