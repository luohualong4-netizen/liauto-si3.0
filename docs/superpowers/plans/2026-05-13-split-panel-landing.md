# 分屏落地页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为综合中心标准和零售中心标准各新增全屏分屏落地页，左右面板分别展示外立面和室内效果图，hover 时以 9:1 比例展开，点击跳转到对应详情页；同时移除 mega menu 导航。

**Architecture:** 纯 CSS `:has()` 驱动 flex 比例过渡（无 JS 事件监听），新增两个独立 section（`section-integrated`、`section-retail`），更新 main.js 移除 mega menu 逻辑并绑定面板点击事件。

**Tech Stack:** Vanilla HTML/CSS/JS，无构建工具，无测试框架。

---

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `style.css` | 追加 `.split-hero` / `.split-panel` 样式 + toast 样式（约 80 行） |
| `index.html` | 新增 `section-integrated`；替换 `section-retail` 内容；删除 mega menu HTML；新增 `#globalToast` |
| `main.js` | 删除 mega menu 逻辑（约 80 行）；更新 navItems click listener；更新 `lpBtnIntegrated` 目标；新增面板点击 + toast 函数 |

---

## Task 1: 追加分屏面板 CSS

**Files:**
- Modify: `style.css`（在文件末尾追加，当前最后一行是 1315）

- [ ] **Step 1: 在 style.css 末尾追加以下样式**

在 `style.css` 文件最后一行之后追加：

```css

/* ═══════════════════════════════════════
   SPLIT PANEL HERO
═══════════════════════════════════════ */
.split-hero {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.split-panel {
  position: relative;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
  transition: flex 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.split-panel-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.split-panel:hover .split-panel-bg {
  transform: scale(1.03);
}

.split-panel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.05) 0%,
    rgba(0,0,0,0.25) 50%,
    rgba(0,0,0,0.6) 100%
  );
}

.split-panel-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #fff;
  z-index: 2;
  text-align: center;
  transition: opacity 0.4s ease;
}

.split-panel-title {
  font-family: var(--font-serif);
  font-size: clamp(22px, 2.2vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
  transition: font-size 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.split-panel-desc {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255,255,255,0.8);
  margin-top: 10px;
  max-width: 320px;
  line-height: 1.6;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.35s ease 0.08s, transform 0.35s ease 0.08s;
}

.split-panel-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 10px 24px;
  border: 1.5px solid rgba(255,255,255,0.55);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.35s ease 0.14s, transform 0.35s ease 0.14s,
              background 0.2s ease, border-color 0.2s ease;
}

.split-panel-cta:hover {
  background: rgba(255,255,255,0.15);
  border-color: #fff;
}

/* ── :has() hover expansion ── */
.split-hero:has(.split-panel:first-child:hover) .split-panel:first-child { flex: 9; }
.split-hero:has(.split-panel:first-child:hover) .split-panel:last-child  { flex: 1; }
.split-hero:has(.split-panel:last-child:hover)  .split-panel:first-child { flex: 1; }
.split-hero:has(.split-panel:last-child:hover)  .split-panel:last-child  { flex: 9; }

/* expanded panel: reveal desc + cta, enlarge title */
.split-hero:has(.split-panel:hover) .split-panel:hover .split-panel-title {
  font-size: clamp(28px, 3vw, 44px);
}
.split-hero:has(.split-panel:hover) .split-panel:hover .split-panel-desc,
.split-hero:has(.split-panel:hover) .split-panel:hover .split-panel-cta {
  opacity: 1;
  transform: translateY(0);
}

/* shrunk sibling: fade content */
.split-hero:has(.split-panel:first-child:hover) .split-panel:last-child  .split-panel-content,
.split-hero:has(.split-panel:last-child:hover)  .split-panel:first-child .split-panel-content {
  opacity: 0.35;
}

/* disabled panels (retail) */
.split-panel--disabled {
  cursor: default;
}
.split-panel--disabled .split-panel-cta {
  display: none;
}

/* ── Global Toast ── */
.global-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(12px);
  background: #111;
  color: #fff;
  font-size: 14px;
  font-family: var(--font);
  padding: 12px 24px;
  border-radius: 100px;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
  white-space: nowrap;
}
.global-toast.active {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

- [ ] **Step 2: 在浏览器打开 index.html，确认无 CSS 报错**（打开 DevTools → Console，应无红色错误）

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: add split-panel hero and toast CSS"
```

---

## Task 2: 新增 section-integrated HTML

