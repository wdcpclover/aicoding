# 第一个 JS 程序 {#js-step-1}

JavaScript（简称 JS）让网页**能动、能交互**。HTML 搭骨架，CSS 做装修，JS 通水电——按钮能响应、数据能变化、页面能动态更新。

## 1. JS 写在哪？

### 写在 HTML 里

```html
<script>
  alert('你好，JavaScript！')
</script>
```

`<script>` 标签里直接写 JS 代码，浏览器会自动执行。

### 写在外部文件里（推荐）

```html
<script src="app.js"></script>
```

和 CSS 一样，JS 也推荐单独放到 `.js` 文件里。

### 在控制台直接写

打开 Chrome → 按 `F12` → `Console` 标签 → 直接敲 JS 回车执行。**学习 JS 最快的方式**。

## 2. 三种输出方式

```js
alert('弹窗')                                     // 弹出对话框
console.log('控制台输出')                          // 输出到 F12 控制台
document.getElementById('demo').textContent = '修改页面内容'
```

学习阶段用 `console.log()` 最方便：不打断页面，随时查看数据。

## 3. 看右边 →

右边 REPL 里就是一个完整的 HTML 页面，里面有几个按钮演示三种输出方式。**点点看**，再翻到下一步就开始写代码了。
