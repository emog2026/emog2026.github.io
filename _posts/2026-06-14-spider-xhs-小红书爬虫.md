---
layout: post
title: "为 AI 运营 Agent 提供小红书数据采集与发布能力：Spider_XHS"
date: 2026-06-14
tags: [AI, 爬虫, 小红书, 数据采集, 开发]
header-style: 'text'
subtitle: "为 AI 运营 Agent 提供小红书数据采集与内容发布的底层 API 库"
---

> 原网址：https://github.com/cv-cat/Spider_XHS

---

## 📌 一句话总结

为 AI 运营 Agent 提供小红书数据采集与内容发布的底层 API 库，解决签名算法与接口封装问题

---

## 🎯 它是做什么的？

### 深度：能解决什么实际问题

在 AI 大模型爆发的时代，内容运营的竞争本质是**效率竞争**。想要用 AI 自动化运营小红书，首先要解决两个前置问题：

1. **能稳定读取小红书数据**（笔记、用户、评论、KOL 信息）
2. **能自动发布内容到小红书**（图集、视频上传）

Spider_XHS 解决的就是这两个问题：

- 逆向还原了小红书 PC 端与创作者平台的签名算法（a1、web_id、x-s、x-t 等 15+ 个参数）
- 封装全部核心 HTTP 接口，签名参数已透明处理
- 同时覆盖**数据采集**（PC端）、**内容发布**（创作者平台）、**KOL数据**（蒲公英）三大场景

**一句话：你负责接 AI 大脑，我们负责打通小红书的神经。**

### 广度：核心功能范围

| 模块 | 功能 |
|------|------|
| **PC 端 API** | 登录、搜索笔记/用户、获取笔记详情、评论、用户信息、主页推荐、未读消息 |
| **创作者平台 API** | 登录、上传图集/视频作品、查看已发布作品列表 |
| **蒲公英平台 API** | 获取 KOL 博主列表、粉丝画像、历史趋势、发起合作邀请 |
| **千帆平台 API** | 获取分销商列表、详细数据、合作品类/店铺/商品信息 |
| **Skills 支持** | 可被 Clawbot、Claude Code、Codex 等工具直接引入 |

### 对比：和同类产品的区别

| 传统方案 | Spider_XHS |
|----------|------------|
| 自己写爬虫 | 签名算法已封装，开箱即用 |
| 购买第三方数据 | 开源免费，数据完全可控 |
| 只有采集功能 | 同时支持采集 + 发布 + KOL 数据 |
| 需要频繁维护 | 持续更新，跟随平台变化 |

---

## 🔑 核心概念解读

### 1. 签名算法逆向
- **专业说**：逆向分析小红书请求签名参数（a1、x-s、x-t、x-rap-param 等）的生成逻辑
- **通俗说**：破解了小红书的"身份证验证系统"，让程序能以正常用户身份调用接口
- **生活中的类比**：就像拿到了官方的"通行证"，可以通过所有关卡

### 2. API 透明封装
- **专业说**：将复杂签名逻辑封装在内部，对外提供简洁的函数接口
- **通俗说**：你不需要知道签名怎么算，直接调函数拿数据就行
- **生活中的类比**：就像开车不需要懂发动机原理，踩油门就能走

### 3. JSVMP 本地生成
- **专业说**：通过 JavaScript VMP 虚拟机在本地生成动态风控参数（x-rap-param、search_id）
- **通俗说**：最难防的动态参数也能本地生成，不依赖远程服务
- **生活中的类比**：就像自己会印钞票，不需要去银行取

### 4. 多平台覆盖
- **专业说**：同时支持 PC 端（采集）、创作者平台（发布）、蒲公英（KOL 数据）
- **通俗说**：小红书的三个主要平台都能用，一个库搞定全部
- **生活中的类比**：就像一张万能通行证，全平台通用

### 5. Skills 接入
- **专业说**：支持标准化 Skills 格式，可被上层 Agent 工具链引入
- **通俗说**：可以直接在 Claude Code、Clawbot 等工具里用，不用自己写代码
- **生活中的类比**：像插件一样，装上就能用

---

## 💡 切实可落地的例子（3 个场景）

### 场景 1：竞品笔记采集 + AI 改写 + 自动发布

**痛点**：看到竞品的爆款笔记，手动复制粘贴改写太慢

**解决方案**：用 Spider_XHS 采集 → AI 改写 → 自动发布

**具体实现步骤**：

```python
from apis.xhs_pc_apis import XHS_Apis
from apis.xhs_creator_apis import XHS_Creator_Apis

# 初始化 API
pc_api = XHS_Apis()
creator_api = XHS_Creator_Apis()

# 1. 采集竞品笔记
note_url = "https://www.xiaohongshu.com/explore/xxxxx"
success, msg, note = pc_api.get_note_info(note_url, cookies_str)

if success:
    # 2. 交给 AI 改写（接入任意大模型）
    rewritten = your_ai_agent(note['content'])  # GPT / Claude / Qwen
    
    # 3. 自动上传到创作者平台
    result = creator_api.post_note({
        "title": rewritten['title'],
        "desc": rewritten['desc'],
        "media_type": "image",
        "images": note['images'],  # 或 AI 生成的图片
        "topics": rewritten['tags'],
    }, creator_cookies_str)
```

**效果**：竞品发爆款 5 分钟内你的内容也上线

---

### 场景 2：关键词监控 + AI 趋势分析

