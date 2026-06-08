---
layout: post
title: "免费整合16家AI额度：FreeLLMAPI"
date: 2026-06-08
tags: [AI, 开发, API, 自动化]
header-style: 'text'
subtitle: "免费整合16家AI服务商的额度，用一个接口调用约17亿tokens/月"
---

> 原网址：https://github.com/tashfeenahmed/freellmapi

---

## 📌 一句话总结
免费整合16家AI服务商的额度，用一个接口调用约17亿tokens/月

## 🎯 它是做什么的？

FreeLLMAPI 是一个"AI服务聚合器"和"智能翻译官"。它解决了以下痛点：

**深度解决问题：**
- 每个AI服务商都提供免费额度，但分散在16个不同的平台，需要分别注册、调用、管理
- 单个平台的免费额度有限（每天几百万tokens），用完就停服
- 不同服务商的API格式不统一，需要写多套代码

**广度覆盖：**
- 支持 100+ 个模型，从小型快速模型到大型推理模型
- 提供统一的 OpenAI 兼容接口（`/v1/chat/completions`）
- 支持流式输出、工具调用、嵌入向量、视觉输入

**核心价值：**
将 Google、Groq、Cerebras、Mistral、OpenRouter、GitHub Models、Cohere、Cloudflare、HuggingFace、Z.ai（智谱）、Ollama 等 16 家服务商的免费额度整合在一起，每月约 **17 亿 tokens** 的免费推理能力，全部通过一个统一接口调用。

## 🔑 核心概念解读

**1. OpenAI 兼容代理**
- 专业说：实现 OpenAI API 规范的中间代理服务器
- 通俗说：就像"万能转接头"——不管你家的插头是美国标准、欧洲标准还是中国标准，这个转接头都能让你用同一个插座充电
- 生活类比：类似于 Google 翻译，你输入中文，它自动翻译成英文发给外国人，再把英文回复翻译回中文给你

**2. 智能路由**
- 专业说：基于可用性、速率限制、优先级的自动负载均衡系统
- 通俗说：就像"智能导航"——出发时自动避开拥堵路段，选择当前最快的那条路
- 生活类比：网约车平台的派单系统，哪个司机最近、最空闲就派给谁

**3. 自动故障转移**
- 专业说：当主要服务不可用时自动切换到备用服务
- 通俗说：就像"备用发电机"——主电断了自动切到备用电源，你根本感觉不到中断
- 生活类比：手机在 WiFi 信号弱时自动切换到 4G 网络

**4. 免费额度聚合**
- 专业说：跨多平台的资源池化与统一调度
- 通俗说：就像"拼团"——把每个人手里的零钱凑在一起，变成一笔大钱
- 生活类比：你有 5 张不同超市的会员卡，每张卡都有 10 元优惠券，这个工具让你在结账时自动用光所有优惠券

## 💡 切实可落地的例子

### 场景 1：独立开发者原型验证

**痛点：**
想做一个 AI 应用原型，但：
- Gemini 免费额度每天只能用 150 次
- Groq 免费额度虽然快但每天限制 20 requests/min
- 测试到一半就触发 429 Too Many Requests

**解决方案：**
通过 FreeLLMAPI 整合所有免费额度，自动切换服务商

**具体实现步骤：**

1. 安装 Docker（如果未安装）
```bash
# macOS/Linux
curl -fsSL https://get.docker.com | sh

# 验证安装
docker --version
```

2. 部署 FreeLLMAPI
```bash
# 克隆仓库
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi

# 生成加密密钥
ENCRYPTION_KEY="$(openssl rand -hex 32)"
printf "ENCRYPTION_KEY=%s\nPORT=3001\n" "$ENCRYPTION_KEY" > .env

# 启动服务
docker compose up -d

# 查看日志确认启动成功
docker compose logs -f freellmapi
```

3. 访问管理后台
```
打开浏览器访问：http://localhost:3001
首次访问会要求设置邮箱和密码
```

4. 在 Keys 页面添加各个服务商的免费 API Key：
- Google AI Studio: 获取 Gemini key
- Groq: 注册获取免费 key
- Mistral: 免费注册获取 key
- 其他服务商按需添加

