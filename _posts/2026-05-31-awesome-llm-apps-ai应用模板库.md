---
layout: post
title: "100多个能直接运行的 AI 应用模板，拿来改改就能上线：Awesome LLM Apps"
date: 2026-05-31
tags: [AI, 开发, 开源]
header-style: 'text'
subtitle: "100+ AI Agent & RAG apps you can actually run — clone, customize, ship"
---

> 原网址：https://github.com/Shubhamsaboo/awesome-llm-apps

---

## 📌 一句话总结

100多个能直接运行的 AI 应用模板，拿来改改就能上线

---

## 🎯 它是做什么的？

这是一个 GitHub 仓库，收藏了 **100多个现成的 AI 应用代码模板**，涵盖 AI 智能体、RAG、语音交互、多智能体协作等场景。

每个模板都是：
- ✅ **能直接跑** — 三行命令启动，不需要从零搭建
- ✅ **能改能卖** — Apache-2.0 协议，可以商用、二次开发
- ✅ **多模型兼容** — 一键切换 Claude、Gemini、GPT、Llama 等
- ✅ **有教程** — 每个模板在 Unwind AI 上有免费教学

---

## 🔑 核心概念解读

| 专业术语 | 通俗解释 |
|---------|---------|
| **AI Agent** | "AI 智能体" — 不光会回答问题，还会用工具、上网、查资料帮你干活的 AI |
| **RAG** | "检索增强生成" — 让 AI 能查阅你提供的文档/知识库，再基于资料回答问题 |
| **Multi-agent Teams** | "多智能体协作" — 像团队一样，让多个 AI 分别干不同的活，互相配合 |
| **MCP** | "模型上下文协议" — 让 AI 能连外部工具和数据的统一接口标准 |
| **Fine-tuning** | "微调" — 用自己的数据再训练一个专属模型，让 AI 更懂你的业务 |

---

## 💡 切实可落地的例子（全覆盖版）

### 🌱 场景 1：新手入门 — 30 秒启动第一个 AI 智能体

**痛点**：想体验 AI Agent，但不想配置复杂环境

**解决方案**：使用 Starter AI Agents 中的旅行顾问

**具体步骤**：
```bash
# 克隆仓库
git clone https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps/starter_ai_agents/ai_travel_agent

# 安装依赖
pip install -r requirements.txt

# 设置 API 密钥（选择一个）
export OPENAI_API_KEY="your-key"  # 或 GEMINI_API_KEY、ANTHROPIC_API_KEY

# 启动应用
streamlit run travel_agent.py
```

**效果**：打开浏览器（通常是 `http://localhost:8501`），看到一个聊天界面，告诉它你想去哪里、预算多少，它会给你完整的旅行建议。

---

### 🚀 场景 2：企业级应用 — 构建尽职调查 AI 系统

**痛点**：投资公司需要快速分析大量财报和公司信息，人工分析太慢

**解决方案**：使用 AI VC Due Diligence Agent Team 模板

**具体步骤**：
```bash
# 进入项目目录
cd awesome-llm-apps/advanced_ai_agents/ai_vc_due_diligence_agent_team

# 安装依赖
pip install -r requirements.txt

# 配置 API 密钥
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥

# 替换知识库（可选）
# 将你自己的财报 PDF 放入 data/knowledge_base/ 目录

# 启动多智能体系统
streamlit run app.py
```

**效果**：上传目标公司的财报，多个 AI 智能体会分别负责：
- 财务指标分析
- 风险识别
- 竞争对手对比
- 最终生成完整的尽职调查报告

---

### 🎮 场景 3：游戏 AI — 让 AI 和你下象棋

**痛点**：想看 AI 如何玩游戏、做决策

**解决方案**：使用 AI Chess Agent 模板

**具体步骤**：
```bash
cd awesome-llm-apps/autonomous_game_playing_agents/ai_chess_agent
pip install -r requirements.txt
python chess_agent.py
```

