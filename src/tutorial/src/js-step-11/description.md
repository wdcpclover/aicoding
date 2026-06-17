# DOM 操作与事件 {#js-step-11}

DOM（Document Object Model）就是把 HTML 页面变成 JS 可以操作的对象。

## 1. 获取元素

```js
const box = document.getElementById('myBox')         // 通过 ID
const btn = document.querySelector('.btn')           // 第一个匹配的 CSS 选择器
const items = document.querySelectorAll('.item')     // 所有匹配
```

## 2. 修改内容

```js
p.textContent = '纯文字内容'
p.innerHTML = '包含 <strong>HTML</strong> 的内容'
```

## 3. 修改样式

```js
// 直接设置样式
box.style.backgroundColor = 'red'
box.style.borderRadius = '50%'

// 操作 class（推荐）
box.classList.add('active')
box.classList.remove('active')
box.classList.toggle('active')   // 有就删，没就加
```

## 4. 创建和删除元素

```js
const li = document.createElement('li')
li.textContent = '新的列表项'
document.getElementById('list').appendChild(li)
li.remove()
```

## 5. 事件监听

```js
btn.addEventListener('click', () => {
  console.log('按钮被点击了')
})
```

常用事件：

| 事件 | 触发时机 |
|---|---|
| `click` | 点击 |
| `mouseenter` / `mouseleave` | 鼠标移入 / 移出 |
| `keyup` | 键盘按键松开 |
| `input` | 输入框内容变化 |
| `submit` | 表单提交 |

## 6. 为什么学了 DOM 还要学 Vue？

原生 DOM 写交互代码量大、容易出错。比如一个待办列表，原生要几十行。

**Vue 的核心思想是「数据驱动视图」：你只管改数据，页面自动更新，不用手动操作 DOM**。

所以 DOM 操作**理解原理就行**，实际项目中用 Vue。

## 看右边 →

REPL 里有一个综合演示页：修改文字 / 修改样式 / 操作 class / 动态创建段落 / 鼠标事件 / 简易待办列表。**先点点看**，对比一下后面 Vue 篇里同一个待办用响应式数据写有多简单。
