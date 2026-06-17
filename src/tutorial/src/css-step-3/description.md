# 文字、背景与美化 {#css-step-3}

掌握一批"颜值"属性，就能把朴素的 HTML 变好看。

## 文字

```css
color: #333;              /* 颜色 */
font-size: 18px;          /* 字号 */
font-weight: bold;        /* 加粗 */
line-height: 1.6;         /* 行高，正文设 1.5~1.8 最舒服 */
text-align: center;       /* 对齐：left / center / right */
```

## 背景与边框

```css
background: #42b883;            /* 背景色 */
border: 1px solid #eee;         /* 边框 */
border-radius: 8px;             /* 圆角，越大越圆 */
```

## 阴影：让元素"浮"起来

```css
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
/*          右 下 模糊   颜色(带透明度) */
```

一个**卡片**效果，基本就是 `背景白 + 圆角 + 阴影 + 内边距` 的组合。

## 看右边 →

右边把这些属性组合成了一张卡片。**改圆角大小、阴影深浅、背景颜色**，调出你喜欢的样子。
