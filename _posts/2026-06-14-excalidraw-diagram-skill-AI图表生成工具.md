---
layout: post
title: "给AI装上画图超能力：Excalidraw Diagram Skill"
date: 2026-06-14
tags: [开发, AI, 图表, 开源]
header-style: 'text'
subtitle: "用自然语言自动生成专业 Excalidraw 图表"
---

> 原网址：https://github.com/coleam00/excalidraw-diagram-skill

---

📌 **一句话总结**：给 AI 编程助手装上"画图超能力"，用自然语言自动生成专业 Excalidraw 图表

## 🎯 它是做什么的？

**excalidraw-diagram-skill** 是一个开源技能包，让你的 Claude Code（或其他支持技能的编码代理）能够：

- **用自然语言生成图表**：你说"画出 AG-UI 协议如何将 AI 事件流式传输到前端"，它就自动生成对应的专业图表
- **不是普通框图**：图表能"视觉论证"——一对多用扇形、时序用时间线、聚合用收敛形状
- **包含真实代码片段**：技术图表里包含实际的代码和 JSON，不是占位符
- **自动视觉验证**：用 Playwright 渲染图表，AI 能自己看到结果并修复布局问题（文字重叠、箭头错位、间距不均）
- **可定制品牌风格**：所有颜色存在一个文件里，换个色板就换风格

## 🔑 核心概念解读

**Skill（技能）**
- 专业说：Claude Code 的插件系统，从 `.claude/skills/` 读取
- 通俗说：给 AI 助手"装新技能包"，像给游戏角色学新招式

**Visual Argumentation（视觉论证）**
- 专业说：每个形状/形状组都反映它代表的概念逻辑
- 通俗说：不是画一堆方框连线，而是让图表的"形状本身"就能说明问题——像用分流图展示一对多关系

**Evidence Artifacts（证据制品）**
- 专业说：包含真实代码片段、实际 JSON 的技术图表元素
- 通俗说：图表里的代码不是" lorem ipsum "假数据，是真正能跑的代码

## 💡 切实可落地的例子

### 场景 1：技术文档撰写者
**痛点**：写架构文档需要画图，但手残，用 draw.io 要拖半天

**方案**：对 Claude 说"画一个用户认证流程图，包含 JWT 验证和 Redis 缓存"，自动生成专业图表

**具体实现**：
```bash
# 1. 安装技能
git clone https://github.com/coleam00/excalidraw-diagram-skill.git
cp -r excalidraw-diagram-skill .claude/skills/excalidraw-diagram

# 2. 设置渲染器（让 AI 自己能看图）
cd .claude/skills/excalidraw-diagram/references
uv sync
uv run playwright install chromium

# 3. 使用
# 对 Claude 说："Create an Excalidraw diagram showing the authentication flow"
```

**效果**：5 分钟得到专业图表，不用手动拖拽

---

### 场景 2：团队协作讲解
**痛点**：远程会议讲解复杂架构，队友看代码头大，需要图但没时间画

**方案**：让 Claude 实时生成流程图，队友能边听边看

**具体实现**：
```
# 对 Claude 说：
"画一个微服务架构图，展示 API Gateway → Service A/B → Database 的调用链，
包括 gRPC 通信和负载均衡"
```

**效果**：即时生成包含真实服务名称、协议、数据流的专业图表

---

### 场景 3：开源项目文档
**痛点**：项目 README 没图，新用户看不懂架构，流失率高

**方案**：用 AI 快速生成架构图、数据流图、组件关系图

**具体实现**：
```bash
# 批量生成多个图表
# 1. 整体架构
"Create a diagram showing the system architecture"

# 2. 认证流程
"Create a sequence diagram of the OAuth login flow"

# 3. 数据库模型
"Create an ER diagram showing User → Post → Comment relationships"
```

**效果**：README 变专业，新人上手快，项目形象提升

## 👥 适合谁用？

✅ 使用 Claude Code 的开发者（必试）
✅ 需要频繁画技术图的工程师
✅ 写技术文档/博客的创作者
✅ 想提升项目 README 质量的开源作者
❌ 不用 Claude Code 的人（需要适配其他代理）
❌ 偶尔画一次图的人（杀鸡不用牛刀）

## ⚠️ 注意事项

- **完全免费开源**：MIT 许可
- **需要安装渲染器**：Playwright + Chromium（约 200MB 下载）
- **学习曲线**：⭐☆☆☆☆（直接让 AI 画就行）
- **替代方案**：手动画（draw.io、Figma）、其他图表工具
