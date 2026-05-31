---
layout: post
title: "一键把任何网页文章转换成干净的 Markdown 文件：墨探 omni-article-markdown"
date: 2026-05-31
tags: [开发, 工具, 自动化]
header-style: 'text'
subtitle: "一键把任何网页文章转换成干净的 Markdown 文件"
---

> 原网址：https://github.com/caol64/omni-article-markdown

---

## 📌 一句话总结

一键把任何网页文章转换成干净的 Markdown 文件

## 🎯 它是做什么的？

墨探是一个"网页到 Markdown 的翻译官"。想象一下：

- 你在 Medium 看到一篇好文章 → 一行命令转换成 `.md` 文件保存到本地
- 公众号文章想存档 → 自动提取正文、清除广告、保留格式
- 技术文档需要离线阅读 → 从网页转成 Markdown，方便笔记软件导入

它支持 40+ 主流网站（Medium、掘金、CSDN、公众号、知乎、Claude 文档、Anthropic、Meta 博客、Android Developers Blog、Spring Blog 等），甚至能突破某些防爬虫策略，用浏览器 playwright 技术获取内容。

## 🔑 核心概念解读

### Markdown 转换
- **专业说**：将 HTML 网页解析并转换为 Markdown 标记语言
- **通俗说**：像把装修好的房子拆成图纸——保留结构和内容，但去掉了装修风格（广告、导航栏等装饰）

### Extractor（提取器）
- **专业说**：从 HTML 中提取正文内容并清理无用元素
- **通俗说**：像挑核桃——从一堆壳里把肉挑出来，去掉皮和杂质

### CLI 工具
- **专业说**：命令行界面软件
- **通俗说**：不用点图标、不用装软件，打开终端输命令就能用的工具

## 💡 切实可落地的例子

### 场景 1：个人知识库建设

- **痛点**：网上看到好文章，想存到 Obsidian/Notion，但复制粘贴排版全乱了
- **方案**：用墨探转换成 Markdown，直接导入笔记软件
- **具体命令**：
  ```bash
  # 安装
  pip install omni-article-markdown
  
  # 转换文章到当前目录
  mdcli https://medium.com/@author/article-title -s
  
  # 转换到指定路径
  mdcli https://juejin.cn/post/123456 -s ~/Documents/my-notes/
  ```
- **效果**：3 秒完成转换，保留标题、列表、代码块格式

### 场景 2：技术文档离线化

- **痛点**：Claude/GCP/Azure 文档在线看慢，想离线阅读但没提供 Markdown 下载
- **方案**：批量转换文档页面到本地，构建离线知识库
- **具体命令**：
  ```bash
  # 创建文档目录
  mkdir claude-docs && cd claude-docs
  
  # 转换多篇文档
  mdcli https://docs.anthropic.com/claude/docs/migration -s .
  mdcli https://docs.anthropic.com/claude/docs/tool-use -s .
  mdcli https://docs.anthropic.com/claude/docs/prompt-caching -s .
  ```
- **效果**：飞机上也能看文档，搜索速度比在线快 10 倍

### 场景 3：内容创作者素材收集

- **痛点**：研究竞品文章需要保存几十个网页，浏览器书签太乱，PDF 不便编辑
- **方案**：一键转换所有参考文章到 Markdown，统一管理方便引用
- **具体命令**：
  ```bash
  # 批量转换脚本
  #!/bin/bash
  urls=(
    "https://towardsdatascience.com/article1"
    "https://medium.com/@author/article2"
    "https://quantamagazine.org/article3"
  )
  
  for url in "${urls[@]}"; do
    mdcli "$url" -s ./research/
  done
  ```
- **效果**：10 篇文章 30 秒全部转换完，文件名自动生成

## 👥 适合谁用？

✅ 经常需要保存网页内容的程序员、研究员
✅ 使用 Obsidian/Notion/Logseq 等 Markdown 笔记软件的人
✅ 需要离线阅读技术文档的开发者
✅ 内容创作者、自媒体运营（收集素材）
❌ 只偶尔保存一篇文章的人（浏览器另存为就够了）

## ⚠️ 注意事项

- **开源免费**：MIT 许可证
- **安装简单**：`pip install omni-article-markdown`
- **学习曲线**：⭐☆☆☆☆（5 分钟上手）
- **支持范围**：40+ 网站，新网站可贡献适配规则
- **替代方案**：browsermark（浏览器插件）、Pandoc（需手动复制 HTML）

## 架构说明

墨探主要分为三个模块：

- **Reader** 模块的功能是读取整个网页内容
- **Extractor** 模块的功能是提取正文内容，清理无用数据
- **Parser** 模块的功能是将 HTML 转换为 Markdown

通过这种分层设计，墨探能够适配各种复杂 HTML 结构的网站，并逐步扩展覆盖更多网站。