5. 获取统一 API Key
```
在 Keys 页面顶部会显示你的统一 key：
freellmapi-xxxxx...
```

6. Python 代码调用
```python
from openai import OpenAI

# 只需改 base_url，其他代码完全不变
client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="freellmapi-your-unified-key",
)

# 自动路由到可用的服务商
response = client.chat.completions.create(
    model="auto",  # 让系统自动选择最优模型
    messages=[{
        "role": "user",
        "content": "用通俗的话解释什么是微服务架构"
    }],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)

# 查看实际路由了哪个服务商
print("\n路由服务:", response.headers.get("x-routed-via"))
```

**实际效果：**
- 每月 17 亿 tokens 的免费额度
- 单个服务商限速时自动切换到另一个
- 测试期间零成本，支持高频调试

---

### 场景 2：小团队的内部 AI 工具

**痛点：**
3 人小团队开发内部知识库问答系统：
- 需要 embeddings + chat 两个功能
- 每天几千次查询，单个免费额度不够
- 团队成员每人都要注册多个账号太麻烦

**解决方案：**
部署一台共享的 FreeLLMAPI 服务器，团队统一调用

**具体实现步骤：**

1. 在团队服务器部署（假设内网 IP 192.168.1.100）
```bash
# 在服务器上执行
cd freellmapi
HOST_BIND=0.0.0.0 docker compose up -d
```

2. 配置团队共享的 API Keys
```bash
# 在管理后台添加团队账号的服务商 keys
# - 3 个 Google Keys（团队成员各自贡献）
# - 2 个 Groq Keys
# - 1 个 OpenRouter Key（团队共用账号）
```

3. 团队成员统一调用
```python
# team_config.py - 团队共享配置
FREELLMAPI_BASE = "http://192.168.1.100:3001/v1"
FREELLMAPI_KEY = "freellmapi-team-shared-key"

# 知识库查询模块
from openai import OpenAI
import numpy as np

class KnowledgeBase:
    def __init__(self):
        self.client = OpenAI(
            base_url=FREELLMAPI_BASE,
            api_key=FREELLMAPI_KEY,
        )

    def embed_documents(self, texts):
        """文档向量化"""
        resp = self.client.embeddings.create(
            model="auto",  # 自动选择 embeddings 服务
            input=texts
        )
        return [item.embedding for item in resp.data]

    def search_and_answer(self, query, context_docs):
        """搜索 + 生成答案"""
        # 1. 向量化查询
        query_embedding = self.embed_documents([query])[0]

        # 2. 相似度搜索（简化示例）
        # 实际项目用 FAISS 或 pgvector

        # 3. 生成答案
        response = self.client.chat.completions.create(
            model="auto",
            messages=[{
                "role": "system",
                "content": "你是公司知识库助手，基于以下上下文回答问题："
            }, {
                "role": "user",
                "content": f"问题：{query}\n上下文：{context_docs}"
            }]
        )
        return response.choices[0].message.content

# 团队成员使用
kb = KnowledgeBase()
answer = kb.search_and_answer(
    "公司的报销流程是什么？",
    "从文档系统检索到的相关段落..."
)
print(answer)
```

4. 监控使用情况
```bash
# 在管理后台 Analytics 页面查看：
# - 每日请求数
# - 各服务商使用比例
# - 成功率和延迟分布
```

**实际效果：**
- 团队统一管理，每人维护多个账号的混乱消失
- 自动负载均衡，避免单个账号超限
- 内网部署，数据不出公司网络

---

### 场景 3：AI 创业公司的降本方案

**痛点：**
创业公司做 AI 功能 MVP：
- GPT-4 API 每月成本 $500+ 太贵
- 免费服务商质量参差不齐，不知道选哪个
- 需要快速验证市场，不锁定单一供应商

**解决方案：**
用 FreeLLMAPI 做 MVP 验证，有收入后再切换付费服务

**具体实现步骤：**

