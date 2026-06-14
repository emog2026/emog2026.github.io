---
layout: post
title: "一键将30+个网站的网页文章转换成干净Markdown格式的命令行工具：墨探"
date: 2026-06-14
tags: [开发, 工具, Markdown, CLI, 开源, 网页抓取]
header-style: 'text'
subtitle: "一键将30+个网站的网页文章转换成干净Markdown格式的命令行工具"
---

> 原网址：https://github.com/caol64/omni-article-markdown

---

📌 **一句话总结**：一键将30+个网站的网页文章转换成干净Markdown格式的命令行工具

---

## 🎯 它是做什么的？

**墨探 (omni-article-markdown)** 是一个"网页内容格式翻译官"。

**核心问题**：你在网上看到一篇好文章（比如 Medium 的技术博客、知乎专栏、CSDN 教程），想保存下来做笔记。但复制粘贴后格式全乱了——图片不见了、代码高亮丢了、表格变成一堆乱码。你想把整篇文章保存成 Markdown，但每个网站的 HTML 结构都不同，手动整理要花半小时。

**解决方案**：墨探是一个命令行工具，一行命令就能把网页文章转换成干净的 Markdown 格式。它支持 30+ 个常见的内容网站，自动处理图片、代码、公式、表格等复杂元素。

**深度**：工具内部有三层架构——Reader（读取整个网页）、Extractor（智能提取正文）、Parser（HTML → Markdown 转换）。针对防爬虫网站，还支持用 Playwright 渲染动态页面。

**广度**：支持国内外主流平台——Medium、CSDN、掘金、知乎、公众号、Towards Data Science、Cloudflare 博客、微软文档、InfoQ、Claude 文档、Meta 博客等。

**对比**：浏览器插件（如 MarkDownload）需要手动点击，且每个网站要单独适配；墨探是 CLI 工具，可以批量处理、自动化脚本集成，适配范围更广。

---

## 🔑 核心概念解读

### 1️⃣ 命令行界面（CLI）
- **专业说**：通过终端输入命令与程序交互的界面
- **通俗说**：没有图形界面，像黑客电影里那样敲命令干活
- **生活中的类比**：就像用遥控器（命令）换台，而不是在电视菜单里点来点去

### 2️⃣ Markdown 格式
- **专业说**：一种轻量级标记语言，用纯文本表示格式
- **通俗说**：用简单的符号表示粗体、标题、列表，像写纯文本一样排版
- **生活中的类比**：就像用 *星号* 强调，而不是点按钮加粗

### 3️⃣ HTML 提取
- **专业说**：从网页 HTML 结构中识别并提取正文内容，去除导航、广告、评论等噪音
- **通俗说**：从一堆网页代码里把"真正的文章"挑出来，把侧边栏、广告栏扔掉
- **生活中的类比**：像从报纸上剪下文章，剪掉广告和边栏

### 4️⃣ Playwright 渲染
- **专业说**：使用无头浏览器执行 JavaScript，获取动态生成的内容
- **通俗说**：假装自己是真实浏览器，等页面加载完再抓内容
- **生活中的类比**：就像等网页加载完再截图，而不是一打开就截

### 5️⃣ 网站适配
- **专业说**：针对不同网站的 HTML 结构特点，编写专门的提取规则
- **通俗说**：给每个网站"量身定制"一套抓取方案
- **生活中的类比**：像给每个人定制衣服，而不是均码

---

## 💡 切实可落地的例子（3 个场景）

### **场景 1：技术博客收藏**
- **痛点**：看到好文章想收藏，复制粘贴格式乱了，图片还要一张张下载
- **方案**：用墨探一键转换，保存成 Markdown，图片自动下载
- **具体实现**：
```bash
# 安装工具
pip install omni-article-markdown

# 转换文章并保存到当前目录
mdcli https://medium.com/@author/how-to-build-ai-agent-abc123 -s

# 输出文件名自动生成，如：how-to-build-ai-agent-abc123.md
# 图片会下载到同目录的 images 文件夹
```

```bash
# 查看转换后的 Markdown
cat how-to-build-ai-agent-abc123.md

# 内容示例：
# How to Build AI Agent

![封面图](./images/cover.png)

## Introduction

Building an AI agent is easier than you think...

```python
# 代码块保留了高亮信息
def agent():
    return "hello"
```

## Conclusion

Start building today!
```

- **效果**：30 秒完成收藏，格式完美，图片齐全

---

### **场景 2：公众号文章归档**
- **痛点**：公众号文章只能在微信里看，想导出成文档整理
- **方案**：用墨探转换公众号链接，生成 Markdown 归档
- **具体实现**：
```bash
# 转换公众号文章
mdcli https://mp.weixin.qq.com/s/xxxxx -s ~/articles/

# 文件会保存到 ~/articles/ 目录
# 图片会正确引用，格式保留
```

```bash
# 批量归档（结合 shell 脚本）
#!/bin/bash
# 从文件读取链接列表
while read -r url; do
    mdcli "$url" -s ~/wechat-archive/
done < article_links.txt
```

```bash
# 结果示例
~/wechat-archive/
├── article1.md
├── article2.md
└── images/
    ├── img1.png
    └── img2.png
```

- **效果**：把公众号文章变成可搜索、可编辑的 Markdown 文档

---

### **场景 3：技术文档本地化**
- **痛点**：云服务的文档在线看，离线没网时想参考
- **方案**：批量转换文档页面，建立本地知识库
- **具体实现**：
```bash
# 转换 Claude 文档页面
mdcli https://docs.anthropic.com/en/docs/about-claude/models -s ~/docs/claude/

# 转换微软技术文档
mdcli https://learn.microsoft.com/en-us/azure/ai-services/openai/ -s ~/docs/azure/

# 转换苹果开发者文档
mdcli https://developer.apple.com/documentation/swift/ -s ~/docs/apple/
```

