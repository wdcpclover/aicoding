# CSS 入门 {#css-step-1}

如果说 HTML 是骨架，**CSS（层叠样式表）就是装修**——颜色、字体、大小、间距、布局全靠它。

## 三种引入方式

```html
<!-- 1. 行内：直接写在标签上（不推荐，乱） -->
<p style="color: red;">红字</p>

<!-- 2. 内部：写在 <head> 的 <style> 里 -->
<style>
  p { color: red; }
</style>

<!-- 3. 外部：单独的 .css 文件（最推荐） -->
<link rel="stylesheet" href="style.css">
```

## 选择器：选中谁来美化

```css
p        { color: red; }      /* 标签选择器：所有 <p> */
.box     { color: blue; }     /* 类选择器：class="box" 的元素 */
#title   { color: green; }    /* id 选择器：id="title" 的元素 */
```

写法：**选择器 { 属性: 值; }**。用得最多的是**类选择器** `.类名`。

## 几个最常用属性

```css
color: #42b883;        /* 文字颜色 */
font-size: 20px;       /* 字号 */
background: #f5f5f5;    /* 背景色 */
text-align: center;    /* 文字居中 */
```

## 看右边 →

右边的 `<style>` 里用三种选择器各写了一条规则。**改改颜色和字号**，看预览变化。
