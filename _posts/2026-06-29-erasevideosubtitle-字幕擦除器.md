---
layout: post
title: "智能擦除视频硬字幕的 Web 系统：EraseVideoSubtitle"
date: 2026-06-29
tags: [AI, 视频, 字幕, Next.js, TypeScript, 火山引擎]
header-style: 'text'
subtitle: "智能擦除视频硬字幕，完美还原背景的 Web 系统"
---

> 原网址：https://github.com/guochaopeng110-maker/EraseVideoSubtitle

---

## 📌 一句话总结
**智能擦除视频硬字幕，完美还原背景的 Web 系统**

---

## 🎯 它是做什么的？

**EraseVideoSubtitle**（字幕擦除器）是一款专为视频创作者、搬运者和翻译人员打造的**智能硬字幕擦除 Web 系统**。

想象一下：
- 你下载了带硬字幕的日本动画，想去除字幕重新翻译
- 你搬运的视频有水印字幕，影响观看体验
- 你需要字幕干净的原始素材进行二次创作
- 传统方法要手动逐帧修补，耗时数小时

**EraseVideoSubtitle 解决这些问题：**
- 🎯 **AI 智能擦除**：自动检测并消除硬字幕，无需手动处理
- 🖼️ **背景完美还原**：采用深度补全（Inpainting）算法，像素级融合背景
- 🎨 **极致 UI 设计**：暗黑霓虹磨砂玻璃风格，科技感十足
- 🔄 **双播放器对比**：左右同步播放源视频与去字幕产物
- ⚡ **串行轮询引擎**：FIFO 队列管理，自适应退避算法
- 🌐 **内网穿透支持**：Cpolar 隧道，本地开发也能公网访问
- 🧹 **自动清理**：后台定时清理临时文件，永不溢满
- 🧪 **Mock 模式**：零配置演示，不消耗 API 额度

**核心特点：基于 Next.js 14 全栈架构 + 火山引擎 MediaKit AI**

---

## 🔑 核心概念解读

**Hard Subtitles（硬字幕）**
- **专业说**：直接烧录在视频像素中的字幕，无法通过关闭字幕轨道隐藏
- **通俗说**：像把字"印"在画面上，关不掉的永久字幕

**Inpainting（深度补全/图像修复）**
- **专业说**：利用 AI 模型根据周围像素智能填充被遮盖区域的算法
- **通俗说**：像 Photoshop 的"内容识别填充"，AI 自动补全背景

**Neon Glassmorphism（霓虹磨砂玻璃）**
- **专业说**：结合毛玻璃拟态与霓虹边缘发光的 UI 设计风格
- **通俗说**：像磨砂玻璃加上发光边框，暗黑科技感十足

**FIFO Polling（串行轮询）**
- **专业说**：先进先出的任务队列轮询机制，每次仅处理一个任务
- **通俗说**：像排队买票，一个一个来，避免拥挤

**Adaptive Backoff（自适应退避）**
- **专业说**：根据任务执行阶段动态调整轮询频率的算法
- **通俗说**：刚开始频繁查看快不快，后期降低频率省资源

**Cpolar Tunneling（内网穿透）**
- **专业说**：通过反向隧道将本地服务映射到公网可访问 URL
- **通俗说**：给本地电脑开个"公网门牌号"，外网能访问

---

## 💡 切实可落地的例子（3个场景）

### **场景 1：视频创作者——去除硬字幕重新翻译**
- **痛点**：下载的日本动画有硬字幕，想清理后自己翻译
- **解决方案**：用 EraseVideoSubtitle 一键擦除，获得干净素材
- **具体实现步骤**：
  ```bash
  # 1. 克隆项目
  git clone https://github.com/guochaopeng110-maker/EraseVideoSubtitle.git
  cd EraseVideoSubtitle

  # 2. 安装依赖
  npm install

  # 3. 配置环境变量（.env）
  # 获取火山引擎 API Key：https://www.volcengine.com/
  echo "VOLCENGINE_API_KEY=your_key_here" > .env

  # 4. 启动服务
  npm run dev

  # 5. 浏览器访问 http://localhost:3000
  # 上传带字幕视频 → 选择 Pro Mode → 等待处理 → 下载无字幕视频
  ```
