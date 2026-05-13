---
name: 综合/零售中心分屏落地页
description: 为综合中心标准和零售中心标准各新增一个全屏分屏落地页，左右面板分别展示外立面和室内效果图，hover 时以 9:1 比例展开，点击跳转到对应详情页。
type: project
---

# 综合/零售中心分屏落地页 设计规范

## 背景与目标

当前"综合中心标准"和"零售中心标准"导航项通过 hover mega menu 进行子页面导航，没有独立的落地页。本次改动：

1. 为两个中心各新增全屏分屏落地页
2. 移除 mega menu（整合与零售两项）
3. 点击导航项直接进入分屏落地页
4. 从落地页点击面板跳转到对应详情页

---

## 页面结构

### 综合中心标准（`section-integrated`）

```
section.section#section-integrated
  └── div.split-hero
        ├── div.split-panel[data-side="left"]     ← 外立面标准
        │     ├── div.split-panel-bg               ← 背景图：assets/标准封面图/综合中心外立面.jpg
        │     ├── div.split-panel-overlay           ← 渐变遮罩
        │     └── div.split-panel-content          ← 文字内容
        │           ├── .split-panel-title          ← "外立面标准"
        │           ├── .split-panel-desc           ← "交互式建筑立面 · 标识 / 灯光 / 横楣 / 幕墙 / 门斗"
        │           └── .split-panel-cta            ← "进入 →"
        └── div.split-panel[data-side="right"]     ← 室内标准
              ├── div.split-panel-bg               ← 背景图：assets/标准封面图/综合中心室内.jpg
              ├── div.split-panel-overlay
              └── div.split-panel-content
                    ├── .split-panel-title          ← "室内标准"
                    ├── .split-panel-desc           ← "交互式室内标准 · 空间 / 材料 / 设计"
                    └── .split-panel-cta            ← "进入 →"
```

### 零售中心标准（`section-retail`）

结构与综合中心完全相同，但：
- 背景图使用 `assets/标准封面图/零售中心外立面..jpg` 和 `assets/标准封面图/零售中心室内.jpg`
- 两个面板均叠加 `.split-panel--disabled` 修饰类
- 点击任意面板触发 toast 提示（不跳转）

---

## 交互行为

### 面板尺寸过渡

| 状态 | 左面板（外立面） | 右面板（室内） |
|------|--------------|------------|
| 默认 | `flex: 1`（50%） | `flex: 1`（50%） |
| hover 左面板 | `flex: 9`（≈90%） | `flex: 1`（≈10%） |
| hover 右面板 | `flex: 1`（≈10%） | `flex: 9`（≈90%） |

过渡曲线：`cubic-bezier(0.25, 0.46, 0.45, 0.94)`，时长 `0.6s`。

CSS 实现（纯 CSS `:has()` 方案，无需 JS）：

```css
.split-hero:has(.split-panel:first-child:hover) .split-panel:first-child { flex: 9; }
.split-hero:has(.split-panel:first-child:hover) .split-panel:last-child  { flex: 1; }
.split-hero:has(.split-panel:last-child:hover)  .split-panel:first-child { flex: 1; }
.split-hero:has(.split-panel:last-child:hover)  .split-panel:last-child  { flex: 9; }
```

### 文字层行为

**默认（50:50）：**
- 标题居中显示，白色，中等字号（约 28px）
- 副标题隐藏（opacity: 0）
- "进入 →" 按钮隐藏

**hover 展开侧（90%）：**
- 标题移至左下角，字号放大（约 40px），过渡 `transform + font-size`
- 副标题淡入（opacity: 0 → 1，延迟 0.1s）
- "进入 →" 按钮淡入

**hover 收缩侧（10%）：**
- 标题旋转 90° 竖排显示（`writing-mode: vertical-rl`），字号缩小
- 副标题和 CTA 隐藏
- 遮罩加深

### 点击行为

| 目标面板 | 行为 |
|---------|------|
| 综合中心 · 外立面 | `switchSection('facade')` |
| 综合中心 · 室内 | `switchSection('interior')` |
| 零售中心 · 外立面 | 显示 toast："零售中心标准建设中，敬请期待" |
| 零售中心 · 室内 | 显示 toast："零售中心标准建设中，敬请期待" |

---

## 导航变更

### 移除 mega menu（综合 & 零售）

1. 删除 `index.html` 中 `#megaPanel` 内 `data-for="integrated"` 和 `data-for="retail"` 的 `.mega-content` 块
2. 如果 `#megaPanel` 内没有其他内容，删除整个 mega menu HTML 结构（`#megaPanel`、`#megaScrim`）
3. 删除 `main.js` 中 mega menu 相关的所有 JS 逻辑（`openMega`、`closeMega`、`megaPanel`、`megaScrim` 等）
4. 删除 nav item 上的 `mouseenter` mega menu 绑定

### 导航点击行为变更

- `综合中心标准` 点击 → `switchSection('integrated')`（进入新的分屏落地页）
- `零售中心标准` 点击 → `switchSection('retail')`（进入新的分屏落地页）
- `nav-dark` 状态：`section-integrated` 和 `section-retail` 不需要 `nav-dark`（导航栏保持浅色）

---

## Toast 组件

轻量全局 toast，用于零售中心面板点击反馈：

- HTML：在 `<body>` 底部添加 `<div id="globalToast" class="global-toast"></div>`
- 显示时添加 `.active` class，2秒后自动移除
- 位置：底部居中，`position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%)`
- 样式：深色背景（`#111`），白色文字，圆角，`padding: 12px 24px`

---

## 图片路径

| 用途 | 文件路径 |
|------|---------|
| 综合中心外立面 | `assets/标准封面图/综合中心外立面.jpg` |
| 综合中心室内 | `assets/标准封面图/综合中心室内.jpg` |
| 零售中心外立面 | `assets/标准封面图/零售中心外立面..jpg` |
| 零售中心室内 | `assets/标准封面图/零售中心室内.jpg` |

注意：零售中心外立面文件名有双点（`外立面..jpg`），路径需精确匹配。

---

## 受影响的文件

| 文件 | 变更类型 |
|------|---------|
| `index.html` | 新增 `section-integrated`、`section-retail`；移除 `#megaPanel`、`#megaScrim` |
| `style.css` | 新增 `.split-hero`、`.split-panel` 相关样式 |
| `main.js` | 移除 mega menu 逻辑；新增 toast 逻辑；更新 `switchSection` 的 `nav-dark` 判断 |
