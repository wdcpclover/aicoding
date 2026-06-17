# 运算符 + 条件判断 {#js-step-5}

## 1. 算术运算

```js
10 + 3   // 13
10 - 3   // 7
10 * 3   // 30
10 / 3   // 3.333...
10 % 3   // 1   ← 取余数
```

## 2. 比较运算

```js
5 > 3       // true
5 === 5     // true     ← 严格相等，推荐
5 === '5'   // false    ← 类型不同
5 !== 3     // true
```

> **永远用 `===` 而不是 `==`。**`==` 会自动转类型，容易出 bug。

## 3. 逻辑运算

```js
true && true     // true   （与：都真才真）
true || false    // true   （或：有一个真就真）
!true            // false  （非：取反）
```

## 4. if-else

```js
const score = 85
if (score >= 90)      console.log('优秀')
else if (score >= 80) console.log('良好')
else if (score >= 60) console.log('及格')
else                  console.log('不及格')
```

## 5. 三元运算符

简单 if-else 可以简写：

```js
const status = age >= 18 ? '成年' : '未成年'
```

## 6. switch（多个固定值的判断）

```js
switch (day) {
  case 1: case 2: case 3: case 4: case 5:
    console.log('工作日'); break
  case 0: case 6:
    console.log('周末'); break
  default:
    console.log('?')
}
```

注意 **一定要写 `break`**，不然会"穿透"到下一个 case。

## 7. 短路运算（实用技巧）

```js
const user = { name: '小明' }
user && console.log(user.name)        // 输出 '小明'
null && console.log('不会执行')       // 不执行

const name = input || '匿名用户'      // input 为空时取右边
const count = 0
count || 10     // 10  （0 是假值，被替换了）
count ?? 10     // 0   （?? 只看 null/undefined）
```

`??` 比 `||` 更安全，Vue 里设默认值很常见。

## 看右边 →

REPL 里跑了一遍上面所有运算符，下面还有一个**输入成绩自动评级**的小互动。
