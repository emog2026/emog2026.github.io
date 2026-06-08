---
layout: post
title: "一键批量发布视频到多个平台：Social Auto Upload"
date: 2026-06-08
tags: [自动化, 视频, 社交媒体, 开源]
header-style: 'text'
subtitle: "自动化上传视频到抖音、B站、小红书等主流平台"
---

> 原网址：https://github.com/dreammis/social-auto-upload

---

## 📌 一句话总结

一键批量发布视频到多个社交媒体平台，自动完成登录、上传、定时发布等重复工作。

## 🎯 它是做什么的？

Social Auto Upload 是一个"视频分发自动化助手"。想象一下：

**传统方式**：
- 制作好一个视频 → 打开抖音APP → 登录 → 上传 → 填标题/简介 → 发布
- 然后打开B站 → 登录 → 上传 → 填信息 → 发布
- 再打开小红书 → 登录 → 上传 → 填信息 → 发布
...重复 7 次，每次 10 分钟，总共 1 小时+

**使用 Social Auto Upload**：
```bash
# 一条命令搞定所有平台
sau douyin upload-video --account main --file video.mp4 --title "示例标题"
sau bilibili upload-video --account main --file video.mp4 --title "示例标题"
sau xiaohongshu upload-video --account main --file video.mp4 --title "示例标题"
```

**核心价值**：
- ✅ 支持 7 个主流平台（抖音、B站、小红书、快手、视频号、百家号、TikTok）
- ✅ 批量上传 + 定时发布
- ✅ 无头模式运行（后台悄悄干活，不用打开浏览器窗口）
- ✅ AI Agent 可直接调用（让 Claude/Qwen 帮你自动发布）
- ✅ 开源免费，9k+ GitHub Stars

## 🔑 核心概念解读

**无头模式（Headless Mode）**
- 专业说法：浏览器在后台运行，不弹出可见窗口的自动化模式
- 通俗说：就像有个隐形的助手在帮你操作电脑，你看不到他在干活，但活儿都干完了
- 生活类比：把扫地机器人设定好程序，它在你睡觉时悄悄打扫完，你醒来发现家里干净了

**CLI（Command Line Interface）**
- 专业说法：命令行界面，通过输入文本指令操作软件
- 通俗说：不用鼠标点图标，直接打字下命令让电脑干活
- 生活类比：去餐厅吃饭，"扫码点餐"是用手机（图形界面），"直接喊服务员我要套餐A"就是命令行

**Skill 化**
- 专业说法：将功能封装成 AI Agent 可以直接调用的模块
- 通俗说：把工具包装成"AI 能看懂的说明书"，让 Claude、Qwen 这些 AI 直接帮你操作
- 生活类比：给助手写好标准操作手册，他下次就能按手册自己干活了

**定时发布**
- 专业说法：预设时间自动发布内容
- 通俗说：现在设置好明天早上 9 点发，到时间自动发出去
- 生活类比：就像定时发送的生日祝福，提前写好，到点自动发

## 💡 切实可落地的例子

### 场景 1：个人创作者每周发布

**痛点**：每周制作 5 个视频，要在抖音、B站、小红书发，手动操作太累

**解决方案**：使用 Social Auto Upload 批量发布

```bash
# 安装项目后，配置好账号登录

# 周一晚上一次性设置好本周所有视频的发布
sau douyin upload-video --account main \
  --file videos/monday.mp4 \
  --title "周一内容：xxx" \
  --desc "详细简介..." \
  --publish-time "2026-06-09 09:00:00"

sau bilibili upload-video --account main \
  --file videos/monday.mp4 \
  --title "周一内容：xxx" \
  --desc "详细简介..." \
  --publish-time "2026-06-09 10:00:00"

# 重复设置周二到周五的内容
# ...周二、周三、周四、周五

# 效果：周一花 30 分钟设置好，接下来 5 天自动发布
```

**效果**：
- 每周节省 4.5 小时手动操作时间（原本每天 1 小时 × 5 天）
- 发布时间精准控制（早上 9-10 点流量高峰）
- 避免遗漏或重复发布

### 场景 2：MCN 机构管理 10 个账号

**痛点**：一个机构管理 10 个达人账号，每个要发 3 个平台，每天 30 次上传操作

