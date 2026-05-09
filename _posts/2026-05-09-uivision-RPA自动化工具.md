---
layout: post
title: "三合一的免费开源 RPA 自动化神器：UI.Vision"
date: 2026-05-09
tags: [自动化, 开发]
header-style: 'text'
subtitle: "浏览器自动化 + 桌面自动化 + Selenium IDE，三合一的免费开源 RPA 工具"
---

> 原网址：https://ui.vision/

---

📌 **一句话总结**：浏览器自动化 + 桌面自动化 + Selenium IDE，三合一的免费开源 RPA 工具

🎯 **它是做什么的？**

UI.Vision 是一个免费开源的 RPA（机器人流程自动化）工具，它的独特之处在于**三种工具合而为一**：
- **Web 自动化**：像 Selenium IDE 一样自动化浏览器操作
- **桌面自动化**：通过计算机视觉和 OCR 技术自动化桌面应用程序
- **视觉测试**：通过图像和文字识别进行 UI 测试

想象一下：
- 自动化网页表单填写、数据抓取、测试
- 自动化桌面软件操作（Excel、PDF 编辑器等）
- 跨平台工作（Windows、macOS、Linux）
- 完全免费，无需编程基础

你不需要写代码，只需录制一次操作，UI.Vision 就能无限重复执行。

🔑 **核心概念解读**

**RPA（Robotic Process Automation）**
- 专业说：通过软件机器人模拟人类操作的自动化技术
- 通俗说：让软件代替你做重复的点击、输入、复制粘贴等操作

**Computer Vision（计算机视觉）**
- 专业说：让计算机"看懂"屏幕内容的技术
- 通俗说：像人眼一样识别屏幕上的按钮、文字、图片，即使没有代码标识也能找到目标

**OCR（光学字符识别）**
- 专业说：将图像中的文字转换为可编辑文本的技术
- 通俗说：让软件"读懂"屏幕上的文字，即使这些文字是图片的一部分

**Selenium IDE**
- 专业说：基于 Selenium 的浏览器自动化测试工具
- 通俗说：专门用于浏览器测试和自动化的录制回放工具

**Macro（宏）**
- 专业说：预先录制的一系列操作步骤
- 通俗说：像录音机一样，把你的一次操作录下来，之后可以反复播放

💡 **切实可落地的例子**

**场景 1：电商运营人员 - 自动化数据抓取**
- 痛点：每天需要从 5 个电商平台后台下载销售数据并汇总到 Excel
- 方案：使用 UI.Vision 录制抓取流程并自动化执行
- **具体步骤**：
  1. 安装 UI.Vision 浏览器扩展（Chrome/Firefox/Edge）
  2. 打开 UI.Vision，点击"Record"开始录制
  3. 手动操作一次完整流程：
     - 打开电商平台后台
     - 登录（输入账号密码）
     - 导航到销售报表页面
     - 选择日期范围
     - 导出 CSV
  4. 停止录制，UI.Vision 自动生成宏
  5. 为每个平台重复步骤 2-4
  6. 使用"Loop"功能按顺序执行 5 个平台的宏
  7. 设置定时任务（Cron）每天早上 8 点自动运行
  8. （可选）添加 OCR 步骤抓取无法复制的表格数据
- 效果：每天自动完成数据抓取，节省 1 小时

**场景 2：财务人员 - 自动化桌面软件操作**
- 痛点：需要从 PDF 发票中提取数据并录入到会计软件
- 方案：结合 OCR 和桌面自动化实现数据提取和录入
- **具体步骤**：
  1. 安装 UI.Vision 桌面自动化组件（XModules）
  2. 创建新宏，添加 OCR 步骤：
     ```
     1. OCR Read Text → 识别发票日期
     2. OCR Read Text → 识别发票金额
     3. OCR Read Text → 识别发票号码
     ```
  3. 添加桌面自动化步骤：
     ```
     4. Click Image → 点击会计软件图标
     5. Wait → 等待软件启动
     6. Click Image → 点击"新建凭证"按钮
     7. Type Text → 输入发票日期（使用变量 ${date}）
     8. Type Text → 输入发票金额（使用变量 ${amount}）
     9. Type Text → 输入发票号码（使用变量 ${invoice_no}）
     10. Click Image → 点击"保存"按钮
     ```
  4. 使用 Loop 功能遍历文件夹中的所有 PDF
  5. 测试运行一次，验证 OCR 识别准确率
  6. 保存宏并设置批量处理模式