```bash
# 使用 Obsidian 或其他 Markdown 编辑器查看
# 可以全文搜索、添加笔记、双链关联
```

```bash
# 高级：自动化脚本（每天定时备份文档）
#!/bin/bash
# backup_docs.sh
docs=(
    "https://docs.anthropic.com/en/docs/about-claude/models"
    "https://cloud.google.com/ai/docs"
    "https://spring.io/blog"
)

for url in "${docs[@]}"; do
    mdcli "$url" -s ~/backup/docs/
done
```

- **效果**：建立离线知识库，无网也能查文档

---

## 👥 适合谁用？

✅ **技术博客作者**：收藏参考资料，整理素材
✅ **知识管理爱好者**：用 Obsidian/Notion 建立知识库
✅ **内容创作者**：研究竞品文章，提取灵感
✅ **学生/研究员**：归档论文、教程、技术文档
✅ **程序员**：批量保存技术文档，离线查阅

❌ **只需要偶尔保存一篇文章**：用浏览器插件更方便
❌ **不想碰命令行**：选择图形界面工具（如 MarkDownload）
❌ **需要保存视频/音频**：墨探只处理文本和图片

---

## ⚠️ 注意事项

**付费情况**：
- **完全免费开源**，MIT 许可证
- PyPI 下载量：持续增长中
- 无需付费，无功能限制

**学习曲线**：⭐☆☆☆☆（10 分钟上手）
  - 最简单：`pip install` + `mdcli URL -s`
  - 无需配置，开箱即用
  - 命令参数清晰，帮助文档完善

**替代方案**：
- **MarkDownload**（浏览器插件）：图形界面，适合偶尔使用
- **html2md**（在线工具）：无需安装，但批量处理不便
- **Puppeteer/BeautifulSoup**：自己写爬虫，灵活但需要编程

**技术限制**：
- 部分网站可能有反爬虫机制，不一定100%成功
- 需要联网才能转换（不是离线工具）
- 只提取正文内容，不包含评论、侧边栏
- 某些动态内容可能需要等待加载

**支持的网站**（部分）：
| 类别 | 网站 |
|------|------|
| 技术社区 | CSDN、掘金、博客园、思否、开源中国、InfoQ |
| 国外平台 | Medium、Towards Data Science、Hackernoon、Forbes |
| 官方文档 | 微软、苹果、Cloudflare、JetBrains、Spring |
| 内容平台 | 知乎专栏、公众号、简书、今日头条、百家号 |
| 社交媒体 | X Articles、领英博客 |
| 其他 | 少数派、语雀、飞书、Claude 文档、Anthropic |

---

## 🔧 技术细节

**三模块架构**：

```
┌─────────────────────────────────────────────────────────┐
│                        输入 URL                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Reader 模块         │
         │  • 读取整个网页        │
         │  • 处理动态内容        │
         │  • 突破反爬虫         │
         └──────────┬────────────┘
                    │
                    ▼
         ┌───────────────────────┐
         │  Extractor 模块       │
         │  • 识别正文区域       │
         │  • 去除广告/导航      │
         │  • 提取关键元素       │
         └──────────┬────────────┘
                    │
                    ▼
         ┌───────────────────────┐
         │   Parser 模块         │
         │  • HTML → Markdown   │
         │  • 处理图片/代码/表格 │
         │  • 公式转换          │
         └──────────┬────────────┘
                    │
                    ▼
         ┌───────────────────────┐
         │     输出 .md          │
         └───────────────────────┘
```

**系统要求**：
- Python 3.7+
- pip 包管理器
- 可选：Docker（支持 Docker 镜像 `caol64/omnimd`）

**特殊功能**：
- ✅ KaTeX 公式转换（数学公式保留）
- ✅ GitHub Gist 支持（代码片段嵌入）
- ✅ 防爬虫突破（Playwright 渲染）
- ✅ 灵活输出（文件或 stdout）

**基本用法**：
```bash
# 仅转换（输出到终端）
mdcli https://example.com

# 保存到当前目录
mdcli https://example.com -s

# 保存到指定路径
mdcli https://example.com -s /home/user/

# 查看帮助
mdcli --help
```

---

## 📚 相关资源

- **GitHub 仓库**：https://github.com/caol64/omni-article-markdown
- **PyPI 包名**：`omni-article-markdown`
- **Docker 镜像**：`caol64/omnimd`
- **作者**：caol64
- **许可证**：MIT License
- **赞助**：https://yuzhi.tech/sponsor（给猫咪买罐头 ❤️）

---

## 🎯 总结

墨探是一个非常实用的命令行工具，解决了"网页内容转 Markdown"这个经典问题。它的优势在于：

✅ **广泛适配**：支持 30+ 个网站，覆盖主流内容平台
✅ **命令行友好**：适合批量处理、自动化脚本
✅ **开源免费**：完全开源，MIT 许可，可自行扩展
✅ **高质量输出**：保留格式、图片、代码、公式

**最佳适用场景**：
- 技术博客收藏和知识管理
- 公众号/文档归档
- 建立本地 Markdown 知识库

**需要权衡的地方**：
- 需要基本的命令行操作能力
- 某些网站可能有反爬虫限制
- 不适合完全不懂技术的用户

如果你经常需要保存网页文章、整理技术文档，或者想建立自己的 Markdown 知识库，墨探是一个值得尝试的效率工具。