- **效果**：AI 自动擦除字幕，背景完美还原，可直接重新翻译

### **场景 2：搬运者——清理水印字幕**
- **痛点**：搬运的视频有平台水印字幕，影响观感和合规性
- **解决方案**：批量处理视频，快速清理所有硬字幕
- **具体实现步骤**：
  ```bash
  # 1. 部署到生产环境
  npm run build
  npm start

  # 2. 配置内网穿透（火山引擎需要公网 URL）
  # 下载 Cpolar：https://www.cpolar.com/
  # 运行隧道：cpolar http 3000
  # 获得：https://xxxx.cpolar.io

  # 3. 更新 .env
  echo "NEXT_PUBLIC_FORCE_CPOLAR_URL=https://xxxx.cpolar.io" >> .env

  # 4. 批量上传视频到 Web 界面
  # 系统自动排队处理，后台轮询状态
  # 完成后自动下载 Cleaned Video
  ```
- **效果**：批量自动处理，无需人工干预，字幕完全消除

### **场景 3：开发者——本地开发与 Mock 测试**
- **痛点**：不想消耗 API 额度，只想测试 UI 和交互
- **解决方案**：开启 Mock 模式，零成本演示
- **具体实现步骤**：
  ```bash
  # 1. 启动开发服务（无需配置 API Key）
  npm run dev

  # 2. 浏览器访问 http://localhost:3000

  # 3. 点击左下角 "Mock Mode" 开关

  # 4. 上传任意视频
  # 系统模拟完整流程：
  # - 上传进度条
  # - 任务创建
  # - 状态轮询（排队 → 处理中 → 完成）
  # - 双播放器对比展示

  # 完整体验，零成本！
  ```
- **效果**：无需 API Key，完整体验所有功能，适合演示和前端开发

---

## 👥 适合谁用？

✅ **视频创作者**：需要清理硬字幕进行二次创作
✅ **内容搬运者**：去除水印字幕，提升观感
✅ **翻译人员**：获取干净原始素材，重新翻译
✅ **前端开发者**：学习 Next.js 14 全栈架构
✅ **AI 应用开发者**：参考火山引擎 AI 集成实践

❌ **只需去除软字幕的人**（直接关掉字幕轨道就行）
❌ **完全不懂技术的人**（需要 Node.js、环境配置等基础）

---

## ⚠️ 注意事项

- **费用**：
  - 软件完全免费开源（MIT 许可）
  - 火山引擎 MediaKit API 按使用量收费（标准版约 ¥0.01-0.05/分钟视频）
  - Mock 模式完全免费
- **技术门槛**：
  - 基础使用：⭐⭐☆☆☆（Web 界面拖拽上传）
  - 本地部署：⭐⭐⭐☆☆（需要 Node.js、npm）
  - 生产部署：⭐⭐⭐⭐☆（需要服务器、域名、内网穿透）
- **系统要求**：
  - Node.js 18.0.0+
  - 现代浏览器（Chrome、Firefox、Safari、Edge）
- **替代方案**：
  - 商业工具：万兴优转、HitPaw（更简单但收费）
  - 开源工具：Video-Inpaint、PyTorch 实现（需编程）
  - 手动修补：After Effects、DaVinci（耗时巨大）
- **学习资源**：
  - GitHub：https://github.com/guochaopeng110-maker/EraseVideoSubtitle
  - 火山引擎 MediaKit：https://www.volcengine.com/
  - Cpolar 内网穿透：https://www.cpolar.com/
  - Next.js 文档：https://nextjs.org/docs

---

## 🎁 技术特点

