# Flex 布局 {#css-step-4}

怎么让几个元素**排成一行、还能对齐**？现代布局的答案是 **Flex（弹性布局）**。

## 三步用上 Flex

给**父容器**加 `display: flex`，里面的子元素就自动排成一行：

```css
.container {
  display: flex;            /* 开启 flex，子元素横向排列 */
  justify-content: center; /* 主轴（横向）对齐 */
  align-items: center;     /* 交叉轴（纵向）对齐 */
  gap: 16px;               /* 子元素之间的间距 */
}
```

## justify-content 常用值

| 值 | 效果 |
|----|------|
| `flex-start` | 靠左（默认） |
| `center` | 居中 |
| `space-between` | 两端对齐，中间均分 |
| `space-around` | 每个元素左右均分间距 |

> 导航栏"左 logo、右菜单"就是 `space-between`；想整体居中就用 `center`。

## 看右边 →

右边是一个用 Flex 做的**导航栏**和一排**卡片**。**把 `justify-content` 换成 `space-between` / `center` / `flex-start`**，看排列怎么变。
