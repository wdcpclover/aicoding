# 变量：let 和 const {#js-step-2}

JS 用 `let` 和 `const` 声明变量。

## let：可以修改

```js
let age = 20
age = 21    // ✅ 可以改
```

## const：不能修改

```js
const name = '小明'
// name = '小红'   // ❌ 报错！const 不能改
```

## 规则

**能用 `const` 就用 `const`，需要修改的才用 `let`。不要用 `var`**（老写法，有坑）。

> 现代 JS 项目里 90% 以上都是 `const`，只有循环计数器、累加变量等场景才用 `let`。

## 看右边 →

REPL 里分别声明了一个 `let` 和一个 `const`。试着把 `// name = ...` 那行的注释去掉，看 REPL 会怎么报错。