**效果**：AI 会和你下棋，每一步都会解释它的思考过程（比如"我要控制中心"、"我要保护我的王"），让你看到 AI 的推理能力。

---

### 🤝 场景 4：多智能体协作 — 构建一个 AI 律师团队

**痛点**：法律文书审查需要不同角度的分析，单一 AI 不够全面

**解决方案**：使用 AI Legal Agent Team 模板

**具体步骤**：
```bash
cd awesome-llm-apps/multi_agent_teams/ai_legal_agent_team

# 安装依赖
pip install -r requirements.txt

# 配置 API 密钥
export ANTHROPIC_API_KEY="your-claude-key"

# 启动多智能体系统
streamlit run legal_team.py

# 上传合同或法律文书
```

**效果**：多个 AI 智能体分别扮演：
- 合规审查专家
- 风险评估专家
- 条款谈判专家
- 最终汇总综合意见

---

### 🗣️ 场景 5：语音 AI — 构建语音客服系统

**痛点**：客户想通过电话咨询，不想打字

**解决方案**：使用 Customer Support Voice Agent 模板

**具体步骤**：
```bash
cd awesome-llm-apps/voice_ai_agents/customer_support_voice_agent

# 安装依赖（需要音频处理库）
pip install -r requirements.txt

# 配置语音 API（如 Deepgram、ElevenLabs）
cp .env.example .env
# 编辑 .env，填入语音 API 密钥

# 启动语音服务
python voice_agent.py
```

**效果**：
- 客户打电话，AI 自动接听
- AI 将语音转文字，用 LLM 处理，再转回语音
- 支持中断、多轮对话

---

### ♾️ 场景 6：MCP 集成 — 让 AI 操作你的 GitHub

**痛点**：想让 AI 帮你管理 GitHub Issues，但不能直接访问

**解决方案**：使用 GitHub MCP Agent 模板

**具体步骤**：
```bash
cd awesome-llm-apps/mcp_ai_agents/github_mcp_agent

# 安装依赖
pip install -r requirements.txt

# 配置 GitHub Token
export GITHUB_TOKEN="your-github-personal-access-token"
export ANTHROPIC_API_KEY="your-claude-key"

# 启动 MCP 代理
python github_agent.py
```

**效果**：
- AI 可以读取你的仓库 Issues
- 你说"帮我列出所有高优先级的 Bug"，AI 会调用 GitHub API 获取并分类
- 可以让 AI 自动创建 Issue、添加标签

---

### 📀 场景 7：RAG 系统 — 构建企业知识库问答

**痛点**：公司有大量文档，员工找资料太慢

**解决方案**：使用 Basic RAG Chain 模板

**具体步骤**：
```bash
cd awesome-llm-apps/rag_tutorials/basic_rag_chain

# 安装依赖
pip install -r requirements.txt

# 准备你的文档
mkdir data
# 将你的 PDF/Word/文本文件放入 data/ 目录

# 构建向量索引
python build_index.py --documents ./data

# 启动问答服务
streamlit run rag_qa.py
```

**效果**：
- 上传文档后，系统自动建立向量索引
- 员工提问"我们的退款政策是什么？"
- AI 在文档中检索相关段落，基于实际内容回答（不是瞎编）

---

### 🧩 场景 8：Agent Skills — 让 AI 拥有专业能力

**痛点**：想让 AI 不仅能聊天，还能做专业的事（写代码、分析数据）

**解决方案**：直接使用现成的 Agent Skills

**具体步骤**：
```bash
# 示例：让 AI 成为代码审查专家
cd awesome-llm-apps/awesome_agent_skills

# 复制 code_reviewer 技能文件到你的项目
cp skills/code_reviewer.yaml /your-agent-project/skills/

# 在你的 Agent 配置中加载技能
# 参考 advanced_ai_agents 中的示例
```

**效果**：
- AI 不仅懂通用知识，还具备专业技能
- 19 个现成技能：代码审查、数据分析、学术研究、项目管理等
- 像搭积木一样组合技能

