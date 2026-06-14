---
layout: post
title: "不懂设计也能做精美演示：Frontend Slides"
date: 2026-06-14
tags: [开发, 设计, 工具, AI]
header-style: 'text'
subtitle: "让不懂设计的人也能用 AI 创建精美网页演示文稿的工具"
---

> 原网址：https://github.com/zarazhangrui/frontend-slides

---

## 📌 一句话总结

让不懂设计的人也能用 AI 创建精美网页演示文稿的工具

---

## 🎯 它是做什么的？

Frontend Slides 是一个 Claude Code 技能插件，帮助非设计师创建漂亮的网页演示文稿，无需懂 CSS 或 JavaScript。它采用"展示而非讲述"的方式——不会让你用语言描述美学偏好，而是生成视觉预览让你选择喜欢的风格。

你可以：
- 从零开始创建新演示文稿
- 将现有的 PowerPoint 文件转换为网页格式
- 选择 34+ 种精心设计的风格模板
- 生成单个独立的 HTML 文件（无需依赖、无需构建工具）

**独特价值**：
- **零依赖**：单个 HTML 文件包含所有内联 CSS/JS，10 年后仍能运行
- **视觉发现**：生成 3 个风格预览供你选择，不用费尽口舌描述"我要一个现代感强的设计"
- **PPT 转换**：保留所有图片和内容，将 PowerPoint 转为网页
- **反 AI 平庸**：精心策划的风格避免通用的 AI 美学（告别紫色渐变加白色背景）

---

## 🔑 核心概念解读

**Skill（技能/插件）**
- 专业说：打包的工作流程指令，可以被 AI 编程助手读取和执行
- 通俗说：给 Claude 的一套"操作手册"，告诉它如何一步步帮你完成特定任务

**Progressive Disclosure（渐进式披露）**
- 专业说：只在需要时才加载详细信息的设计模式
- 通俗说：像点菜一样，先给你菜单，等你选了菜再上菜，而不是一开始就把所有食材堆出来

**Zero Dependencies（零依赖）**
- 专业说：单文件自包含，无需外部包管理器或构建工具
- 通俗说：一个文件搞定所有，不用 npm install，不用 webpack 配置，直接双击打开就能用

**Visual Style Discovery（视觉风格发现）**
- 专业说：通过生成多个视觉候选让用户选择，而非语言描述
- 通俗说：像理发店给你看发型图集，而不是让你用语言描述"我要一个稍微有点层次但不张扬的发型"

---

## 💡 切实可落地的例子（3 个场景）

### 场景 1：创业者路演准备
- **痛点**：投资人明天要看 BP，你的 PPT 像大学课件，设计感为零
- **方案**：用 Frontend Slides 一小时生成专业路演文稿

**具体实现：**
```bash
# 安装插件
/plugin marketplace add https://github.com/zarazhangrui/frontend-slides
/plugin install frontend-slides@frontend-slides

# 创建演示
/frontend-slides:frontend-slides
> "我要为我的 AI 初创公司做路演，展示市场机会、产品方案和团队背景"
```

- **效果**：从 0 到精美演示文稿，选择"Bold Signal"风格呈现自信活力

---

### 场景 2：讲师技术分享
- **痛点**：技术分享要做 60 页幻灯片，不想学 Figma，不想调半天 CSS
- **方案**：用内容大纲直接生成网页版演示

**具体实现：**
```bash
/frontend-slides:frontend-slides
> "我要做一个关于 Docker 容器技术的技术分享，包含 10 个部分：简介、核心概念、安装、使用场景、最佳实践..."
```

- **效果**：选择"Terminal Green"黑客风格，技术感拉满，演讲当天在浏览器直接播放

---

### 场景 3：把旧 PPT 转成网页版
- **痛点**：公司有一堆老 PPT，想分享在网站上但格式难看
- **方案**：批量转换成网页演示，保留内容换新装

**具体实现：**
```bash
# 前提：安装 Python 和 python-pptx
pip install python-pptx

/frontend-slides:frontend-slides
> "把 presentation.pptx 转成网页演示文稿"
```

- **效果**：原 PPT 内容、图片、备注全部保留，但变成响应式网页，手机也能看

---

## 👥 适合谁用？

✅ 不懂设计但需要做演示的人
✅ 技术分享者、讲师、开发者
✅ 创业者（路演、融资）
✅ 内容创作者（课程、分享）
❌ 专业设计师（自己能做更好的）
❌ 只需偶尔做一页简单幻灯片的人

---

## ⚠️ 注意事项

- 需要安装 Claude Code（免费）
- PPT 转换功能需要 Python 环境
- 部署到 URL 需要注册 Vercel（免费）
- PDF 导出需要 Node.js（自动安装 Playwright）
- 学习曲线：⭐☆☆☆☆（极简，交互式引导）
- 替代方案：Figma（需学设计）、手动写 HTML（需懂前端）

---

## 🎨 包含的风格

**深色主题**：
- Bold Signal — 自信、高冲击力、鲜艳卡片
- Electric Studio — 干净、专业、分屏布局
- Creative Voltage — 充满活力、复古现代、电光蓝+霓虹
- Dark Botanical — 优雅、精致、温暖点缀

**浅色主题**：
- Notebook Tabs — 编辑感、井井有条、彩色标签纸
- Pastel Geometry — 友好、平易近人、垂直药丸
- Split Pastel — 俏皮、现代、双色垂直分割
- Vintage Editorial — 风趣、个性驱动、几何形状

**特色主题**：
- Neon Cyber — 未来感、粒子背景、霓虹发光
- Terminal Green — 开发者专属、黑客美学
- Swiss Modern — 极简、包豪斯风格、几何
- Paper & Ink — 文学感、首字母下沉、引用块

**Bold 模板包**（34 种设计系统）：
- Neo-Grid Bold、Editorial Tri-Tone、Creative Mode
- Broadside、Signal、Vellum、Soft Editorial
- Sakura Chroma、8-Bit Orbit、Retro Windows
- 以及更多精心策划的独特风格...

---

## 🔧 分享你的演示文稿

### 部署到实时 URL
一键将演示文稿部署到永久、可分享的 URL，适用于手机、平板、笔记本：

```bash
bash scripts/deploy.sh ./my-deck/
# 或
bash scripts/deploy.sh ./presentation.html
```

使用 Vercel（免费版）。首次使用时会引导你注册和登录。

### 导出为 PDF
将演示文稿转换为 PDF，用于邮件、Slack、Notion 或打印：

```bash
bash scripts/export-pdf.sh ./my-deck/index.html
bash scripts/export-pdf.sh ./presentation.html ./output.pdf
```

使用 Playwright 以 1920×1080 截取每张幻灯片并合并为 PDF。如需要会自动安装。动画不保留（这是静态快照）。

---

## 📐 设计哲学

这个技能诞生于以下信念：

1. **你不需要成为设计师也能做出美丽的东西**。你只需要对你看到的东西做出反应。
2. **依赖是债务**。单个 HTML 文件可以在 10 年后正常运行。2019 年的 React 项目？祝你好运。
3. **通用即平庸**。每个演示文稿都应该感觉定制的，而不是模板生成的。
4. **注释是善意**。代码应该向未来的你（或任何打开它的人）解释自己。

---

## 🏷️ 标签

开发、设计、工具、AI、演示文稿、Claude Code