1. 设计多层级路由策略
```python
# config/routing_strategy.py
FALLBACK_CHAIN = [
    # 第一梯队：高质量模型（低日限额）
    {"model": "gemini-2.5-flash", "priority": 1},
    {"model": "gpt-4o-mini", "provider": "github_models", "priority": 1},

    # 第二梯队：平衡模型（中限额）
    {"model": "llama-3.3-70b", "provider": "groq", "priority": 2},
    {"model": "mixtral-8x7b", "provider": "mistral", "priority": 2},

    # 第三梯队：快速模型（高限额）
    {"model": "qwen-3-235b", "provider": "cerebras", "priority": 3},
    {"model": "gpt-oss-20b", "provider": "pollinations", "priority": 3},
]

# 在 FreeLLMAPI 管理后台 Fallback Chain 页面配置优先级
```

2. 实现降级逻辑
```python
# app/ai_service.py
from openai import OpenAI
import logging

class AIServiceWithFallback:
    def __init__(self):
        self.client = OpenAI(
            base_url="http://localhost:3001/v1",
            api_key="freellmapi-production-key",
        )
        self.logger = logging.getLogger(__name__)

    def generate_marketing_copy(self, product_info):
        """生成营销文案"""
        try:
            response = self.client.chat.completions.create(
                model="auto",  # 自动按优先级路由
                messages=[{
                    "role": "system",
                    "content": "你是专业文案写手，基于产品信息生成营销文案"
                }, {
                    "role": "user",
                    "content": f"产品信息：{product_info}\n请生成3个版本的营销文案"
                }],
                temperature=0.7,
            )

            # 记录实际使用的服务商
            provider = response.headers.get("x-routed-via")
            self.logger.info(f"文案生成使用服务: {provider}")

            return response.choices[0].message.content

        except Exception as e:
            self.logger.error(f"文案生成失败: {e}")
            # 降级：返回模板文案
            return self._template_copy(product_info)

    def _template_copy(self, product_info):
        """降级模板文案"""
        return f"""
        【{product_info.get('name', '产品')}】
        核心特点：{product_info.get('features', '请联系我们了解详情')}
        限时优惠中，点击了解详情！
        """
```

3. 成本追踪
```bash
# 定期检查 FreeLLMAPI 的 Analytics
# - 每月 token 使用量
# - 各服务商贡献比例
# - 估算节省成本（对比 GPT-4 定价）
```

4. 市场验证后迁移付费
```python
# 当月活用户 > 1000 时，切换到付费服务
# 只需修改 base_url，代码不变
production_client = OpenAI(
    base_url="https://api.openai.com/v1",  # 切换到官方 API
    api_key="sk-paid-prod-key",
)
```

**实际效果：**
- MVP 阶段零 API 成本
- 验证市场需求后再投入
- 无需重写代码，平滑迁移

## 👥 适合谁用？

✅ **个人开发者/学生**
- 学习 AI API 开发
- 做毕业设计/个人项目
- 验证创意想法

✅ **小团队/创业公司**
- 内部工具开发
- MVP 原型验证
- 降低研发成本

✅ **AI 爱好者/研究者**
- 对比不同模型效果
- 研究模型能力边界
- 部署本地服务

❌ **不适合：**
- 企业生产环境（免费额度无 SLA）
- 大规模商用（免费额度有限）
- 需要顶级模型（GPT-5 级别推理能力）

## ⚠️ 注意事项

**免费额度情况：**
- ✅ 完全免费：17 亿 tokens/月（整合所有平台）
- ✅ 无需付费：开源项目，自托管即可
- ⚠️ 需要注册：需要在各平台分别注册免费账号

**学习曲线：**
- ⭐⭐☆☆☆（1-2 小时上手）
- Docker 部署非常简单
- 管理后台界面友好
- API 调用与 OpenAI SDK 完全兼容

**使用限制：**
- 每个服务商的免费额度不同
- 高质量模型日限额较低
- 深夜时段可能智能模型耗尽，自动降级到小模型
- 免费 tier 可能随时变更

**替代方案：**
- **OpenRouter**：直接使用多平台聚合服务（需付费）
- **One API**：类似项目，但更偏向国内服务商
- **自建聚合**：自己写聚合逻辑（开发成本高）

**风险提示：**
- 免费 tier 无 SLA 保证
- 服务商可能随时修改免费政策
- 不适合关键业务依赖
- 建议用于学习/实验/原型验证