---

### 💾 场景 9：持久化记忆 — 让 AI 记住客户

**痛点**：AI 对话完了就忘，下次从头开始

**解决方案**：使用 AI Travel Agent with Memory 模板

**具体步骤**：
```bash
cd awesome-llm-apps/llm_apps_with_memory/ai_travel_agent_with_memory

# 安装依赖
pip install -r requirements.txt

# 配置数据库（支持 SQLite、PostgreSQL）
export DATABASE_URL="sqlite:///memory.db"

# 启动带记忆的 AI
streamlit run travel_agent_memory.py
```

**效果**：
- 客户第一次说"我喜欢海滩度假"
- 三个月后再来，AI 还记得
- 自动推荐海滩相关目的地，不用重复说

---

### 💬 场景 10：Chat with X — 和你的数据聊天

**痛点**：PDF 太多，找内容要一个个搜

**解决方案**：使用 Chat with PDF 模板

**具体步骤**：
```bash
cd awesome-llm-apps/chat_with_x_tutorials/chat_with_pdf

# 安装依赖
pip install -r requirements.txt

# 启动服务
streamlit run chat_pdf.py

# 上传你的 PDF，开始提问
```

**效果**：
- 上传 100 份 PDF
- 问"哪份文档提到了 GDPR 合规？"
- AI 告诉你是第 37 页的《隐私政策 v2.0》，并直接引用原文

---

### 🎯 场景 11：成本优化 — 减少 50% API 费用

**痛点**：LLM API 调用太贵，每月账单惊人

**解决方案**：使用 Headroom Context Optimization 工具

**具体步骤**：
```bash
cd awesome-llm-apps/llm_optimization_tools/headroom_context_optimization

# 安装依赖
pip install -r requirements.txt

# 分析你的 LLM 调用日志
python analyze.py --log-file your-api-logs.json

# 生成优化建议
python optimize.py --input your-prompts.txt
```

**效果**：
- 自动识别冗余提示词
- 压缩上下文，保留关键信息
- 报告显示能节省 50-90% 的 Token 消耗

---

### 🔧 场景 12：模型微调 — 训练你的专属模型

**痛点**：通用模型不懂你的行业术语

**解决方案**：使用 Llama 3.2 Fine-tuning 教程

**具体步骤**：
```bash
cd awesome-llm-apps/llm_fine_tuning_tutorials/llama_3_2_fine_tuning

# 准备训练数据
# 格式：JSONL，每行一个样本
echo '{"prompt": "什么是期权？", "response": "期权是一种金融衍生品..."}' > training_data.jsonl

# 启动微调（需要 GPU）
python finetune.py \
  --model-name meta-llama/Llama-3.2-8B \
  --training-data training_data.jsonl \
  --output-dir ./my-finetuned-model
```

**效果**：
- 训练后的模型懂你的行业黑话
- 不需要在提示词里反复解释背景
- 推理速度更快（可以量化到更小尺寸）

---

### 🧑‍🏫 场景 13：学习框架 — 掌握 Google ADK

**痛点**：官方文档太抽象，想看实际代码

**解决方案**：学习 Google ADK Crash Course

**具体步骤**：
```bash
cd awesome-llm-apps/ai_agent_framework_crash_course/google_adk_crash_course

# 按顺序学习每个示例
cd 01_starter_agent
python agent.py  # 理解基础结构

cd ../02_structured_outputs
python agent.py  # 学习如何让 AI 输出结构化数据

cd ../03_tools
python agent.py  # 学习如何给 AI 加工具

cd ../04_memory
python agent.py  # 学习如何让 AI 记忆

cd ../05_multi_agent
python agent.py  # 学习多智能体协作
```

**效果**：
- 每个示例都可以直接运行
- 看代码注释理解设计模式
- 比看文档快 10 倍上手

---