**Files:**
- Modify: `index.html`（在 `<!-- ═══ SECTION 2: 外立面标准 ═══ -->` 注释之前插入新 section）

当前 `section-facade` 在 index.html 第 164 行附近，注释行为 `<!-- ═══ SECTION 2: 外立面标准 ═══ -->`。

- [ ] **Step 1: 在 `<!-- ═══ SECTION 2: 外立面标准 ═══ -->` 注释行之前插入以下 HTML**

```html
  <!-- ═══ SECTION: 综合中心标准 落地页 ═══ -->
  <section class="section" id="section-integrated">
    <div class="split-hero">
      <div class="split-panel" id="splitIntFacade">
        <img class="split-panel-bg" src="assets/标准封面图/综合中心外立面.jpg" alt="综合中心外立面">
        <div class="split-panel-overlay"></div>
        <div class="split-panel-content">
          <div class="split-panel-title">外立面标准</div>
          <div class="split-panel-desc">交互式建筑立面 · 标识 / 灯光 / 横楣 / 幕墙 / 门斗</div>
          <div class="split-panel-cta">进入 →</div>
        </div>
      </div>
      <div class="split-panel" id="splitIntInterior">
        <img class="split-panel-bg" src="assets/标准封面图/综合中心室内.jpg" alt="综合中心室内">
        <div class="split-panel-overlay"></div>
        <div class="split-panel-content">
          <div class="split-panel-title">室内标准</div>
          <div class="split-panel-desc">交互式室内标准 · 空间 / 材料 / 设计</div>
          <div class="split-panel-cta">进入 →</div>
        </div>
      </div>
    </div>
  </section>

```

- [ ] **Step 2: 视觉验证**

刷新浏览器，在 Console 执行：
```js
document.getElementById('section-integrated').classList.add('active');
document.getElementById('section-home').classList.remove('active');
```
预期：页面显示左右各一半的两张图片，标题居中可见，鼠标悬停时一侧展开至约 90%、另一侧缩至约 10%，desc 和"进入 →"按钮淡入。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add section-integrated split-panel landing page"
```

---

## Task 3: 替换 section-retail 内容

**Files:**
- Modify: `index.html`（`section-retail` 当前在第 422–429 行）

- [ ] **Step 1: 将 `section-retail` 内的全部内容替换为分屏结构**

定位到：
```html
  <!-- ═══ SECTION 4: 零售中心标准（占位）═══ -->
  <section class="section" id="section-retail">
    <div class="retail-placeholder">
      <p class="retail-ph-eyebrow">RETAIL CENTER</p>
      <h2 class="retail-ph-title">零售中心标准</h2>
      <p class="retail-ph-sub">内容建设中，敬请期待</p>
    </div>
  </section>
```

替换为：
```html
  <!-- ═══ SECTION: 零售中心标准 落地页 ═══ -->
  <section class="section" id="section-retail">
    <div class="split-hero">
      <div class="split-panel split-panel--disabled">
        <img class="split-panel-bg" src="assets/标准封面图/零售中心外立面..jpg" alt="零售中心外立面">
        <div class="split-panel-overlay"></div>
        <div class="split-panel-content">
          <div class="split-panel-title">外立面标准</div>
          <div class="split-panel-desc">零售中心外立面设计规范</div>
        </div>
      </div>
      <div class="split-panel split-panel--disabled">
        <img class="split-panel-bg" src="assets/标准封面图/零售中心室内.jpg" alt="零售中心室内">
        <div class="split-panel-overlay"></div>
        <div class="split-panel-content">
          <div class="split-panel-title">室内标准</div>
          <div class="split-panel-desc">零售中心室内设计规范</div>
        </div>
      </div>
    </div>
  </section>
```

注意：零售中心外立面文件名为 `零售中心外立面..jpg`（含两个点），路径必须精确。

- [ ] **Step 2: 视觉验证**

刷新浏览器，在 Console 执行：
```js
document.getElementById('section-retail').classList.add('active');
document.getElementById('section-home').classList.remove('active');
```
预期：显示零售中心两张图，hover 动画正常（展开/收缩），无"进入 →"按钮。点击面板暂无反应（toast 在 Task 5 绑定）。

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: replace section-retail with split-panel layout"
```

---

## Task 4: 移除 mega menu HTML，新增 toast 元素

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 删除 mega menu HTML 块**

定位并删除以下整块内容（index.html 第 45–77 行附近）：

