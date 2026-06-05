---
layout: post
title: "用 HTML 写视频自动生成 MP4：HyperFrames"
date: 2026-06-05
tags: [开发, AI, 视频]
header-style: 'text'
subtitle: "用 HTML 写视频脚本，自动渲染成 MP4，专为 AI 代理打造"
---

> 原网址：https://github.com/heygen-com/hyperframes

---

📌 **一句话总结**：用 HTML 写视频脚本，自动渲染成 MP4，专为 AI 代理打造

🎯 **它是做什么的？**

HyperFrames 是一个"视频生成引擎"。想象一下：
- 你写一个 HTML 文件（就像写网页）
- 加上时间标签，告诉它"第 1 秒显示标题，第 3 秒淡出"
- 它自动用无头浏览器一帧一帧录制
- 最后输出一个完整的 MP4 视频

**最大的创新**：它专为 AI 代理设计。Claude、Cursor 这些 AI 编程助手已经会写 HTML，现在它们也能"写视频"了。

**和 Remotion 的区别**：
- Remotion：必须用 React 组件写视频，需要打包编译
- HyperFrames：直接用原生 HTML 写，浏览器打开就能预览，零构建步骤

---

🔑 **核心概念解读**

**Composition（视频组成）**
- 专业说：定义视频内容、时序和媒体的 HTML 结构
- 通俗说：就像电影的分镜头脚本，用 HTML 描述"什么时间、什么位置、显示什么"

**Seekable Animation（可寻址动画）**
- 专业说：能够跳转到任意时间点的动画系统
- 通俗说：像进度条拖到哪就能播放到哪，而不是只能从头播放到底

**Frame.md**
- 专业说：将设计系统转换为视频制作规范的配置文件
- 通俗说：就像给 AI 代理的"视频制作说明书"，告诉它用什么颜色、字体、间距来保证品牌一致性

---

💡 **切实可落地的例子**

**场景 1：独立产品创作者（个人用户）**
- **痛点**：每次发功能更新都要手动录屏、剪辑、配音，太花时间
- **解决方案**：用 HyperFrames 自动生成产品介绍视频
- **具体实现步骤**：
  ```bash
  # 1. 安装 HyperFrames
  npx hyperframes init my-product-video
  cd my-product-video

  # 2. 创建 index.html（示例）
  # 写一个包含产品截图、文字淡入淡出、背景音乐的 HTML 文件

  # 3. 预览效果
  npx hyperframes preview

  # 4. 渲染成 MP4
  npx hyperframes render
  ```
- **效果**：10 秒钟生成一个专业产品视频，每次更新只需改改文字重新渲染

---

**场景 2：技术内容团队（小团队）**
- **痛点**：写好的技术文档、PR 变更想做成视频教程，手动录制太慢
- **解决方案**：用 HyperFrames 批量生成代码讲解视频
- **具体实现步骤**：
  ```bash
  # 1. 安装 CLI 和代理集成
  npx skills add heygen-com/hyperframes

  # 2. 在 Claude Code 中提示
  # "用 /hyperframes 创建一个 30 秒的 PR 讲解视频，
  #  展示代码 diff，添加高亮和说明文字"

  # 3. AI 会自动生成包含以下内容的 HTML：
  # - 代码 diff 逐行高亮
  # - 旁白文字说明
  # - 平滑的过渡动画

  # 4. 本地渲染
  npx hyperframes render --output pr-demo.mp4
  ```
- **效果**：每个 PR 自动配一个讲解视频，团队成员点开就能看，无需人工录制

---

**场景 3：SaaS 公司营销部门（企业级）**
- **痛点**：需要为不同客户批量生成定制化产品视频，外包成本高、周期长
- **解决方案**：搭建自动化视频生成流水线
- **具体实现步骤**：
  ```bash
  # 1. 创建模板项目
  npx hyperframes init customer-onboarding
  cd customer-onboarding

  # 2. 设计 frame.md 品牌规范
  # 定义颜色、字体、动画风格

  # 3. 编写可替换变量的 HTML 模板
  # 在 index.html 中使用 {{company_name}}、{{logo_url}} 等占位符

  # 4. 批量渲染脚本
  for customer in customers.json; do
    # 替换变量
    envsubst < index.html > temp.html

    # 渲染视频
    npx hyperframes render \
      --input temp.html \
      --output "videos/${customer}_onboarding.mp4"
  done

  # 5. 集成到 CI/CD
  # 在 AWS Lambda 上部署分布式渲染
  npm install @hyperframes/aws-lambda
  ```
- **效果**：每次新客户注册，自动生成专属欢迎视频，零人工参与

---

👥 **适合谁用？**

✅ **AI 编程用户**：用 Claude、Cursor 等工具，想自动生成视频内容
✅ **产品营销团队**：需要批量生成产品介绍、功能更新视频
✅ **技术内容创作者**：想将代码、文档自动转化为视频教程
✅ **开发者工具团队**：为 PR、文档自动配讲解视频

❌ **传统剪辑师**：习惯用 Premiere、Final Cut，不想写代码
❌ **一次性简单需求**：只用一次且视频简单，直接录屏更省事

---

⚠️ **注意事项**

- **完全免费开源**：Apache 2.0 协议，无渲染次数限制、无商业使用门槛
- **学习曲线**：
  - 如果你会 HTML/CSS：⭐⭐☆☆☆（1-2 小时上手）
  - 如果是编程新手：⭐⭐⭐☆☆（需要先学基础前端知识）
- **系统要求**：Node.js 22+、FFmpeg（需要单独安装）
- **替代方案**：
  - Remotion（基于 React，生态更成熟）
  - 传统视频剪辑工具（Pr、AE，但无法自动化）
  - Loom、OBS（录屏工具，但只能手动录制）