### 🎨 场景 14：内容创作 — AI 把博客变成播客

**痛点**：写了文章，想做成音频版，但录音太累

**解决方案**：使用 AI Blog to Podcast Agent

**具体步骤**：
```bash
cd awesome-llm-apps/starter_ai_agents/ai_blog_to_podcast_agent

# 安装依赖
pip install -r requirements.txt

# 配置 TTS API（如 ElevenLabs）
export ELEVENLABS_API_KEY="your-key"

# 给出博客 URL
python blog_to_podcast.py --url "https://your-blog.com/article"

# 生成音频文件
# 输出：podcast_episode.mp3
```

**效果**：
- AI 读取博客内容
- 转写成对话式播客稿
- 用语音合成生成音频
- 直接发布到播客平台

---

### 🩻 场景 15：医疗影像 — AI 分析 X 光片

**痛点**：想了解医疗影像 AI 的工作原理

**解决方案**：使用 AI Medical Imaging Agent（教学用途）

**具体步骤**：
```bash
cd awesome-llm-apps/starter_ai_agents/ai_medical_imaging_agent

# 安装依赖
pip install -r requirements.txt

# 上传医疗影像（需脱敏）
streamlit run medical_agent.py

# AI 会分析影像并给出初步判断
```

**效果**：
- 上传 X 光片或 MRI
- AI 识别异常区域
- 给出初步诊断建议（需专业医生复核）

---

### 📊 场景 16：数据分析 — 让 AI 帮你分析 Excel

**痛点**：Excel 数据太多，手动分析太慢

**解决方案**：使用 AI Data Analysis Agent

**具体步骤**：
```bash
cd awesome-llm-apps/starter_ai_agents/ai_data_analysis_agent

# 安装依赖
pip install -r requirements.txt

# 启动分析工具
streamlit run data_agent.py

# 上传你的 CSV/Excel
# 问："找出销售额下降最多的月份"
```

**效果**：
- AI 自动读取数据
- 用 Python 做统计分析
- 生成可视化图表
- 用自然语言解释结论

---

### 🎵 场景 17：音乐生成 — AI 创作背景音乐

**痛点**：视频需要背景音乐，版权太麻烦

**解决方案**：使用 AI Music Generator Agent

**具体步骤**：
```bash
cd awesome-llm-apps/starter_ai_agents/ai_music_generator_agent

# 安装依赖
pip install -r requirements.txt

# 配置音乐生成 API（如 MusicLM、Suno）
export MUSIC_API_KEY="your-key"

# 生成音乐
python generate_music.py --prompt "欢快的科技感背景音乐，30秒"

# 输出：background_music.mp3
```

**效果**：
- 描述你想要的音乐风格
- AI 生成原创音乐（无版权问题）
- 直接用于视频内容

---

### 🏠 场景 18：房屋装修 — AI 看图给出设计方案

**痛点**：想装修房子，但不知道怎么改

**解决方案**：使用 AI Home Renovation Agent with Nano Banana Pro

**具体步骤**：
```bash
cd awesome-llm-apps/advanced_ai_agents/ai_home_renovation_agent

# 安装依赖
pip install -r requirements.txt

# 配置 Nano Banana Pro（AI 图像生成 API）
export NANO_BANANA_API_KEY="your-key"

# 上传房间照片
streamlit run renovation_agent.py

# AI 生成装修后的效果图
```

**效果**：
- 上传你的客厅照片
- 告诉 AI"我想改成现代简约风格"
- AI 生成装修后的效果图
- 给出具体的材料清单和预算估算

---

### 📡 场景 19：财报分析 — AI 听电话会议生成报告

**痛点**：上市公司财报电话会议太长，听完要几小时

**解决方案**：使用 Earnings Call Analyst Agent