**解决方案**：使用多账号批量发布

```bash
# 创建 10 个账号配置
for creator in creator1 creator2 creator3 creator4 creator5 creator6 creator7 creator8 creator9 creator10; do
  # 每个账号发布到抖音、B站、小红书
  sau douyin upload-video --account $creator --file daily.mp4 --title "每日更新"
  sau bilibili upload-video --account $creator --file daily.mp4 --title "每日更新"
  sau xiaohongshu upload-video --account $creator --file daily.mp4 --title "每日更新"
done

# 或者并发执行（更高效）
sau douyin upload-video --account creator1 --file daily.mp4 --title "每日更新" &
sau douyin upload-video --account creator2 --file daily.mp4 --title "每日更新" &
sau douyin upload-video --account creator3 --file daily.mp4 --title "每日更新" &
# ... 等待所有任务完成
```

**效果**：
- 30 次手动上传 → 1 个脚本搞定
- 每天节省 2-3 小时运营时间
- 统一管理，避免账号遗漏

### 场景 3：AI Agent 全自动内容工作流

**痛点**：用 AI 写脚本、生成视频后，还是要手动上传到各平台

**解决方案**：让 AI 完成从创作到发布的全流程

```python
# 在 Claude Code / Qwen Code 等 AI Agent 中

# 1. AI 生成脚本
script = ai_generate_script("如何用 Python 自动化办公")

# 2. AI 生成视频（调用其他工具）
video = generate_video_with_ai(script)

# 3. AI 自动上传到各平台
sau douyin upload-video --account main --file $video --title "Python 自动化教程"
sau bilibili upload-video --account main --file $video --title "Python 自动化教程"
sau xiaohongshu upload-video --account main --file $video --title "Python 自动化教程"

# 整个流程：从想法到多平台发布，AI 全自动完成
```

**效果**：
- 真正的"一键发布"：AI 完成创意、制作、分发全流程
- 每天可以产出 10+ 条内容（原本 1-2 条）
- 解放创作者，专注于创意而非重复操作

## 👥 适合谁用？

✅ **个人内容创作者**：每周固定发布视频到多个平台
✅ **MCN 机构/工作室**：管理多个达人账号，需要批量操作
✅ **AI 创作者**：用 AI 生成内容，需要自动化最后一公里
✅ **技术人员**：喜欢用命令行、脚本提高效率
✅ **跨境电商卖家**：在 TikTok、视频号等平台发营销视频

❌ **只发单一平台的人**：比如只在抖音发，用平台自带功能即可
❌ **不技术的人**：如果怕命令行，建议等 Web 版本或用人工发布
❌ **追求极致画质的人**：压缩和转码可能有轻微质量损失

## ⚠️ 注意事项

**项目状态**：
- ⚠️ 正在重构中，当前主线是无头模式 + CLI + Skill 化
- ⚠️ Web 端代码保留但不是主线，可能无法直接运行
- ✅ 抖音、B站、小红书、快手已接入 CLI，其他平台陆续跟进

**技术要求**：
- 需要安装 Python 环境
- 需要配置各平台账号登录（首次需扫码登录）
- 学习曲线：⭐⭐⭐☆☆（需要一点命令行基础）

**平台风险**：
- ⚠️ 频繁自动化上传可能被平台检测，建议控制频率
- ⚠️ 使用无头模式（隐蔽性更好），但仍需谨慎
- ✅ 项目正在改进隐蔽性和稳定性

**替代方案**：
- **手动发布**：适合单平台、低频率发布
- **各平台官方工具**：抖音创作者平台、B站网页版上传
- **商业分发平台**：壹伴、新榜等（付费，功能更全）

## 🌟 项目亮点

- **9k+ GitHub Stars**：超人气开源项目
- **7 个主流平台**：覆盖国内外主流社交媒体
- **AI Agent 原生支持**：专为 Claude、Qwen 等 AI 设计
- **定时发布**：提前设置，到点自动发
- **完全免费开源**：MIT 协议，可自由修改和扩展

---

> 💡 **小贴士**：如果你是内容创作者，建议先试试抖音、B站、小红书三个平台的 CLI 功能，熟悉后再扩展到其他平台。如果你用 AI Agent（如 Claude Code），可以直接让 AI 帮你安装和使用这个工具。
