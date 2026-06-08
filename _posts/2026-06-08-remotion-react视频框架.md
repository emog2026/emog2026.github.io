---
layout: post
title: "用代码写视频：Remotion"
date: 2026-06-08
tags: [开发, 视频, React, 自动化]
header-style: 'text'
subtitle: "用 React 代码写视频，让程序化视频创作变得像写网页一样简单"
---

> 原网址：https://github.com/remotion-dev/remotion

---

📌 **一句话总结**：用 React 代码写视频，让程序化视频创作变得像写网页一样简单

---

🎯 **它是做什么的？**

Remotion 是一个"视频编程框架"。它的核心理念是：**既然你能用 HTML/CSS/JavaScript 写网页，为什么不能用同样的技术写视频？**

传统的视频制作需要：
- 用 Premiere/Final Cut 手动拖拽时间轴
- 用 After Effects 做动画（很贵的学习曲线）
- 难以批量生成、难以动态化、难以版本控制

Remotion 让你：
- 用 **React 组件**描述视频的每一帧
- 用 **JavaScript**控制时间轴、动画、数据绑定
- 用 **CSS/Canvas/WebGL**做视觉效果
- 像部署网页一样渲染和分发视频

**核心价值**：
- ✅ **程序化**：自动生成 1000 个个性化视频（比如"你的年度数据报告"）
- ✅ **可维护**：视频是代码，可以 Git 版本控制、Code Review、自动化测试
- ✅ **Web 技术栈**：前端开发者已有的技能直接复用
- ✅ **动态化**：视频内容可以从 API/数据库实时获取

**对比同类**：
- **Lottie (Bodymovin)**：只能导 After Effects 动画，Remotion 是完整框架
- **ffmpeg**：底层工具，需要手写渲染逻辑；Remotion 是高层抽象
- **Puppeteer/Playwright 录屏**：只能录网页；Remotion 是为视频设计、可精确控制时间轴

---

🔑 **核心概念解读**

**Composition（视频组件）**
- **专业说法**：定义视频内容的 React 组件，包含时长、FPS、分辨率等元数据
- **通俗解释**：就像PPT里的一个"幻灯片模板"，但它是活的——可以用代码控制每一帧的内容
- **生活类比**：传统视频 = 一张张照片连起来播放；Remotion Composition = 一个"函数"，输入时间 `t`，输出那一帧的画面

**Frame（帧）**
- **专业说法**：时间轴上的某一时刻，由 React 组件渲染出的画面
- **通俗解释**：视频的每一"格"，就像翻书动画的每一页
- **生活类比**：`t=0s` 是第一页，`t=3.5s` 是第 90 页（30fps 的话）

**Sequence（序列）**
- **专业说法**：组合多个 Composition 形成完整视频的时间轴结构
- **通俗解释**：像把多个短视频片段按顺序拼接起来
- **生活类比**：视频剪辑软件的"多轨道"，但用代码描述

**Spring Animation（弹性动画）**
- **专业说法**：基于物理的动画系统，用 `useSpring()` hook 实现自然的弹性效果
- **通俗解释**：不用手写 `@keyframes`，告诉 Remotion"从 A 弹到 B"，它自动算中间的每一帧
- **生活类比**：真实世界物体有惯性和弹性，Remotion 的动画模拟这种物理特性

---

💡 **切实可落地的例子**

### 场景 1：独立开发者 - 产品介绍视频

**痛点**：
- 做 10 分钟的产品演示视频，传统方式需要 After Effects + 数天学习
- 改个 UI 颜色要重新渲染整个视频
- 无法生成 100 个客户的个性化版本

**解决方案**：
用 Remotion 把产品 UI 直接"拍"成视频，所有元素都是 React 组件。

**具体实现步骤**：

```bash
# 1. 创建项目
npx create-video@latest my-product-video
cd my-product-video

# 2. 创建一个演示组件
# src/MyDemo.tsx
import {useCurrentFrame, useVideoConfig} from 'remotion';

export const MyDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = Math.min(1, frame / (fps * 2)); // 前2秒淡入

  return (
    <div style={{opacity, backgroundColor: '#0f172a', color: 'white'}}>
      <h1>我的产品介绍</h1>
      <ProductShowcase /> // 你现有的 React 组件！
      <CallToAction />
    </div>
  );
};

# 3. 定义视频配置
# src/Root.tsx
import {Composition} from 'remotion';
import {MyDemo} from './MyDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="my-demo"
        component={MyDemo}
        durationInFrames={30 * 60} // 60秒 @ 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

# 4. 渲染视频
npx remotion render my-demo out/video.mp4
```

**效果**：
- 10 分钟写完演示脚本
- 改 UI = 改代码，一键重渲染
- 可以从 API 获取客户名字，生成 100 个个性化版本

---

### 场景 2：内容创业公司 - 自动化社交媒体视频

**痛点**：
- 每周要发 10 个技术讲解视频到 TikTok/YouTube
- 手动做动画太慢，外包太贵
- 数据可视化视频（比如"比特币价格走势"）难以实时更新

**解决方案**：
用 Remotion 做模板 + 数据驱动，自动生成视频。

**具体实现步骤**：