- 效果：100 张发票从 3 小时缩减到 15 分钟

**场景 3：测试人员 - Web 应用自动化测试**
- 痛点：每次发布新版本都要手动测试用户注册流程
- 方案：创建自动化测试脚本，每次发布前自动运行
- **具体步骤**：
  1. 安装 UI.Vision 浏览器扩展
  2. 创建测试宏，录制注册流程：
     ```
     1. Open → https://yourwebsite.com/signup
     2. Click → 用户名输入框（CSS selector: #username）
     3. Type → testuser${!RandomNumber}
     4. Click → 邮箱输入框（CSS selector: #email）
     5. Type → test${!RandomNumber}@example.com
     6. Click → 密码输入框（CSS selector: #password）
     7. Type → TestPassword123!
     8. Click → 注册按钮（CSS selector: button[type="submit"]）
     9. Verify → 检查成功提示（CSS selector: .success-message）
     ```
  3. 添加"Visual Assert"步骤验证页面元素：
     - 截图保存期望的注册成功页面
     - 设置断言检查关键元素是否存在
  4. 使用"Assert"命令验证元素内容
  5. 集成到 CI/CD 流程（命令行运行）：
     ```bash
     # 在命令行运行测试
     ui.vision rpa --macro registration_test --headless
     ```
  6. 每次代码提交后自动运行测试
  7. 测试失败时发送邮件通知
- 效果：5 分钟完成完整回归测试，零遗漏

👥 **适合谁用？**

✅ 需要重复操作网页的运营人员
✅ 需要自动化桌面软件的办公人员
✅ QA 测试工程师（Web 应用测试）
✅ 数据分析师（网页数据抓取）
✅ 想学习 RPA 的初学者
❌ 需要复杂后端集成的场景（建议用 Zapier 或 n8n）
❌ 只偶尔用电脑的人（学习成本不值得）

⚠️ **注意事项**

- **价格**：完全免费开源，无任何功能限制
- **学习曲线**：⭐⭐⭐☆☆（基础 3-5 小时，高级功能 1-2 周）
- **跨平台支持**：Windows、macOS、Linux 全平台支持
- **浏览器支持**：Chrome、Firefox、Edge
- **桌面自动化**：需要安装额外的 XModules 组件
- **OCR 准确率**：取决于图片质量，建议 90% 以上准确率的场景使用
- **社区支持**：有详细的文档和视频教程，社区活跃
- **企业版**：提供企业级支持和技术服务（可选）

**🎯 UI.Vision 的独特优势**

1. **三合一功能**：Web 自动化 + 桌面自动化 + Selenium IDE
2. **免费开源**：无功能限制，无使用时间限制
3. **跨平台**：Windows、Mac、Linux 都能用
4. **视觉识别**：通过图像和文字识别，能处理传统自动化工具无法处理的场景
5. **低代码**：录制回放为主，无需编程基础
6. **可编程**：支持 JavaScript 高级定制
7. **CI/CD 集成**：可以集成到持续集成流程中

**📚 学习资源**

- 官方文档：https://ui.vision/rpa/docs
- 视频教程：https://www.youtube.com/@ui Vision（12 分钟快速入门）
- 桌面自动化指南：https://ui.vision/rpa/x/desktop-automation
- 社区论坛：https://forum.ui.vision/

**🔄 替代方案对比**

- **Selenium IDE**：只支持浏览器，不支持桌面自动化
- **UiPath**：功能强大但价格昂贵（企业级）
- **AutoHotkey**：只支持 Windows，学习曲线陡峭
- **Zapier**：偏向云端应用集成，不支持桌面软件
- **n8n**：开源自托管，但主要连接 Web 服务

**💡 进阶技巧**

1. **命令行运行**：可以在 CI/CD 流程中运行
   ```bash
   ui.vision rpa --macro my_macro --headless
   ```

2. **变量和循环**：支持动态数据处理
   ```
   {
     "urls": ["url1", "url2", "url3"]
   }
   ```

3. **条件判断**：支持 if/then 逻辑
   ```
   if (${image_found} == true)
     click_image("button.png")
   ```

4. **API 集成**：可以通过 HTTP API 与其他系统集成
