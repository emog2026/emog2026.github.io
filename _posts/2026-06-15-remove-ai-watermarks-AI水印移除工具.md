---
layout: post
title: "一键清除AI水印和生成标签：remove-ai-watermarks"
date: 2026-06-15
tags: [开发, AI, 图像处理, 开源工具]
header-style: 'text'
subtitle: "一键清除AI生成图片中的可见水印、不可见水印和Made with AI标签"
---

> 原网址：https://github.com/wiltodelta/remove-ai-watermarks

---

📌 **一句话总结**
一键清除AI生成图片中的可见水印、不可见水印和"Made with AI"标签

🎯 **它是做什么的？**

remove-ai-watermarks 是一个强大的 AI 水印移除工具，支持主流 AI 平台：

- **可见水印移除**：Google Gemini 的闪光图标、豆包AI的"豆包AI生成"、即梦AI的"★ 即梦AI"、Samsung Galaxy AI 的"✦ Contenuti generati dall'AI"
- **不可见水印移除**：Google SynthID、OpenAI 内容水印、Stable Diffusion 等的隐式水印
- **元数据清理**：C2PA 来源凭证、EXIF、IPTC、"Made with AI"标签

提供命令行工具、Python API，以及在线版 raiw.cc（无需安装，无需 GPU）

🔑 **核心概念解读**

**SynthID**
- 专业说：Google DeepMind 开发的不可见水印技术，嵌入多比特载荷到图像中
- 通俗说：在图片里藏一个看不见的"数字身份证"，即使裁剪、压缩后仍然存在

**C2PA Content Credentials**
- 专业说：内容凭证倡议，一种加密的来源证明标准
- 通俗说：像给图片盖一个"数字公章"，记录是谁用什么工具生成的

**Reverse-alpha blending**
- 专业说：逆向 Alpha 混合，通过已知 Alpha 通道恢复原始像素
- 通俗说：知道水印是"半透明覆盖"的，就能用数学公式把原始像素算回来，而不是靠猜测

💡 **切实可落地的例子**

**场景 1：内容创作者处理 AI 生成图片**
- 痛点：用 AI 生成了图片，但到处都是水印和标签，发到社交平台会显示"Made with AI"
- 方案：使用在线版或 CLI 一键清理
- 具体实现：
```bash
# 访问在线版，无需安装
https://raiw.cc

# 或使用 CLI（推荐用于批量处理）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

scoop install pipx
pipx ensurepath

pipx install git+https://github.com/wiltodelta/remove-ai-watermarks.git

# 清理单张图片（移除所有水印和元数据）
remove-ai-watermarks all image.png -o clean.png

# 批量处理整个文件夹
remove-ai-watermarks batch ./ai-images/ --mode all
```
- 效果：图片干净无痕，不会被平台自动标记

**场景 2：摄影师误标处理**
- 痛点：真实照片只是用 AI 做了轻微修图（比如去杂物），却被平台标注为"AI生成"
- 方案：移除过度反应的 AI 元数据标签
- 具体实现：
```bash
# 先检查图片有什么水印/元数据
remove-ai-watermarks identify my-photo.jpg

# 只移除元数据（保留原始像素质量）
remove-ai-watermarks metadata my-photo.jpg --remove -o clean.jpg
```
- 效果：保留照片原始质量，移除错误的"AI生成"标签

**场景 3：批量处理 Gemini 生成图片**
- 痛点：用 Google Gemini 生成了大量图片，每张都有可见的闪光图标和不可见的 SynthID
- 方案：批量移除 Gemini 的两种水印
- 具体实现：
```bash
# 移除可见的闪光图标（CPU，快速）
remove-ai-watermarks visible gemini-output.png -o no-visible.png

# 移除不可见的 SynthID 水印（需要 GPU，或用在线版）
remove-ai-watermarks invisible gemini-output.png -o no-invisible.png --strength 0.30

# 一键完成（可见+不可见+元数据）
remove-ai-watermarks all gemini-output.png -o clean.png

# 批量处理
remove-ai-watermarks batch ./gemini-outputs/ --mode all
```
- 效果：100 张图片只需几分钟全部清理完成

👥 **适合谁用？**

✅ 使用 AI 工具生成图片的内容创作者、设计师
✅ 需要批量处理大量 AI 图片的工作室
✅ 被误标为"AI生成"的真实照片摄影师
✅ 研究 AI 水印技术的安全研究人员

❌ 想要完全匿名化 AI 生成内容的人（无法移除服务端记录）
❌ 用于欺诈或非法用途（法律风险）

⚠️ **注意事项**

- **法律风险**：中国和印度等地方法规明确禁止移除 AI 标签；使用时需遵守当地法律
- **技术限制**：不可见水印移除使用 AI 重生成，会轻微损失图像细节
- **在线版**：raiw.cc 的基础功能免费，不可见水印移除需要小额付费
- **学习曲线**：⭐⭐☆☆☆（单命令操作，10 分钟上手）