| 特性 | 说明 |
|------|------|
| **Next.js 14 全栈** | App Router 架构，React 18 + TypeScript 5 |
| **双模式擦除** | Standard（快速）+ Pro（深度 Inpainting） |
| **同步双播放器** | 左右对比，毫秒级同步，拖拽对比 |
| **FIFO 轮询引擎** | 串行队列，自适应退避，8 分钟死锁保护 |
| **Cpolar 穿透** | 一键内网穿透，本地变公网 |
| **自动清理** | 15 分钟定时扫描，2 小时自动删除 |
| **Mock 模式** | 零配置演示，正态分布拟真耗时 |
| **安全凭证** | API Key 存浏览器 localStorage，后端代理转发 |

### 核心模块设计

| 模块 | 职责 |
|------|------|
| **StorageAdapter** | 文件存取抽象接口（本地默认 `LocalDiskStorageAdapter`） |
| **VolcengineClient** | 火山引擎 MediaKit API 签名鉴权客户端 |
| **PollingEngine** | 串行及自适应轮询逻辑 |
| **CleanupScheduler** | 生命周期文件定时清理器 |

---

## 🎨 界面特色

**Neon Glassmorphism Dark Mode**
- 毛玻璃拟态（Glassmorphism）
- 霓虹边缘发光（Neon Glow）微交互
- 响应式弹性布局
- 高级多态过渡动画
- 仪表盘侧边栏集成历史记录

---

## 🔧 技术栈

**前端核心**：React 18, Next.js 14 (App Router), TypeScript 5
**样式方案**：CSS Modules, Vanilla CSS（定制毛玻璃与霓虹滤镜）
**后端架构**：Next.js Route Handlers (Edge & Node 兼容)
**视频控制**：双实例 React HTML5 Video Synchronization Engine
**AI 服务**：火山引擎 MediaKit 字幕擦除 API

---

## 📐 核心架构流程

```
用户上传视频
    ↓
POST /api/upload（本地存储）
    ↓
POST /api/tasks（创建擦除任务）
    ↓
VolcengineClient（注入安全凭证）
    ↓
火山引擎 API（传入 Cpolar 公网 URL）
    ↓
异步处理（排队 → AI 擦除 → 生成产物）
    ↓
FIFO 轮询（自适应检查状态）
    ↓
GET /api/tasks/[id]（获取 Cleaned Video）
    ↓
双播放器同步对比展示
```

---

## 🚀 快速开始

### 1️⃣ 克隆与安装
```bash
git clone https://github.com/guochaopeng110-maker/EraseVideoSubtitle.git
cd EraseVideoSubtitle
npm install
```

### 2️⃣ 配置环境变量（`.env`）
```env
# 火山引擎 API Key（可选，Mock 模式不需要）
VOLCENGINE_API_KEY=your_api_key_here

# 临时文件清理配置
TEMP_FILE_MAX_AGE_MINS=120
CLEANUP_CRON_INTERVAL_MINS=15

# Cpolar 公网代理地址（本地开发需要）
NEXT_PUBLIC_FORCE_CPOLAR_URL=https://your-cpolar.cpolar.io
```

### 3️⃣ 启动服务
```bash
npm run dev
# 访问 http://localhost:3000
```

### 4️⃣ 开启 Mock 模式（零配置演示）
- 点击左下角 "Mock Mode" 开关
- 上传任意视频体验完整流程

---

## 🌐 内网穿透配置（Cpolar）

火山引擎需要公网 URL 读取视频：

1. **下载 Cpolar**：https://www.cpolar.com/
2. **运行隧道**：
   ```bash
   cpolar http 3000
   # 获得：https://xxxx.cpolar.io
   ```
3. **更新 .env**：
   ```env
   NEXT_PUBLIC_FORCE_CPOLAR_URL=https://xxxx.cpolar.io
   ```
4. **重启服务**：本地即可化身公网环境

---

## 📚 延伸阅读

- [EraseVideoSubtitle GitHub](https://github.com/guochaopeng110-maker/EraseVideoSubtitle)
- [火山引擎 MediaKit](https://www.volcengine.com/)
- [Cpolar 内网穿透](https://www.cpolar.com/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Inpainting 算法原理](https://en.wikipedia.org/wiki/Inpainting)

---
