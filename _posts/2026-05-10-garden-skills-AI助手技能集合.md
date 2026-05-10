---
layout: post
title: "给 AI 编程助手装上专业插件，让它们会设计、做视频、画图：garden-skills"
date: 2026-05-10
tags: [开发, AI, 自动化, 设计]
header-style: 'text'
subtitle: "给 AI 编程助手装上专业插件，让它们会做网页设计、PPT 制作、图片生成本地知识库检索"
---

> 原网址：https://github.com/ConardLi/garden-skills

---

📌 **一句话总结**：给 AI 编程助手装上"专业插件"，让它们会做网页设计、PPT 制作、图片生成本地知识库检索

🎯 **它是做什么的？**

garden-skills 是一个开源的 AI Skills（技能）集合，专门为 Claude Code、Cursor、Codex 等编程型 AI 助手设计。就像给手机安装 APP 一样，这些技能能让 AI 从"只会写代码"进化成"能完成专业任务"的多面手。

目前包含 4 个核心技能：
- **web-video-presentation**：把文章/脚本变成可录制成视频的网页 PPT
- **web-design-engineer**：让 AI 按专业流程设计网页，而不是随便写写 HTML
- **gpt-image-2**：用 AI 生成海报、UI 草图、技术图等图片
- **kb-retriever**：从本地文件（PDF/Excel/Markdown）中精准检索知识

🔑 **核心概念解读**

**Skill（技能）**
- 专业说：自包含的 AI 能力扩展包，由 SKILL.md 文件定义
- 通俗说：就像游戏的"DLC"，让基础版 AI 解锁新技能树
- 生活中的类比：Photoshop 的滤镜插件，装了才能做特效

**Agent Skills 规范**
- 专业说：Anthropic 制定的技能标准格式（YAML frontmatter + 指令）
- 通俗说：所有 AI 助手都能读懂的"通用说明书格式"
- 生活中的类比：USB 接口标准，谁家的设备都能插

**Runtime Mode（运行模式）**
- 专业说：技能在不同环境下的执行方式（本地/委托/纯提示）
- 通俗说：同一个 APP 在手机/平板/电脑上的不同运行方式
- 生活中的类比：Netflix 可以在电视上看，也可以投屏看

💡 **切实可落地的例子**

**场景 1：技术博主想录教程视频**
- 痛点：用 PowerPoint 做 PPT 太丑，用专业视频软件太复杂
- 方案：用 `web-video-presentation` 技能，把文章转成 16:9 的网页演示
- 具体实现步骤：
  ```bash
  # 安装技能
  npx skills add ConardLi/garden-skills -s web-video-presentation
  
  # 在 Claude Code 中调用
  /web-video-presentation "把这篇博客转成 10 分钟的视频脚本"
  ```
- 效果：AI 自动生成带分镜、可点击翻页、适合录屏的网页 PPT

**场景 2：创业公司快速出产品原型**
- 痛点：找 UI 设计师贵且慢，自己设计又丑
- 方案：用 `web-design-engineer` 技能，让 AI 按专业流程设计
- 具体实现步骤：
  ```bash
  # 安装技能
  npx skills add ConardLi/garden-skills -s web-design-engineer
  
  # 在 Cursor 中调用
  "帮我设计一个 SaaS 仪表盘，按 web-design-engineer 的六步流程"
  ```
- 效果：从需求分析 → 设计系统 → v0 原型 → 完整实现，一步到位

**场景 3：团队搭建本地知识库**
- 痛点：公司文档散落在各处，每次找资料像大海捞针
- 方案：用 `kb-retriever` 技能，让 AI 从本地文件精准检索
- 具体实现步骤：
  ```bash
  # 安装技能
  npx skills add ConardLi/garden-skills -s kb-retriever
  
  # 创建 knowledge 目录
  mkdir knowledge
  cp *.pdf *.md *.xlsx knowledge/
  
  # 在 Claude Code 中询问
  "我们在 knowledge 目录里是否有关于 API 限流的设计文档？"
  ```
- 效果：AI 先看索引文件，再按需读取具体内容，不浪费 token

👥 **适合谁用？**

✅ 使用 Claude Code/Cursor 的开发者
✅ 需要快速出原型的产品经理/设计师
✅ 想让 AI 干专业活的个人创作者
❌ 完全不用 AI 编程助手的人（装了也用不上）

⚠️ **注意事项**

- **开源免费**：MIT 协议，可商用、可修改
- **学习曲线**：⭐⭐⭐☆☆（需要了解 AI 编程助手的基本用法）
- **安装方式**：支持 5 种方式，推荐用 `npx skills` 一键安装
- **兼容性**：Claude Code、Cursor、Codex、Gemini CLI、OpenCode 等都测试过
- **替代方案**：直接写 Prompt（但效果不如专业技能）

🔗 **相关链接**

- GitHub 仓库：https://github.com/ConardLi/garden-skills
- 技能规范：https://agentskills.io
