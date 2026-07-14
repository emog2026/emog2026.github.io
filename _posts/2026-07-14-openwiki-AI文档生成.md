---
layout: post
title: "为代码库自动生成 AI 友好的文档：OpenWiki"
date: 2026-07-14
tags: [开发, AI, 文档, DevOps]
header-style: 'text'
subtitle: "为代码库自动写文档的 AI 命令行工具，让 AI Agent 更懂你的代码"
---

> 原网址：https://github.com/langchain-ai/openwiki

---

📌 **一句话总结**

为代码库自动写文档的 AI 命令行工具，让 AI Agent 更懂你的代码

---

🎯 **它是做什么的？**

OpenWiki 是一个"AI 助手的图书管理员"。它的核心作用是：

**深度解决什么问题？**
- AI 代码助手（如 Claude、GitHub Copilot）缺乏项目上下文，给出的建议常常"不懂业务"
- 团队 Wiki 过时、更新不及时，新同事上手困难
- 代码文档维护成本高，写一次忘更新

**核心功能范围：**
- 自动扫描代码库，生成结构化文档
- 支持从本地 Git 仓库、Gmail、Notion、X/Twitter、Web Search、Hacker News 等多个来源同步知识
- 两种模式：
  - **Personal 模式**：在 `~/.openwiki/wiki` 构建个人知识库
  - **Code 模式**：在项目 `openwiki/` 目录生成代码文档
- 集成到 GitHub/GitLab/Bitbucket CI，自动更新文档

**和同类产品的区别：**
- 专为 AI Agent 设计，生成的文档优化给 LLM 消费
- 支持 ChatGPT 账号登录（无需 API key）
- 内置多种数据连接器，不只是代码

---

🔑 **核心概念解读**

**Agent Wiki（Agent 知识库）**
- 专业说：为 AI Agent 准备的结构化项目文档
- 通俗说：就像给新员工准备的"入职手册"，但读手册的是 AI

**Local Connectors（本地连接器）**
- 专业说：从各种数据源拉取数据的集成组件
- 通俗说：像水管接头，把你的 Gmail、Notion、代码仓库都"接"到一个知识库

**Two Modes（双模式）**
- 专业说：Personal 模式构建个人知识图谱，Code 模式生成项目文档
- 通俗说：一个管"我的所有知识"，一个管"这个项目的知识"

---

💡 **切实可落地的例子（3 个场景）**

**场景 1：个人用户 - 构建第二大脑**

- **痛点**：信息散落在 Gmail、Notion、推特收藏、代码笔记里，想不起来在哪
- **方案**：用 OpenWiki Personal 模式，统一索引所有来源
- **具体实现步骤**：

```bash
# 安装
npm install -g openwiki

# 初始化个人知识库
openwiki personal --init

# 认证各个数据源
openwiki auth gmail
openwiki auth notion
openwiki auth x

# 手动触发更新
openwiki --update "Refresh from all sources"
```

- **效果**：一个本地 Markdown 知识库，AI 可以跨所有来源回答问题

---

**场景 2：小团队 - 让 Claude 更懂你们的代码**

- **痛点**：Claude Code 给出的建议常常不符合项目规范，因为它没看过你们的文档
- **方案**：用 OpenWiki Code 模式生成项目 wiki，在 CLAUDE.md 中引用
- **具体实现步骤**：

```bash
# 在项目根目录
cd your-project
openwiki code --init

# 生成初始文档
openwiki "Please generate documentation for this repository"

# 查看生成的文件
ls openwiki/
```

在生成的 `CLAUDE.md` 中会自动包含：

```markdown
<!-- OPENWIKI:START -->
When searching for context, reference the OpenWiki documentation in the `openwiki/` directory.
<!-- OPENWIKI:END -->
```

- **效果**：Claude Code 会自动参考你的项目文档，建议更贴合实际

---

**场景 3：企业级 - CI 自动更新文档**

- **痛点**：代码变更频繁，文档永远跟不上，过时的文档比没有文档更糟糕
- **方案**：集成 GitHub Actions，每次提交自动更新文档
- **具体实现步骤**：

```bash
# 复制 CI 工作流文件
cp openwiki-update.yml .github/workflows/

# 配置环境变量（在 GitHub Secrets 中设置）
# OPENWIKI_PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-xxx
# OPENWIKI_MODEL_ID=claude-sonnet-4-20250514
```

在 `.github/workflows/openwiki-update.yml` 中：

```yaml
name: OpenWiki Update
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # 每天午夜
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g openwiki
      - run: openwiki code --update --print
        env:
          OPENWIKI_PROVIDER: anthropic
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENWIKI_MODEL_ID: claude-sonnet-4-20250514
      - uses: peter-evans/create-pull-request@v5
        with:
          title: "docs: update OpenWiki documentation"
```

- **效果**：每次代码变更或每日定时，自动 PR 更新文档，永不落后

---

👥 **适合谁用？**

✅ **推荐人群：**
- 使用 Claude Code、GitHub Copilot 等 AI 助手的开发者
- 需要维护项目文档的小团队（2-20人）
- 信息过载、知识分散的个人用户
- 想降低新人学习成本的团队

❌ **不适合：**
- 不用 AI 助手的人（OpenWiki 专为 Agent 优化）
- 只有一个简单脚本的项目（杀鸡不用牛刀）
- 需要实时协作编辑的团队（OpenWiki 是单向生成，不是协作文档）

⚠️ **注意事项**

**付费/免费：**
- OpenWiki 本身免费开源
- 需要 LLM API 调用成本：
  - 可用 ChatGPT Plus 订阅（包含 Codex 配额）
  - 或使用 API key 按量付费
  - 支持多种提供商（OpenAI、Anthropic、OpenRouter 等）

**学习曲线：**
- 基础使用：⭐⭐☆☆☆（15 分钟上手）
- 高级配置（自定义连接器）：⭐⭐⭐⭐☆

**替代方案：**
- **MkDocs + AI 手动更新**：传统静态文档，需要手动维护
- **Notion AI**：协作文档，但专为 Agent 优化不足
- **Codium PR-Agent**：专注 PR 代码审查，不做全项目 wiki
