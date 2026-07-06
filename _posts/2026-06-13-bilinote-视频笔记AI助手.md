---
layout: post
title: "让 AI 自动为视频生成笔记：BiliNote"
date: 2026-06-13
tags: [AI, 开发, 工具, 开源, 视频, 笔记]
header-style: 'text'
subtitle: "把 B站、YouTube、抖音等长视频浓缩成精炼的 Markdown 笔记"
---

> 原网址：https://github.com/JefferyHcool/BiliNote

---

## 📌 一句话总结

让 AI 自动为视频生成结构化笔记，把 B站、YouTube、抖音等长视频浓缩成精炼的 Markdown 笔记

---

## 🎯 它是做什么的？

**BiliNote** 是一个开源的"AI 视频速记员"。

想象一下这些场景：
- 你看了一个 2 小时的技术教程，想记笔记但没时间写
- 你收藏了几十个学习视频，但看完就忘
- 你做内容创作，需要快速了解竞品视频的核心观点

**BiliNote 的工作流程**：
1. 你丢给它一个视频链接（B站/YouTube/抖音/本地视频）
2. 它自动下载音频，用 Whisper 转成文字（或直接抓字幕）
3. 用 AI 大模型（GPT/DeepSeek/Qwen 等）分析内容，生成结构化笔记
4. 输出 Markdown 格式，带时间戳跳转、截图、重点标注

**和同类工具的区别**：
| 对比维度 | BiliNote | 飞书妙记 | 阿里通义听悟 |
|---------|---------|---------|------------|
| 开源自托管 | ✅ | ❌ | ❌ |
| 支持任意 AI 模型 | ✅ | ❌ | ❌ |
| 浏览器插件 | ✅ | ❌ | ✅ |
| 本地转写（隐私） | ✅ | ❌ | ❌ |
| AI 问答 | ✅ | ✅ | ✅ |
| 费用 | 开源免费/API 自付 | 按时长付费 | 按时长付费 |

---

## 🔑 核心概念解读

**Whisper 转写**
- 专业说：OpenAI 的语音识别模型，将音频转为文本
- 通俗说：像给视频装了"耳朵"，能听懂人说话并写成文字
- 本地运行的好处：隐私安全，不用把视频传到云端

**RAG 问答（检索增强生成）**
- 专业说：基于笔记内容构建向量索引，让 AI 能查询原文
- 通俗说：像给笔记装了"搜索引擎"，你问"视频第 10 分钟讲了啥"，AI 能翻笔记找答案

**多模态视频理解**
- 专业说：AI 同时分析视频画面和音频内容
- 通俗说：AI 不光"听"说话，还能"看"演示，更懂 PPT、代码演示这些视觉内容

**笔记风格预设**
- 专业说：预定义的 Prompt 模板，控制 AI 输出格式
- 通俗说：像选"写作模板"——学术风、口语风、重点提取风，AI 按这个路数写

---

## 💡 切实可落地的例子（3 个场景）

### 场景 1：学生党 —— 网课速记

**痛点**： Coursera / B站公开课太长，看 2 小时累死，不记笔记又忘得快

**解决方案**：用 BiliNote 自动生成笔记，考前快速复习

**具体步骤**：
```bash
# 1. Docker 一键部署（推荐）
docker pull ghcr.io/jefferyhcool/bilinote:latest
docker run -d -p 80:80 \
  -v bilinote-data:/app/backend/data \
  -v bilinote-config:/app/backend/config \
  --name bilinote \
  ghcr.io/jefferyhcool/bilinote:latest

# 2. 访问 http://localhost，配置 AI 模型（建议用 DeepSeek，便宜）
# 前端 → 模型供应商 → 添加 DeepSeek API Key

# 3. 粘贴 B 站视频链接，选择「学术风格」，点击生成
```

**效果**：
- 2 小时视频 → 5 分钟看完 3000 字笔记
- 时间戳可点击跳转回原视频
- 考前只看笔记，节省 80% 复习时间

---

### 场景 2：内容创作者 —— 竞品分析

**痛点**：同行出了新视频，想快速了解核心观点，不想花 1 小时看完

**解决方案**：用浏览器插件一键生成笔记，快速提取要点

**具体步骤**：
```bash
# 1. 安装浏览器插件（Chrome/Edge/Firefox）
# GitHub Releases 页下载 bilinote-extension.zip

# 2. 打开 YouTube/B站视频页，点击右上角 BiliNote 图标

# 3. 选择「重点提取风格」+ 「多模态理解」，点击生成
```

**效果**：
- 10 分钟看完 1 小时视频的核心观点
- 自动抓取 PPT、代码截图
- 快速判断是否值得深度观看

---

### 场景 3：知识管理党 —— 构建第二大脑

**痛点**：收藏了几百个教程视频，从来不会回头看第二遍

**解决方案**：批量生成笔记，导入 Obsidian/Notion，构建知识库

**具体步骤**：
```bash
# 1. 配置本地 Whisper 转写（隐私安全，免费）
# 前端 → 音频转写配置 → 选择「Fast-Whisper」+ 模型「tiny」（75MB）

# 2. 批量投喂视频链接
# 支持本地视频上传，自动转写 + 笔记生成

# 3. 导出 Markdown，导入 Obsidian
# 前端笔记页面 → 右上角「下载」→ 选择 .md 格式
```

**效果**：
- 几百个视频 → 结构化知识库
- 支持全文搜索，快速找到需要的内容
- AI 问答功能："我所有笔记里，哪里讲了 Docker？"

---

## 👥 适合谁用？

✅ **学生/终身学习者**：网课、教程快速速记
✅ **内容创作者**：竞品分析、灵感收集
✅ **知识管理爱好者**：构建第二大脑
✅ **企业培训**：员工培训视频自动归档
✅ **技术人员**：开源自托管，数据完全可控

❌ **只用看娱乐视频的用户**（杀鸡不用牛刀）
❌ **不想折腾部署的用户**（建议用在线版 bilinote.app）

---

## ⚠️ 注意事项

**费用情况**：
- 开源免费，自托管部署无订阅费
- AI 模型 API 需自付（DeepSeek 约 ¥1/百万字，OpenAI 较贵）
- 本地 Whisper 转写免费（需 GPU 加速，否则慢）
- 在线版 bilinote.app 按次数付费

**学习曲线**：⭐⭐⭐☆☆（Docker 部署需基础技术能力）

**依赖要求**：
- Docker 部署：安装 Docker Desktop
- 源码部署：Python 3.11 + Node.js 20 + FFmpeg
- 桌面版：直接下载 exe/dmg 安装包

**替代方案**：
- **飞书妙记/阿里通义听悟**：不开源，按时长付费
- **YouTube Summary with ChatGPT**：浏览器插件，只支持 YouTube
- **Summarize.tech**：在线版，免费额度小

---

## 🔧 技术亮点

- **后端**：FastAPI + SQLAlchemy（SQLite）
- **前端**：React + Vite + Tailwind CSS
- **音频转写**：Fast-Whisper（本地）/ Groq（云端）/ BCut（B站接口）
- **AI 模型**：OpenAI / DeepSeek / Qwen / 通义千问 等
- **RAG 问答**：向量索引 + Function Calling
- **桌面端**：Tauri（跨平台）
- **浏览器插件**：Chrome/Edge/Firefox MV3