```html
  <!-- ═══ MEGA MENU ═══ -->
  <div class="mega-scrim" id="megaScrim"></div>
  <div class="mega-panel" id="megaPanel" style="display:none">

    <!-- 综合中心标准 -->
    <div class="mega-content" data-for="integrated">
      <div class="mega-two-col">
        <div class="mega-col-card" id="megaGoFacade">
          <div class="mega-col-label">外立面标准</div>
          <div class="mega-col-desc">交互式外立面标准 · 标识 / 灯光 / 横楣 / 幕墙 / 门斗</div>
        </div>
        <div class="mega-col-card" id="megaGoInterior">
          <div class="mega-col-label">室内标准</div>
          <div class="mega-col-desc">交互式室内标准 · 空间 / 材料 / 设计</div>
        </div>
      </div>
    </div>

    <!-- 零售中心标准 -->
    <div class="mega-content" data-for="retail">
      <div class="mega-two-col">
        <div class="mega-col-card disabled">
          <div class="mega-col-label">外立面标准</div>
          <div class="mega-col-desc">即将推出</div>
        </div>
        <div class="mega-col-card disabled">
          <div class="mega-col-label">室内标准</div>
          <div class="mega-col-desc">即将推出</div>
        </div>
      </div>
    </div>

  </div>
```

- [ ] **Step 2: 在 `<script src="data.js">` 之前（body 末尾脚本块上方）添加 toast 元素**

定位：
```html
  <script src="data.js"></script>
```

在其正上方插入一行：
```html
  <div id="globalToast" class="global-toast"></div>
```

- [ ] **Step 3: 确认 index.html 不含 `megaPanel`、`megaScrim` 字符串**

```bash
grep -n "megaPanel\|megaScrim\|mega-panel\|mega-scrim" index.html
```
预期：无输出（0 匹配）。

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: remove mega menu HTML, add global toast element"
```

---

## Task 5: 更新 main.js

**Files:**
- Modify: `main.js`（第 1–145 行为主要改动区域）

此任务分三个子步骤，逐一完成。

### 5a: 移除 mega menu 全部 JS 逻辑

- [ ] **Step 1: 删除 mega menu 相关代码块**

删除 `main.js` 中以下全部内容（第 55–136 行）：

```js
  // ─── Mega Menu ───────────────────────────────────────────
  const megaPanel = document.getElementById('megaPanel');
  const megaScrim = document.getElementById('megaScrim');
  let megaCloseTimer = null;

  function resetL3Anim(content) {
    content.querySelectorAll('.mega-l3-item').forEach(el => {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    });
  }

  function initCascade(content) {
    const first = content.querySelector('.mega-l2-item');
    if (!first) return;
    content.querySelectorAll('.mega-l2-item').forEach(i => i.classList.remove('active'));
    first.classList.add('active');
    const key = first.dataset.l3;
    content.querySelectorAll('.mega-l3-content').forEach(c => c.classList.remove('active'));
    const l3 = content.querySelector(`.mega-l3-content[data-l3="${key}"]`);
    if (l3) { resetL3Anim(l3); l3.classList.add('active'); }
  }

  function openMega(menuKey) {
    clearTimeout(megaCloseTimer);
    megaPanel.style.display = 'block';
    const allContents = megaPanel.querySelectorAll('.mega-content');
    const target = megaPanel.querySelector(`.mega-content[data-for="${menuKey}"]`);
    if (!target) return;
    allContents.forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
    requestAnimationFrame(() => {
      target.classList.add('active');
      target.style.display = 'block';
      megaPanel.classList.add('open');
      megaScrim.classList.add('show');
      if (menuKey === 'interior') initCascade(target);
    });
  }

  function closeMega() {
    megaCloseTimer = setTimeout(() => {
      megaPanel.classList.remove('open');
      megaScrim.classList.remove('show');
      megaPanel.querySelectorAll('.mega-content').forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });
      megaPanel.style.display = 'none';
    }, 180);
  }

  navItems.forEach(btn => {
    const key = btn.dataset.section;
    if (key === 'integrated' || key === 'retail') {
      btn.addEventListener('mouseenter', () => openMega(key));
      btn.addEventListener('mouseleave', closeMega);
    }
  });
  megaPanel.addEventListener('mouseenter', () => clearTimeout(megaCloseTimer));
  megaPanel.addEventListener('mouseleave', closeMega);
  megaScrim.addEventListener('click', closeMega);

  // L2 hover → switch L3
  megaPanel.addEventListener('mouseover', e => {
    const l2 = e.target.closest('.mega-l2-item');
    if (!l2) return;
    const content = l2.closest('.mega-content');
    if (!content || l2.classList.contains('active')) return;
    content.querySelectorAll('.mega-l2-item').forEach(i => i.classList.remove('active'));
    l2.classList.add('active');
    const oldL3 = content.querySelector('.mega-l3-content.active');
    if (oldL3) oldL3.classList.remove('active');
    const l3 = content.querySelector(`.mega-l3-content[data-l3="${l2.dataset.l3}"]`);
    if (l3) { resetL3Anim(l3); l3.classList.add('active'); }
  });

  // Mega col-cards → navigate to sub-sections
  const megaGoFacade = document.getElementById('megaGoFacade');
  const megaGoInterior = document.getElementById('megaGoInterior');
  if (megaGoFacade) megaGoFacade.addEventListener('click', () => { closeMega(); switchSection('facade'); });
  if (megaGoInterior) megaGoInterior.addEventListener('click', () => { closeMega(); switchSection('interior'); });
