# AI Token 统一网关与治理 · 实战手册

> 本手册目标:让你理解"为什么企业要管 AI Token",掌握用 **LiteLLM** 搭建统一网关、治理 Key/配额/成本、接入可观测性,并能在生产环境落地。
> 适用:AI 平台工程师、后端工程师、想把多团队/多客户 AI 调用收口治理的团队负责人。
> 前置:会用 Docker / docker-compose,会基本的 REST API 调用。
> 说明:本文基于 LiteLLM 核心稳定功能编写,版本更新后个别字段以 [官方文档](https://docs.litellm.ai) 为准。

---

## 目录

- [一、为什么需要 Token 网关治理(概念输出)](#一为什么需要-token-网关治理概念输出)
- [二、核心概念体系](#二核心概念体系)
- [三、整体架构与完整链路](#三整体架构与完整链路)
- [四、工具选型与生态全景](#四工具选型与生态全景)
- [五、动手部署 LiteLLM 网关(核心)](#五动手部署-litellm-网关核心)
- [六、Key 治理(虚拟 Key + 配额 + 限流)](#六key-治理虚拟-key--配额--限流)
- [七、成本治理(计费 + 预算 + 告警)](#七成本治理计费--预算--告警)
- [八、高可用与智能路由(负载均衡 + 故障转移)](#八高可用与智能路由负载均衡--故障转移)
- [九、可观测性(日志 + 监控)](#九可观测性日志--监控)
- [十、安全治理(密钥 + PII + 内容审核)](#十安全治理密钥--pii--内容审核)
- [十一、实际落地场景](#十一实际落地场景)
- [十二、运维、告警与排错](#十二运维告警与排错)
- [附录 A:术语速查表](#附录-a术语速查表)
- [附录 B:学习路径](#附录-b学习路径)

---

## 一、为什么需要 Token 网关治理(概念输出)

### 先理解:什么是 Token

**Token 是大模型处理文本的最小计量单位**,也是计费的依据。

```
英文:约 1 token ≈ 4 个字符 ≈ 0.75 个单词
  "Hello world"        → 约 2 tokens
中文:约 1 token ≈ 1~2 个汉字(取决于分词器)
  "你好世界"            → 约 3~4 tokens
```

每次调用模型,**输入和输出分别计费**:
- **Input Tokens**(Prompt):你发给模型的,便宜
- **Output Tokens**(Completion):模型生成的,通常贵 3~5 倍
- 部分模型还有 **Cached Input**(缓存命中,更便宜)

### 痛点:为什么不能让每个应用直接调模型 API?

直接调用会带来一堆问题(也就是"治理"要解决的):

| 痛点 | 说明 | 后果 |
|------|------|------|
| **Key 散落** | 每个应用、每个开发者手里都有厂商真实 Key | 泄露风险高,难回收 |
| **成本失控** | 谁用了多少、花了多少钱,没人知道 | 月底账单爆炸 |
| **无法分摊** | A 部门和 B 部门共用一个 Key | 算不清谁该出钱 |
| **无兜底** | OpenAI 挂了,整个产品挂了 | 可用性差 |
| **切换困难** | 想从 GPT 换 Claude,要改所有应用代码 | 改造成本高 |
| **无限流** | 一个 bug 死循环调用,烧光余额 | 安全事故 |
| **无审计** | 不知道谁在什么时间问了什么 | 合规风险 |

### Token 网关治理 = 把上面问题集中解决

> **一句话**:在所有应用和所有 AI 模型之间,加一层"网关",由它统一负责 **认证、路由、计费、限流、容灾、审计**。应用只认网关这一家,模型在后面随意换。

这和你学过的**网络工程里的"网关/负载均衡器"**是同一个思想——只是流量单位从"数据包/带宽"变成了"Token/请求"。

---

## 二、核心概念体系

| 概念 | 含义 | 类比 |
|------|------|------|
| **Token** | 模型计量单位 | 流量的"字节" |
| **TPM** | Tokens Per Minute,每分钟 token 数 | 带宽上限 |
| **RPM** | Requests Per Minute,每分钟请求数 | QPS 限流 |
| **虚拟 Key (Virtual Key)** | 网关签发给应用/用户的"凭证",非厂商真实 Key | 企业内部门禁卡 |
| **Master Key** | 网关管理员超级 Key,用来管理一切 | 超级管理员 |
| **预算 (Budget)** | 某个 Key/团队/用户在一段时间内的花费上限 | 流量配额 |
| **配额 (Quota)** | 允许使用的量(钱 or token or 次数) | 月套餐额度 |
| **限流 (Rate Limit)** | 限制单位时间的请求/token | 带宽限速 |
| **路由 (Routing)** | 决定请求发往哪个模型实例 | 负载均衡 |
| **故障转移 (Fallback)** | 主模型失败自动切备模型 | 主备切换 |
| **负载均衡 (Load Balancing)** | 同名模型多实例分流 | 负载均衡器 |
| **缓存 (Cache)** | 相同请求复用结果,省钱省时 | CDN 缓存 |
| **熔断 (Circuit Breaker)** | 某模型连续失败时暂停使用 | 断路器 |

---

## 三、整体架构与完整链路

### 架构图

```
                         ┌─────────────────────────────────────────────┐
                         │              应用层 / 客户端                  │
                         │   (你的业务代码、Cursor、内部 Agent、对外 SDK) │
                         └───────────────────────┬─────────────────────┘
                                                 │ 用虚拟 Key 调用(OpenAI 格式)
                                                 ▼
   ┌──────────────┐   认证/限流/配额    ┌─────────────────────────┐
   │  Vault/       │◄──────────────────►│      AI Token 网关       │
   │  密钥管理      │   读取真实Key       │      (LiteLLM Proxy)     │
   └──────────────┘                    │  ┌───────────────────┐  │
                                       │  │ 路由/负载均衡/容灾 │  │
   ┌──────────────┐   存用量/花费       │  ├───────────────────┤  │
   │ PostgreSQL   │◄──────────────────►│  │ 计费/配额/限流     │  │
   │  (持久化)     │                    │  ├───────────────────┤  │
   └──────────────┘                    │  │ 缓存(Redis)        │  │
                                       │  ├───────────────────┤  │
   ┌──────────────┐   缓存命中          │  │ 日志/回调/脱敏     │  │
   │    Redis     │◄──────────────────►│  └───────────────────┘  │
   └──────────────┘                    └────────────┬────────────┘
                                                   │ 用真实 Key 调用
                    ┌──────────────┬───────────────┼───────────────┬──────────────┐
                    ▼              ▼               ▼               ▼              ▼
              ┌─────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐   ┌─────────┐
              │ OpenAI  │   │Anthropic │   │  Gemini    │   │ Azure    │   │本地 vLLM│
              │ / GPT   │   │ / Claude │   │            │   │ OpenAI   │   │ /Ollama │
              └─────────┘   └──────────┘   └────────────┘   └──────────┘   └─────────┘

   旁路观测:日志/Trace → Langfuse/Helicone  ;  指标 → Prometheus → Grafana
```

### 一个请求的完整链路

```
1. 应用拿"虚拟 Key"发起 OpenAI 格式请求 → POST http://网关/chat/completions
2. 网关校验 Key:是否存在?是否过期?权限对吗?
3. 网关检查配额:本月预算用完没?TPM/RPM 超没超?
4. 网关路由:选哪个模型实例?要不要查缓存?
5. 命中缓存 → 直接返回(省时省钱);未命中 → 用"真实 Key"调用上游模型
6. 上游失败 → 触发 Fallback,自动切备用模型
7. 拿到响应 → 计算 input/output token 和花费 → 写入 PostgreSQL
8. 记录日志/Trace → 推送给 Langfuse/Prometheus
9. 返回结果给应用
```

---

## 四、工具选型与生态全景

### 网关层(核心,选一个)

| 工具 | 类型 | 特点 | 适合 |
|------|------|------|------|
| **LiteLLM** ⭐ | 开源(Python) | 100+模型、虚拟Key、计费、负载均衡、UI 完善、可自建 | **自建首选**,本手册主角 |
| **Portkey** | 商业+开源 | 治理强、面板好看、有云服务 | 想要现成面板、愿付费 |
| **OpenRouter** | 托管服务 | 0运维、按量计费聚合多家 | 不想自建,小团队 |
| **Cloudflare AI Gateway** | 托管 | 边缘缓存、限流,CF 生态 | 已用 Cloudflare |
| **Kong AI Gateway** | 开源 | 基于 Kong 网关,适合大型 API 平台 | 已用 Kong、超大规模 |
| 自建(Nginx+脚本) | 自研 | 完全可控 | 不推荐,重复造轮子 |

> **结论**:学习治理、自建可控、成本敏感 → **LiteLLM**。下面全程用它。

### 生态工具全景

| 环节 | 工具 | 作用 |
|------|------|------|
| **密钥管理** | HashiCorp Vault、AWS Secrets Manager、阿里云 KMS | 安全存储厂商真实 Key,不硬编码 |
| **可观测-Trace/日志** | Langfuse、Helicone、LangSmith | 记录每次问答、token、延迟、成本,可分析 |
| **可观测-指标** | Prometheus + Grafana | TPM/RPM/错误率/延迟仪表盘 |
| **数据库** | PostgreSQL | 存虚拟Key、用量、成本、团队 |
| **缓存** | Redis | 语义/精确缓存,降本提速 |
| **本地模型** | vLLM、Ollama、TGI | 私有化部署开源模型,省钱/合规 |
| **内容安全** | Llama Guard、Guardrails AI、NVIDIA NeMo Guardrails | PII 脱敏、内容审核、越狱防护 |
| **编排部署** | Docker Compose(单机)、Kubernetes(集群) | 容器化部署 |
| **反代/接入** | Nginx、Traefik | TLS 终止、对外暴露、负载均衡(就是你网络工程的本行) |

---

## 五、动手部署 LiteLLM 网关(核心)

### 目录结构

```
ai-gateway/
├── docker-compose.yml     # 编排:网关 + 数据库 + 缓存
├── config.yaml            # 网关核心配置:模型、路由、限流
└── .env                   # 真实 API Key(不入库不提交)
```

### 1. 准备目录

```bash
mkdir -p ai-gateway && cd ai-gateway
```

### 2. `.env` —— 存放真实密钥(别提交到 Git!)

```env
# 厂商真实 Key
OPENAI_API_KEY=sk-真实key
ANTHROPIC_API_KEY=sk-ant-真实key
AZURE_API_KEY=azure真实key

# 网关自身的超级凭证(自己定,要够长够随机)
LITELLM_MASTER_KEY=sk-master-请改成40位随机字符串
LITELLM_SALT_KEY=请改成随机字符串-用于加密

# 数据库
DATABASE_URL=postgresql://llmproxy:dbpassword9090@db:5432/litellm
POSTGRES_USER=llmproxy
POSTGRES_PASSWORD=dbpassword9090
POSTGRES_DB=litellm
```

### 3. `config.yaml` —— 网关核心配置

```yaml
# ============ 模型列表 ============
model_list:
  # GPT-4o:接 OpenAI 官方
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  # Claude:接 Anthropic
  - model_name: claude
    litellm_params:
      model: anthropic/claude-sonnet-4-6
      api_key: os.environ/ANTHROPIC_API_KEY

  # 同名模型多实例 = 负载均衡(再配一个 Azure 的 gpt-4o)
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o-deployment
      api_base: https://你的实例.openai.azure.com
      api_key: os.environ/AZURE_API_KEY

  # 本地模型:省钱/合规场景
  - model_name: local-llama
    litellm_params:
      model: ollama/llama3
      api_base: http://host.docker.internal:11434

# ============ 路由策略 + 故障转移 ============
router_settings:
  routing_strategy: usage-based-routing   # 按用量/剩余配额分流
  fallbacks:
    - claude: [gpt-4o]                    # claude 失败 → 自动切 gpt-4o
    - gpt-4o: [local-llama]               # gpt-4o 全挂 → 兜底本地模型
  num_retries: 2
  timeout: 30

# ============ 缓存:省钱提速 ============
litellm_settings:
  cache: true
  cache_params:
    type: redis
    host: redis
    port: 6379
  request_timeout: 30
  drop_params: true        # 自动丢弃上游不支持的参数,避免报错

# ============ 全局/DB 配置 ============
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL
  # 全局月预算上限(超出自动拦截)
  proxy_budget_rate_limit:
    - max_budget: 1000        # 全网关每月最多花 1000(货币单位随模型库)
      budget_duration: 30days
```

### 4. `docker-compose.yml` —— 一键拉起整套

```yaml
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    volumes:
      - ./config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 5. 启动

```bash
docker compose up -d          # 后台启动整套
docker compose logs -f litellm   # 看日志,等 "Application startup complete"
docker compose ps             # 确认三个容器都 healthy/up
```

### 6. 验证网关可用

```bash
# 用 Master Key 直接调一次(OpenAI 格式!)
curl http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude",
    "messages": [{"role":"user","content":"说一句话证明网关通了"}]
  }'
```

打开浏览器访问 **http://localhost:4000/ui**,用 Master Key 登录 → 看到 Admin 控制台,部署成功 🎉

---

## 六、Key 治理(虚拟 Key + 配额 + 限流)

**核心思想**:应用永远不接触厂商真实 Key,只用你签发的"虚拟 Key"。一个虚拟 Key = 一组权限 + 配额 + 限流。

### 1. 创建一个虚拟 Key(给某个团队/应用)

```bash
curl -X POST http://localhost:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key_alias": "marketing-bot",
    "team_id": "marketing",
    "models": ["gpt-4o", "claude"],
    "max_budget": 50,
    "budget_duration": "1mo",
    "rpm_limit": 100,
    "tpm_limit": 200000,
    "metadata": {"owner": "alice", "project": "营销文案助手"}
  }'
```

返回里会有一段 `"key": "sk-xxxx..."` —— **这就是发给应用的虚拟 Key**。

| 字段 | 含义 |
|------|------|
| `key_alias` | 别名,方便管理界面认 |
| `team_id` | 归属团队(用于成本分摊) |
| `models` | 该 Key 只能调这些模型(权限最小化) |
| `max_budget` | 这个 Key 每周期最多花 50 |
| `budget_duration` | `1mo`=每月重置 / `1d`=每天 / `30days` |
| `rpm_limit` / `tpm_limit` | 每分钟请求数 / token 数上限 |
| `metadata` | 自定义标签,便于审计 |

### 2. 用虚拟 Key 调用(应用侧,格式还是 OpenAI)

```bash
curl http://localhost:4000/chat/completions \
  -H "Authorization: Bearer sk-虚拟key" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4o", "messages":[{"role":"user","content":"hi"}]}'
```

### 3. Python 接入(零成本改造,直接用 OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000",   # 只改这一行:指向网关
    api_key="sk-虚拟key"                # 用虚拟 Key
)

resp = client.chat.completions.create(
    model="claude",                     # 网关里的模型别名
    messages=[{"role": "user", "content": "你好"}]
)
print(resp.choices[0].message.content)
```

### 4. Key 管理常用操作

```bash
# 查看所有 Key / 用量
curl http://localhost:4000/key/list -H "Authorization: Bearer $LITELLM_MASTER_KEY"

# 查某个 Key 的实时花费
curl http://localhost:4000/key/info?key=sk-xxx \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"

# 吊销/删除一个 Key(疑似泄露时立即回收!)
curl -X POST http://localhost:4000/key/delete \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"keys":["sk-xxx"]}'
```

> 这些操作在 **UI 控制台** 里都能点点点完成,不用记命令。

---

## 七、成本治理(计费 + 预算 + 告警)

### 1. 计费原理(无需手动配价格)

LiteLLM **内置模型价格库**(`model_prices_and_context_window.json`),覆盖上千个模型。每次调用结束,自动按 input/output token × 单价计算花费,写入 PostgreSQL。

所以你**什么都不用配**,UI 里就能看到:
- 每个 Key / 团队 / 用户的累计花费
- 按模型、按时间维度的成本分布
- Top 消费排行

### 2. 预算层级(由粗到细,层层兜底)

```
全局预算(网关级) ──┐
                   ├── 团队预算(team) ──┐
                   │                     ├── 用户/Key 预算 ── 触发即拦截
                   └─────────────────────┘
```

在 `config.yaml` 里配,或在 UI 里给每个 team/key 设:

```yaml
general_settings:
  proxy_budget_rate_limit:
    - max_budget: 1000        # 网关全局:每月上限 1000
      budget_duration: 30days
```

创建 team / key 时再单独设更小的额度(见第六节)。

### 3. 预算超限会怎样?

- 当某 Key 累计花费 ≥ `max_budget` → 该 Key 后续请求**被网关直接拒绝**(返回 403/429),不影响其他 Key。
- 这就是"防失控"的核心:**即使应用代码有 bug 死循环,烧到上限就自动停**。

### 4. 预算告警(主动通知,别等花超)

在 `config.yaml` 配 Slack/邮件/钉钉 webhook,接近预算时推送:

```yaml
litellm_settings:
  # 预算用到 80% 时告警
  budget_notification_alerts:
    - alert_type: budget_thresholds
      threshold: 0.8            # 80% 告警
      # 也支持 webhook、email、slack 等
```

---

## 八、高可用与智能路由(负载均衡 + 故障转移)

### 1. 负载均衡(同名模型多实例)

在 `config.yaml` 里给同一个 `model_name` 配多个 `litellm_params`,网关自动按 `routing_strategy` 分流:

```yaml
router_settings:
  routing_strategy: usage-based-routing   # 优先路由到剩余配额多的
  # 可选:latency-based-routing(最低延迟)、simple-shuffle(随机)
```

适用:你有多个 Azure 部署 / 多个账号,想凑够更大配额(TPM)。

### 2. 故障转移(Fallback)

```yaml
router_settings:
  fallbacks:
    - claude: [gpt-4o, local-llama]   # claude 挂 → gpt-4o → 本地模型
  num_retries: 2                        # 失败重试 2 次
  timeout: 30                           # 单次超时 30s
```

**效果**:OpenAI 大规模宕机时,你的产品自动切到 Claude,用户无感知。

### 3. 熔断(连续失败自动拉黑)

某模型连续报错达阈值,网关临时停用该实例,避免雪崩。在 UI / 配置里可调阈值。

---

## 九、可观测性(日志 + 监控)

### 1. LiteLLM 自带 UI

http://localhost:4000/ui 提供开箱即用面板:请求量、token 用量、成本、错误率、延迟、模型分布、Top 用户。**中小团队直接够用。**

### 2. 接入 Langfuse(看每次具体问答,Trace 级)

Langfuse 是开源的 LLM 可观测平台,适合"回看某次问答的完整 prompt/response/成本"。

```yaml
# config.yaml
litellm_settings:
  success_callback: ["langfuse"]
  failure_callback: ["langfuse"]

environment_variables:
  LANGFUSE_PUBLIC_KEY: os.environ/LANGFUSE_PUBLIC_KEY
  LANGFUSE_SECRET_KEY: os.environ/LANGFUSE_SECRET_KEY
  LANGFUSE_HOST: os.environ/LANGFUSE_HOST   # 自建 Langfuse 地址
```

### 3. 接入 Prometheus + Grafana(指标告警)

LiteLLM 默认暴露 `/metrics` 端点(Prometheus 格式)。在 Grafana 里配仪表盘监控:
- 每分钟请求数(RPM)、错误率、P95 延迟
- 各模型成本趋势
- 设阈值告警(错误率 > 5% 触发)

```yaml
# docker-compose.yml 追加(简化)
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"]
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
```

---

## 十、安全治理(密钥 + PII + 内容审核)

### 1. 密钥安全:真实 Key 绝不硬编码

- 厂商真实 Key 存 **Vault / 云 KMS**,网关启动时拉取(或至少放 `.env` 且**绝不提交 Git**)。
- 应用侧只持有"虚拟 Key",泄露了大不了吊销重发,**真实 Key 永远不外泄**。
- `LITELLM_MASTER_KEY` 是管理员权限,只有极少数人持有。

### 2. 内容安全:PII 脱敏 + 输入输出审核

通过回调(callback)在请求前/后做处理,例如:
- **输入脱敏**:把身份证号、手机号打码后再发给模型
- **输出审核**:模型回复含敏感内容则拦截
- **越狱防护**:拦截 prompt injection

可用 Guardrails AI / Llama Guard 集成,或自写 Presidio 脱敏回调。

### 3. 网络安全(你的本行)

- 网关只在内网/通过 **VPN + Nginx(TLS)** 对外
- 配合你学的**网络工程**:用 ACL/防火墙限制谁能访问 4000 端口
- 对外用域名 + HTTPS,前面套 Nginx 做反向代理和限流

---

## 十一、实际落地场景

### 场景 1:创业公司统一对外 AI 能力

```
你的 SaaS 产品有"AI 写作""AI 客服"两个功能
→ 给每个功能发一个独立虚拟 Key,各设预算
→ 哪个功能烧钱一目了然,超预算自动停
→ 模型想换(降本时 GPT→本地 Llama),只改 config.yaml,代码不动
```

### 场景 2:内部多团队成本分摊

```
市场部、研发部、客服部都用 AI
→ 每个部门建一个 team,发 team 级 Key
→ 月底按 team 出账单,部门自己控成本
→ 给研发部放行本地模型(便宜),客服部只能用稳定云模型
```

### 场景 3:高可用 + 容灾(生产级)

```
主力:Azure OpenAI(企业合规)
备用:OpenAI 官方 + Anthropic
兜底:本地 vLLM(绝对可用,不依赖外网)
→ fallback 链:Azure → OpenAI → Claude → 本地
→ 任一厂商宕机,业务不中断
```

### 场景 4:对外卖 API(按 token 计费给客户)

```
你是 AI 中台,给下游客户按量收费
→ 每个客户发独立 Key + 配额
→ 网关自动统计每客户 token 和成本
→ 客户超额自动停服,你拿网关数据出账单
```

---

## 十二、运维、告警与排错

### 常用运维命令

```bash
docker compose restart litellm   # 改完 config.yaml 重启生效
docker compose logs -f litellm   # 实时日志
docker compose down              # 停止全部
docker compose pull && docker compose up -d   # 升级到最新镜像
```

### 排错检查清单

| 现象 | 排查 |
|------|------|
| 应用 401 | 虚拟 Key 错/过期/被吊销 → 重新生成 |
| 应用 403 / 配额超限 | 该 Key 预算用完 → 提额或等周期重置 |
| 调用很慢 | 看 fallback 是否频繁触发;查上游延迟 |
| 模型 429 | 上游限流(TPM/RPM)→ 加多实例负载均衡 |
| 成本异常飙升 | UI 看 Top Key/用户,定位是否 bug 死循环 |
| 配置不生效 | 改 config.yaml 后必须 `restart litellm` |

### 生产建议清单

- [ ] PostgreSQL 定期备份(虚拟 Key、用量都在里面)
- [ ] Master Key 足够复杂,专人保管,定期轮换
- [ ] 真实 Key 迁移到 Vault
- [ ] 配好预算告警(Slack/钉钉)
- [ ] 网关前面套 Nginx + HTTPS + 限流
- [ ] 上 Prometheus/Grafana 监控错误率和延迟
- [ ] 关键业务配好 fallback 链

---

## 附录 A:术语速查表

| 术语 | 含义 |
|------|------|
| Token | 模型计量/计费单位,≈4 字符 |
| Input/Output Token | 输入/输出 token,分别计费 |
| TPM / RPM | 每分钟 token 数 / 请求数 |
| Master Key | 网关超级管理 Key |
| Virtual Key | 网关签发给应用的凭证 |
| Budget / Quota | 预算 / 配额 |
| Fallback | 故障转移,主挂切备 |
| Load Balancing | 同模型多实例分流 |
| Routing | 请求路由策略 |
| Cache | 缓存命中复用结果 |
| Circuit Breaker | 熔断,连续失败暂停 |
| PII | 个人身份信息,需脱敏 |
| Trace | 单次请求的完整链路记录 |

## 附录 B:学习路径

| 阶段 | 目标 | 实操 |
|------|------|------|
| **第1步·跑通** | 本地起网关,调通一次 | 本文第五节 |
| **第2步·Key治理** | 会发/管/限流虚拟 Key | 第六节 |
| **第3步·成本治理** | 看懂花费、配预算、设告警 | 第七节 |
| **第4步·高可用** | 配负载均衡 + fallback | 第八节 |
| **第5步·可观测** | 接 Langfuse + Grafana | 第九节 |
| **第6步·安全** | Vault 存 Key + PII 脱敏 | 第十节 |
| **第7步·生产化** | Nginx+HTTPS+备份+监控 | 第十二节 |

---

> 📌 **学习建议**:先在本地用 Docker 把网关跑起来(第五节),用 `curl` 走一遍第六、七节,再去碰可观测和安全。**动手 > 看文档**。
> 📌 **和你网络工程的结合**:网关本身就是一台"网络服务",部署、Nginx 反代、TLS、防火墙、负载均衡——这些恰恰是你正在学的网络工程技能,两者高度互补。