```bash
# 1. 数据驱动的模板
# src/DataVideo.tsx
import {useFrame, useVideoConfig, interpolate} from 'remotion';
import { fetchData } from './api'; // 你的 API

export const DataVideo: React.FC<{data: ChartData}> = ({data}) => {
  const frame = useFrame();
  const {fps} = useVideoConfig();
  const progress = frame / (30 * 15); // 15秒

  // 动态绘制图表
  const chartPath = data.points.map((point, i) => {
    const x = interpolate(i, [0, data.points.length], [0, 1920]);
    const y = interpolate(point.value, [data.min, data.max], [1080, 0]);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{background: 'linear-gradient(to bottom, #1e293b, #0f172a)'}}>
      <h1 style={{fontSize: 80, color: '#38bdf8'}}>
        本周技术趋势 #{data.week}
      </h1>
      <svg viewBox="0 0 1920 1080">
        <path d={`M${chartPath}`} stroke="#38bdf8" strokeWidth="8" fill="none" />
      </svg>
      <div style={{position: 'absolute', bottom: 100, right: 100}}>
        关注获取更多数据洞察
      </div>
    </div>
  );
};

# 2. 批量生成脚本
# scripts/generate-videos.js
import {bundle} from '@remotion/bundler';
import {renderMedia} from '@remotion/renderer';
import {getDataForWeek} from '../src/api';

for (let week = 1; week <= 10; week++) {
  const data = await getDataForWeek(week);
  await renderMedia({
    composition: {
      id: 'data-video',
      component: DataVideo,
      props: {data},
      durationInFrames: 30 * 15,
      fps: 30,
      width: 1080, // TikTok 竖屏
      height: 1920,
    },
    output: `output/week-${week}.mp4`,
  });
}
```

**效果**：
- 一次写模板，自动生成 10 周内容
- 数据更新 = 视频更新
- 可批量输出不同尺寸（YouTube 16:9、TikTok 9:16）

---

### 场景 3：企业 SaaS - 客户成功视频

**痛点**：
- 客户要求"给我做个教程视频，要我们公司的 Logo"
- B2B 软件有 500 个功能，每个都要 3 分钟演示
- 传统方式：录屏 + 手动剪辑，耗时长且难维护

**解决方案**：
用 Remotion 把产品 UI"组件化"，自动生成功能演示。

**具体实现步骤**：

```bash
# 1. 产品 UI 组件（复用现有代码！）
# src/ProductDemo.tsx
import {useCurrentFrame, spring, useVideoConfig} from 'remotion';
import {ProductTour} from '@my-company/ui'; // 现有的产品 UI

export const ProductDemo: React.FC<{featureName: string}> = ({featureName}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 弹性动画
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {damping: 100},
  });

  return (
    <div style={{transform: `scale(${scale})`, transformOrigin: 'left'}}>
      <ProductTour feature={featureName} />
      <div style={{position: 'absolute', bottom: 50}}>
        <img src="/customer-logo.png" /> // 动态 Logo
      </div>
    </div>
  );
};

# 2. 为每个功能生成视频
# scripts/batch-render.ts
const features = ['dashboard', 'analytics', 'settings', /*...496 more*/];

for (const feature of features) {
  await renderMedia({
    composition: {
      id: 'feature-demo',
      component: ProductDemo,
      props: {featureName: feature},
      durationInFrames: 30 * 180, // 3分钟
      fps: 30,
      width: 1920,
      height: 1080,
    },
    output: `demos/${feature}.mp4`,
  });
}
```

**效果**：
- 500 个功能演示自动生成
- 产品更新 = 视频自动更新
- 可嵌入客户 Logo，一键生成白标版本

---

👥 **适合谁用？**

✅ **前端开发者**：你会 React，你就能做视频（零学习曲线）
✅ **内容创作者**：需要批量生成、数据驱动、个性化视频
✅ **SaaS 公司**：产品演示、客户成功视频、营销素材
✅ **数据团队**：数据可视化、年度报告、自动化仪表盘录屏

❌ **不适合**：
- 传统视频剪辑师（不需要代码）
- 一次性的简单视频（杀鸡不用牛刀）
- 纯艺术创作（Remotion 更偏向技术向）

---

⚠️ **注意事项**

**许可证模式**：
- ✅ **个人项目/开源**：免费
- ✅ **公司年收入 < $1M**：免费
- ⚠️ **公司年收入 ≥ $1M**：需要购买商业许可证（参考 remotion.pro/license）
- 💡 原因：Remotion 是"开源核心 + 商业许可"模式，类似 MongoDB

**学习曲线**：
- 需要 React 基础（⭐⭐⭐☆☆）
- 熟悉 CSS 动画更好（但不是必须）
- 不需要视频剪辑经验

**技术栈**：
- Node.js 18+
- React 18+
- TypeScript（推荐但可选）

**替代方案**：
- **ffmpeg**：底层命令行工具，需要手写渲染逻辑
- **Puppeteer 录屏**：只能录网页，不能精确控制时间轴
- **Lottie**：只能导 After Effects 动画，不是完整框架
- **Manim (Python)**：数学动画专用，Remotion 更通用