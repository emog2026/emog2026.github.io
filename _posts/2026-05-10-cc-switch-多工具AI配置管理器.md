---
layout: post
title: "统一管理 5 个 AI 编程工具的万能遥控器：CC Switch"
date: 2026-05-10
tags: [开发, AI, 自动化, 工具]
header-style: 'text'
subtitle: "一个桌面应用，统一管理 5 个 AI 编程 CLI 工具的配置和 API 提供商"
---

> 原网址：https://github.com/farion1231/cc-switch

---

📌 **一句话总结**：一个桌面应用，统一管理 5 个 AI 编程 CLI 工具的配置和 API 提供商

## 🎯 它是做什么的？

CC Switch 是一个"AI 编程工具的万能遥控器"。现代 AI 编程依赖多个 CLI 工具（Claude Code、Codex、Gemini CLI、OpenCode、OpenClaw），但每个工具都有不同的配置格式。想换个 API 提供商？你得手动编辑 JSON、TOML 或 `.env` 文件，非常麻烦。

CC Switch 给你一个可视化界面：
- **一键切换** API 提供商，50+ 预设（AWS Bedrock、NVIDIA NIM、社区中转等）
- **统一管理** MCP 服务器、Skills、Prompts
- **系统托盘**快速切换，无需打开完整应用
- **云同步**配置到多个设备（Dropbox、OneDrive、iCloud、WebDAV）
- **跨平台**支持（Windows、macOS、Linux），基于 Tauri 2 构建

## 🔑 核心概念解读

### Provider（提供商）
- **专业说**：API 服务的配置端点，包括密钥、URL、模型参数
- **通俗说**：就像给你的 AI 助手"换手机号"——不同的提供商给你不同的速率、稳定性和价格
- **生活中的类比**：从移动官网办套餐 vs 找代理商办套餐，功能一样但价格不同

### MCP（Model Context Protocol）
- **专业说**：Claude 的扩展协议，让 AI 能访问外部工具和数据源
- **通俗说**：给 AI 装上"手脚"，让它能查文件、调 API、搜数据库
- **生活中的类比**：从只能聊天的 Siri 变成能设闹钟、发短信的 Siri

### Skills（技能）
- **专业说**：可复用的提示词和工具集合，通过 GitHub 仓库或 ZIP 安装
- **通俗说**：给 AI 打包好的"使用说明书"，比如"如何写测试"、"如何重构代码"
- **生活中的类比**：游戏里的预设连招宏，一键触发复杂操作

## 💡 切实可落地的例子

### 场景 1：独立开发者多账户管理

**痛点**：你有 Claude Code 的官方 Plus 账户，又想用便宜的第三方中转，来回改配置文件很烦

**解决方案**：
```bash
# 1. 下载安装 CC Switch
# macOS 用户:
brew tap farion1231/ccswitch
brew install --cask cc-switch

# Windows/Linux 用户: 从 GitHub Releases 下载安装包
# https://github.com/farion1231/cc-switch/releases
```

```bash
# 2. 在应用中:
# - 点击 "Add Provider" → 选择 "Claude Code - Official Login"
# - 再添加第三方提供商（如 PackyCode、AIGoCode 等）
# - 系统托盘一键切换，无需重启终端（Claude Code 支持热切换）
```

**效果**：5 秒完成切换，每月节省 70%+ API 成本

---

### 场景 2：小团队统一 MCP 配置

**痛点**：团队成员各自配置 MCP 服务器，有人连不上、有人版本不对

**解决方案**：
```bash
# 1. 在 CC Switch 的 "MCP" 面板添加团队统一的 MCP 服务器
# 2. 启用 "Sync to Apps" 同步到所有 4 个应用
# 3. 导出配置（JSON），团队成员导入即可
# 4. 支持 Deep Link (ccswitch://) 直接从浏览器导入提供商
```

**效果**：团队配置一致性 100%，新人 5 分钟上手

---

### 场景 3：重度用户的成本监控

**痛点**：多个工具、多个提供商，不知道每月花了多少

**解决方案**：
```bash
# 1. 打开 CC Switch 的 "Usage" 面板
# 2. 设置每个模型的实际单价
# 3. 查看趋势图表、详细请求日志
# 4. 支持跨工具统计（Claude Code + Codex + Gemini CLI 总开销）
```

**效果**：精确到每一分钱的成本追踪，发现隐形开销

## 👥 适合谁用？

✅ 使用 2+ 个 AI CLI 工具的开发者  
✅ 频繁切换 API 提供商的用户（找最优惠价格）  
✅ 需要统一管理团队配置的技术团队  
✅ 使用 MCP 扩展的 AI 高级用户  

❌ 只用一个 CLI 工具且只使用官方登录的用户（不需要）

## ⚠️ 注意事项

- **开源免费**：MIT 协议，数据存储在本地 SQLite
- **学习曲线**：⭐⭐☆☆☆（10-15 分钟上手）
- **替代方案**：手动编辑配置文件（繁琐、易出错）
- **平台支持**：Windows 10+、macOS 12+、主流 Linux 发行版

## 🔧 技术架构

**前端**：React 18 + TypeScript + Vite + TailwindCSS 3.4 + TanStack Query v5

**后端**：Tauri 2.8 + Rust

**数据存储**：
- 数据库：`~/.cc-switch/cc-switch.db`（SQLite）
- 本地设置：`~/.cc-switch/settings.json`
- 备份：`~/.cc-switch/backups/`（自动轮转，保留最近 10 个）

**核心特性**：
- SSOT（Single Source of Truth）：所有数据存储在 SQLite
- 双向同步：写入实时文件，从实时文件回填
- 原子写入：临时文件 + 重命名模式防止配置损坏
- 并发安全：互斥锁保护的数据库连接

## 📦 下载与安装

### macOS 用户

```bash
# 方法 1: Homebrew（推荐）
brew tap farion1231/ccswitch
brew install --cask cc-switch

# 更新
brew upgrade --cask cc-switch
```

### Windows 用户

下载最新的 `CC-Switch-v{version}-Windows.msi` 安装器或便携版 `CC-Switch-v{version}-Windows-Portable.zip`

### Linux 用户

- Debian/Ubuntu: `.deb` 包
- Fedora/RHEL/openSUSE: `.rpm` 包
- 通用版本: `.AppImage`

## 🌟 GitHub Star 历史

![Star History](https://api.star-history.com/svg?repos=farion1231/cc-switch&type=Date)

---

**项目地址**：[farion1231/cc-switch](https://github.com/farion1231/cc-switch)

**许可证**：MIT © Jason Young
