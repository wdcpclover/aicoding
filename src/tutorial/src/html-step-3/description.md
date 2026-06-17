# 表单与输入 {#html-step-3}

网页要收集用户输入（登录、注册、搜索），靠的就是**表单**。

## 输入框 input

```html
<input type="text" placeholder="请输入用户名">
<input type="password" placeholder="请输入密码">
<input type="checkbox"> 记住我
```

`type` 决定输入框的样子：`text` 普通文本、`password` 密码（显示圆点）、`checkbox` 勾选框。`placeholder` 是输入框里的灰色提示文字。

## 多行文本、按钮、下拉框

```html
<textarea placeholder="写点什么..."></textarea>

<button>提交</button>

<select>
  <option>北京</option>
  <option>上海</option>
</select>
```

## 标签 label

```html
<label>用户名：<input type="text"></label>
```

`<label>` 把说明文字和输入框关联起来，点文字也能聚焦到输入框，体验更好。

## 看右边 →

右边是一个简单的登录表单。**加一个"手机号"输入框、给下拉框多加一个 `<option>`** 试试。

> 现在这些输入框还没有"功能"——点提交不会有反应。等学到 **JS 篇**，我们再让它们动起来。