```

### 5b: 修复 navItems click listener

- [ ] **Step 2: 将 navItems click listener（第 48–53 行）中的 `closeMega()` 调用删除**

当前代码：
```js
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      closeMega();
      switchSection(btn.dataset.section);
    });
  });
```

替换为：
```js
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.section);
    });
  });
```

### 5c: 修复 lpBtnIntegrated 目标 + 新增面板点击和 toast

- [ ] **Step 3: 将 lpBtnIntegrated 的跳转目标从 `'facade'` 改为 `'integrated'`**

当前代码（第 143 行）：
```js
  if (lpBtnIntegrated) lpBtnIntegrated.addEventListener('click', () => switchSection('facade'));
```

替换为：
```js
  if (lpBtnIntegrated) lpBtnIntegrated.addEventListener('click', () => switchSection('integrated'));
```

- [ ] **Step 4: 在 Landing page buttons 块之后（约第 145 行之后）追加以下代码**

```js
  // ─── Split panel clicks ───────────────────────────────────
  function showToast(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
  }

  const splitIntFacade = document.getElementById('splitIntFacade');
  const splitIntInterior = document.getElementById('splitIntInterior');
  if (splitIntFacade) splitIntFacade.addEventListener('click', () => switchSection('facade'));
  if (splitIntInterior) splitIntInterior.addEventListener('click', () => switchSection('interior'));

  document.querySelectorAll('#section-retail .split-panel--disabled').forEach(panel => {
    panel.addEventListener('click', () => showToast('零售中心标准建设中，敬请期待'));
  });
```

- [ ] **Step 5: 确认 main.js 不含 `closeMega`、`openMega`、`megaPanel`、`megaScrim` 字符串**

```bash
grep -n "closeMega\|openMega\|megaPanel\|megaScrim" main.js
```
预期：无输出（0 匹配）。

- [ ] **Step 6: Commit**

```bash
git add main.js
git commit -m "feat: remove mega menu JS, add split panel click handlers and toast"
```

---

## Task 6: 端对端验证与收尾 Commit

- [ ] **Step 1: 浏览器全流程验证**

打开 `index.html`，按以下路径逐一验证：

| 操作 | 预期结果 |
|------|---------|
| 点击导航"综合中心标准" | 进入分屏落地页，两张图各占 50% |
| hover 左侧（外立面） | 左侧扩至约 90%，右侧缩至约 10%，desc 和"进入 →"淡入 |
| hover 右侧（室内） | 右侧扩至约 90%，左侧缩至约 10% |
| 点击左侧面板 | 跳转到外立面标准页（`section-facade` 激活） |
| 点击右侧面板 | 跳转到室内标准页（`section-interior` 激活） |
| 导航返回，点击"零售中心标准" | 进入零售分屏落地页，视觉与综合中心一致 |
| 点击零售任意面板 | 页面底部出现 toast"零售中心标准建设中，敬请期待"，2.5 秒后消失 |
| 首页"探索综合中心标准"按钮 | 进入综合中心分屏落地页（非直接跳外立面） |
| hover 导航"综合中心标准"或"零售中心标准" | 不弹出 mega menu |

- [ ] **Step 2: 如有视觉问题，修复后再 commit**

- [ ] **Step 3: 最终 commit（如 Task 1–5 均已单独 commit，此步可跳过）**

```bash
git add index.html style.css main.js
git commit -m "feat: split-panel landing pages for integrated & retail centers"
```