**具体步骤**：
```bash
cd awesome-llm-apps/advanced_ai_agents/earnings_call_analyst_agent

# 安装依赖
pip install -r requirements.txt

# 配置 API（需要 YouTube 音频下载和转录）
cp .env.example .env
# 编辑 .env，填入 API 密钥

# 给出财报电话会议 YouTube 链接
python analyze.py --youtube-url "https://youtube.com/watch?v=xxx"

# 生成分析师报告
# 输出：earnings_report.pdf
```

**效果**：
- 自动下载财报电话会议音频
- 转写成文字
- AI 提取关键数据点（营收、利润率、指引）
- 对比市场预期，生成专业报告

---

### 🛡️ 场景 20：保险理赔 — AI 处理语音报案

**痛点**：车险报案要人工问一堆问题，效率低

**解决方案**：使用 Insurance Claim Live Agent Team

**具体步骤**：
```bash
cd awesome-llm-apps/voice_ai_agents/insurance_claim_live_agent_team

# 安装依赖
pip install -r requirements.txt

# 配置实时语音 API（如 Gemini Live API）
cp .env.example .env
# 编辑 .env，填入 Gemini API 密钥

# 启动语音报案系统
python claim_agent.py
```

**效果**：
- 客户打电话报案
- AI 引导对话："什么时候出的事？""在哪个位置？"
- 自动生成理赔单
- 实时语音，不用等待

---

## 🎓 学习路径建议

**第一天：入门**
```bash
# 1. 跑通第一个示例
cd starter_ai_agents/ai_travel_agent
pip install -r requirements.txt && streamlit run travel_agent.py

# 2. 理解代码结构
# 打开 travel_agent.py，看懂它是如何调用 API 的
```

**第一周：掌握基础**
```bash
# 每天 1-2 个示例，按顺序学习：
# Day 1-2: Starter AI Agents（挑 3 个感兴趣的）
# Day 3-4: RAG Tutorials（先看 Basic RAG Chain）
# Day 5-6: Agent Skills（理解如何给 AI 加技能）
# Day 7: Memory Tutorials（让 AI 记住对话）
```

**第二周：进阶**
```bash
# Day 1-3: Advanced AI Agents（挑 1-2 个深度研究）
# Day 4-5: Multi-agent Teams（理解多智能体协作）
# Day 6-7: Framework Crash Course（系统学习 Google ADK 或 OpenAI SDK）
```

**第三周：实战**
```bash
# 选一个真实业务场景，组合使用模板
# 例如：客服系统 = Voice Agent + RAG + Memory + Skills
```

---

## 👥 适合谁用？

✅ 想快速上线 AI 应用的开发者  
✅ 不想从零搭 RAG/Agent 框架的团队  
✅ 想学习 AI Agent 开发的新人  
✅ 需要原型验证的产品经理  
✅ 想降本增效的创业公司  
❌ 只需要简单问答的人（直接用 ChatGPT/Clude 就好）  
❌ 想完全从零造轮子学习原理的人（这个仓库是给你生产力的）

---

## ⚠️ 注意事项

- **免费**：Apache-2.0 协议，可以商用、修改、分发
- **学习曲线**：⭐⭐☆☆☆（需要有基础 Python 能力）
- **主要成本**：API 调用费用（Claude/GPT 等），按使用量付费
- **替代方案**：LangChain / LlamaIndex（更底层，需要更多配置）
- **社区活跃度**：⭐⭐⭐⭐⭐（2.2k+ Stars，持续更新）

---

## 🛠️ 技术栈覆盖

| 类别 | 涵盖技术 |
|-----|---------|
| **LLM 模型** | Claude、GPT、Gemini、Llama、Qwen、xAI、DeepSeek |
| **框架** | LangChain、LlamaIndex、Google ADK、OpenAI SDK、CrewAI |
| **向量数据库** | Chroma、FAISS、Pinecone、Weaviate |
| **工具集成** | MCP、Google Search、GitHub、Notion、Browser |
| **语音** | ElevenLabs、Deepgram、Wispr Flow、Gemini Live |
| **部署** | Streamlit、FastAPI、Docker |
