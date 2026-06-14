---
layout: post
title: "整合16家免费LLM服务，每月约17亿token额度的统一API代理：FreeLLMAPI"
date: 2026-06-14
tags: [开发, AI, LLM, 开源, API代理, 自托管]
header-style: 'text'
subtitle: "整合16家免费LLM服务，每月约17亿token额度的统一API代理"
---

> 原网址：https://github.com/tashfeenahmed/freellmapi

---

📌 **一句话总结**：整合16家免费LLM服务，每月约17亿token额度的统一API代理

---

## 🎯 它是做什么的？

**FreeLLMAPI** 是一个"免费 LLM 聚合器"。

**核心问题**：现在几乎每个 AI 实验室都提供免费层，但每个单独看都像玩具——每天几千次请求，每月几百万 tokens。如果你想用多个服务商，就要面对 16+ 套不同的 SDK、不同的限流规则、不同的错误处理。

**解决方案**：FreeLLMAPI 把这 16 家（Google、Groq、Cerebras、NVIDIA、Mistral、OpenRouter、GitHub Models、Cohere、Cloudflare、HuggingFace、Z.ai、Ollama、Kilo、Pollinations、LLM7、OVH）的免费层整合到**一个** OpenAI 兼容的 `/v1/chat/completions` 端点。

**深度**：路由器自动选择最佳可用模型，当一个服务商触发限流时自动切换到下一个，追踪每个密钥的使用量确保不超过免费配额。

**广度**：支持 100+ 模型，从小型快速模型到 reasonably capable 的模型（Llama 3.3 70B、GLM-4.5、Qwen 3 Coder、Gemini 2.5 Pro）。

**对比**：与付费 API 不同，这里没有前沿模型（GPT-5、Claude Opus），但每月可获约 **1.7B tokens** 的免费额度。

---

## 🔑 核心概念解读

### 1️⃣ OpenAI 兼容代理（OpenAI-compatible Proxy）
- **专业说**：实现了 OpenAI API 的 `/v1/chat/completions` 和 `/v1/models` 端点的代理服务器
- **通俗说**：就像给所有 LLM 服务商装上了同一个"插座"，任何支持 OpenAI 的工具都能直接用
- **生活中的类比**：就像把不同品牌的充电宝都装上 USB-C 接口，一个充电器能通用

### 2️⃣ 智能路由（Smart Routing）
- **专业说**：根据健康状态、速率限制和优先级选择最优模型的算法
- **通俗说**：像快递公司的智能调度，自动选择最快的快递员，如果这个人忙就换下一个
- **生活中的类比**：导航软件实时选择不堵车的路线

### 3️⃣ 自动故障转移（Automatic Failover）
- **专业说**：当返回 429/5xx 或超时时，自动重试下一个服务商的机制
- **通俗说**：就像给每个服务商都配了"替补队员"，主力累了马上有人顶上
- **生活中的类比**：手机信号自动切换到最强的基站

### 4️⃣ 密钥加密存储（Encrypted Key Storage）
- **专业说**：使用 AES-256-GCM 加密算法在 SQLite 中存储 API 密钥
- **通俗说**：把所有密钥锁进保险箱，只有用时才拿出来
- **生活中的类比**：密码管理器，主密码保护所有其他密码

### 5️⃣ 统一 API 密钥（Unified API Key）
- **专业说**：客户端使用单一 `freellmapi-...` bearer token 认证，隔离上游密钥
- **通俗说**：一个钥匙打开所有门，但上游密钥永远不会暴露给应用
- **生活中的类比**：酒店房卡，能开门但见不到总钥匙

---

## 💡 切实可落地的例子（3 个场景）

### **场景 1：个人开发者学习 AI**
- **痛点**：想学习 AI 开发，但 GPT-4 API 太贵，多个免费服务又要写不同的代码
- **方案**：部署 FreeLLMAPI，用统一的 OpenAI SDK 接口调用所有免费服务
- **具体实现**：
```bash
# 一行安装（Docker required）
curl -fsSL https://freellmapi.co/install.sh | bash

# 访问 http://localhost:3001，在各厂商页面添加免费 API 密钥
# 在 Fallback Chain 页面调整优先级
# 在 Keys 页面获取统一密钥：freellmapi-xxxxx
```

```python
# Python 使用示例
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="freellmapi-your-unified-key",  # 用统一密钥
)

resp = client.chat.completions.create(
    model="auto",  # 让路由器自动选择
    messages=[{"role": "user", "content": "解释什么是量子计算"}],
)
print(resp.choices[0].message.content)
print(f"路由通过: {resp.headers.get('x-routed-via')}")  # 查看实际服务商
```

- **效果**：每月约 1.7B tokens 免费额度，足以支持学习和小项目开发

---

### **场景 2：学生研究项目**
- **痛点**：学生预算有限，需要测试不同 LLM 的性能，但没有预算付 API 费
- **方案**：在校园服务器或家用 PC 上运行 FreeLLMAPI，轮询多个免费模型
- **具体实现**：
```bash
# Docker Compose 部署
git clone https://github.com/tashfeenahmed/freellmapi.git
cd freellmapi

# 生成加密密钥
ENCRYPTION_KEY="$(openssl rand -hex 32)"
printf "ENCRYPTION_KEY=%s\nPORT=3001\n" "$ENCRYPTION_KEY" > .env

docker compose up -d
```

```python
# 批量测试不同服务商
models_to_test = [
    "gemini-2.5-flash",
    "llama-3.3-70b",
    "glm-4.5",
    "qwen-3-coder"
]

for model in models_to_test:
    resp = client.chat.completions.create(
        model=model,  # 固定使用特定模型
        messages=[{"role": "user", "content": "写一个快速排序算法"}],
    )
    print(f"{model}: {resp.choices[0].message.content[:100]}...")
```