**痛点**：想了解某个关键词在小红书的最新趋势，手动刷太累

**解决方案**：定时搜索关键词，交给 AI 分析

**具体实现步骤**：

```python
from apis.xhs_pc_apis import XHS_Apis

pc_api = XHS_Apis()

# 搜索指定关键词的最新笔记
success, msg, notes = pc_api.search_some_note(
    query="夏季护肤",      # 关键词
    require_num=50,        # 需要 50 条
    cookies_str=cookies,
    sort="general"         # 排序：综合/热门/最新
)

if success:
    # 交给 AI 分析趋势
    analysis = your_ai_agent(notes)
    # AI 输出：热门话题、高频词、互动趋势等
```

**效果**：每天自动生成行业趋势报告

---

### 场景 3：KOL 筛选 + 智能匹配

**痛点**：品牌想找合适的 KOL 合作，蒲公英平台人工筛选太慢

**解决方案**：批量获取 KOL 数据，AI 匹配最合适的博主

**具体实现步骤**：

```python
from apis.xhs_pugongying_apis import PuGongYingAPI

pgy = PuGongYingAPI()

# 获取目标类目的 KOL 数据
kol_list = pgy.get_some_user(
    num=50,           # 获取 50 个
    category="美妆",  # 美妆类目
    cookies=cookies
)

if kol_list['success']:
    # 交给 AI 评估匹配度
    brand_profile = {
        "budget": 10000,
        "target_audience": "18-25岁女性",
        "product_category": "护肤品"
    }
    best_kols = your_ai_agent(kol_list['data'], brand_profile)
    # AI 输出：按匹配度排序的 KOL 列表
```

**效果**：从 500 个 KOL 中筛选出最合适的 10 个，省时 90%

---

## 👥 适合谁用？

✅ **AI 应用开发者** — 构建小红书运营 Agent
✅ **数据分析师** — 采集小红书数据进行趋势分析
✅ **品牌方 / MCN** — KOL 筛选、竞品监控
✅ **内容创作者** — 批量采集素材、自动发布

❌ **完全不会写代码的非技术人员** — 需要编程能力
❌ **只想偶尔发一条笔记的个人用户** — 杀鸡不用牛刀

---

## ⚠️ 注意事项

- **开源免费**：MIT License，完全开源
- **学习曲线**：⭐⭐⭐⭐☆（需要 Python 基础 + 理解 API 调用）
- **技术要求**：Python 3.10+、需要小红书登录 Cookie
- **合规性**：项目注明仅供学习交流使用，禁止商业化
- **维护性**：持续更新，跟随小红书平台变化
- **替代方案**：
  - 纯手动：人工操作（慢）
  - 第三方平台：新红书、灰豚数据（付费、数据不可控）

---

## 🛠️ 快速开始

### 环境要求

- Python 3.10+
- Node.js 20+

### 安装

```bash
pip install -r requirements.txt
npm install
```

### 配置 Cookie

在项目根目录的 `.env` 文件中填入你的登录 Cookie：

```bash
COOKIES='your_cookie_here'
```

Cookie 获取方式：浏览器登录小红书后，按 `F12` 打开开发者工具 → 网络 → 找任意一个请求 → 复制请求头中的 `cookie` 字段。

### 运行示例

```python
from apis.xhs_pc_apis import XHS_Apis

api = XHS_Apis()
success, msg, note = api.get_note_info(note_url, cookies)
```

---

## 🏗️ 项目结构

```
Spider_XHS/
├── spider/
│   ├── __init__.py
│   └── spider.py                    # 主入口：爬虫调用示例
├── apis/
│   ├── xhs_pc_apis.py               # 小红书PC端完整API（采集）
│   ├── xhs_creator_apis.py          # 创作者平台API（上传发布）
│   ├── xhs_pc_login_apis.py         # PC端登录（二维码/手机验证码）
│   ├── xhs_creator_login_apis.py    # 创作者平台登录
│   ├── xhs_pugongying_apis.py       # 蒲公英平台API（KOL数据）
│   └── xhs_qianfan_apis.py          # 千帆平台API（分销商数据）
├── xhs_utils/
│   ├── common_util.py               # 初始化工具（读取.env配置）
│   ├── cookie_util.py               # Cookie解析
│   ├── data_util.py                 # 数据处理（Excel保存、媒体下载）
│   ├── xhs_util.py                  # PC端签名算法封装
│   ├── xhs_creator_util.py          # 创作者平台签名算法封装
│   ├── xhs_pugongying_util.py       # 蒲公英平台工具
│   └── xhs_qianfan_util.py          # 千帆平台工具
├── static/
│   ├── xhs_main_260411.js           # PC端签名核心JS（最新版）
│   ├── xhs_rap.js                   # PC端 x-rap-param JSVMP 生成脚本
│   ├── xhs_creator_260411.js        # 创作者平台签名核心JS（最新版）
│   └── ...
├── .env                             # Cookie配置（不要提交到git）
├── requirements.txt
├── Dockerfile
└── package.json
```

---

## 🔗 相关资源

- **GitHub 仓库**：https://github.com/cv-cat/Spider_XHS
- **成品应用**：XHS_ALL_IN_ONE（完整运营平台）
- **Skills 仓库**：XhsSkills（Agent Skills 封装）
- **作者主页**：GitHub @cv-cat

---

*⚠️ 本项目仅供学习交流使用，禁止任何商业化行为，如有违反，后果自负*