- **效果**：零成本测试多个模型，研究报告可以有数据支撑

---

### **场景 3：小型创业公司原型开发**
- **痛点**：创业初期没钱买昂贵的 API，需要快速验证 Chatbot 点子
- **方案**：用 FreeLLMAPI 做 MVP，等产品验证后再换付费 API
- **具体实现**：
```python
# 简单聊天机器人
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="freellmapi-your-unified-key",
)

conversation_history = []

def chat(user_message):
    conversation_history.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="auto",
        messages=conversation_history,
        stream=True,  # 支持流式输出
    )

    assistant_message = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            assistant_message += content

    conversation_history.append({"role": "assistant", "content": assistant_message})
    return assistant_message

# 运行聊天
while True:
    user_input = input("\n你: ")
    if user_input.lower() in ["退出", "exit", "quit"]:
        break
    chat(user_input)
```

- **效果**：快速验证产品概念，无需担心 API 费用烧掉创业资金

---

## 👥 适合谁用？

✅ **个人开发者 / 学生**：想学习 LLM 开发，预算有限
✅ **创业公司**：原型阶段，需要快速验证想法
✅ **技术爱好者**：想自托管服务，不依赖第三方
✅ **研究人员**：需要对比不同模型性能
✅ **隐私敏感用户**：数据不愿传给商业 API

❌ **企业生产环境**：免费服务无 SLA，稳定性不够
❌ **需要前沿模型**：这里没有 GPT-5 或 Claude Opus 级别的模型
❌ **大规模应用**：免费层额度有限，不适合高并发场景

---

## ⚠️ 注意事项

**付费情况**：
- 核心功能**完全免费**，开源 MIT 许可
- 可选的 Premium 订阅（$19/年 或 $49 终身），用于获取**实时模型目录**更新
- 免费版使用**月度快照**，也能正常工作

**学习曲线**：⭐⭐☆☆☆（1-2 小时上手）
  - 最简单：一行 curl 命令安装
  - 中等：Docker Compose 部署
  - 高级：本地开发环境运行

**替代方案**：
- **OneAPI**：类似的多服务商聚合，但配置更复杂
- **OpenRouter**：本身是聚合服务商，但没有故障转移
- **直接用各厂商 SDK**：免费但需要自己管理限流和错误

**服务商 ToS 注意**：
- Google Gemini：2026 年 3 月条款缩窄到"专业或商业用途"，自托管代理可辩护但有风险
- GitHub Models：明确限定为"实验"和"原型制作"
- Cohere：条款禁止"个人、家庭或家务目的"，建议避免
- NVIDIA NIM：明确标注"仅供评估，不用于生产"

**技术限制**：
- 不支持图片生成（`/v1/images/*`）
- 不支持语音/音频（`/v1/audio/*`）
- 不支持多人认证（单用户设计）
- 不适合暴露到公网（无多租户安全）

---

## 🔧 技术细节

**支持的主要服务商**：
| 服务商 | 免费模型示例 |
|--------|-------------|
| Google | Gemini 2.5 Flash, 3.x previews |
| Groq | Llama 3.3, Llama 4, GPT-OSS |
| Cerebras | Qwen3 235B |
| Mistral | Large 3, Medium 3.5, Codestral |
| OpenRouter | 21 个免费模型 |
| GitHub Models | GPT-4.1, GPT-4o |
| Cloudflare | Kimi K2, GLM-4.7, GPT-OSS |
| NVIDIA | NIM (40 RPM, 仅供评估) |
| HuggingFace | DeepSeek V4, Kimi K2.6 |
| Ollama Cloud | GLM-4.7, Kimi K2 |
| Z.ai (Zhipu) | GLM-4.5, GLM-4.7 Flash |
| Cohere | Command R+, Command-A |
| ... | |

**核心功能**：
- ✅ OpenAI 兼容的 `/v1/chat/completions` 端点
- ✅ 流式和非流式响应
- ✅ 工具调用（Tool calling）支持
- ✅ Embeddings API（按模型系列路由，不会跨模型故障转移）
- ✅ 自动故障转移（最多 20 次重试）
- ✅ 每密钥速率追踪（RPM, RPD, TPM, TPD）
- ✅ 粘性会话（30 分钟内保持同一模型）
- ✅ 管理面板（React + Vite UI）
- ✅ 请求分析（延迟、token 计数、成功率）

**系统要求**：
- **最低**：Node.js 20+ 或 Docker
- **推荐**：2GB RAM，20GB 磁盘
- **部署**：可在 Windows、macOS、Linux 或 ARM 单板计算机（树莓派）上运行
- **资源占用**：空闲时约 40MB RSS

---

## 📚 相关资源

- **GitHub 仓库**：https://github.com/tashfeenahmed/freellmapi
- **在线模型目录**：https://freellmapi.co
- **许可证**：MIT（完全开源，可自由修改和分发）
- **社区**：GitHub Issues 和 Discussions

---

## 🎯 总结

FreeLLMAPI 是一个非常实用的工具，特别适合预算有限但又想使用多个 LLM 服务的开发者。它通过智能路由和自动故障转移，将 16 家服务商的免费层整合成一个统一的 OpenAI 兼容接口，大大降低了使用门槛。

**最佳适用场景**：
- 个人学习和实验
- 学生研究项目
- 创业公司 MVP 开发
- 隐私敏感的本地部署

**需要权衡的地方**：
- 模型能力不如付费的前沿模型
- 免费层限制意味着每天晚些时候可用性会下降
- 部分服务商的 ToS 需要仔细审查

总的来说，如果你需要在零成本的情况下探索 LLM 开发，FreeLLMAPI 是一个值得尝试的优秀工具。
