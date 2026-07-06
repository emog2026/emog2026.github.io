---
layout: post
title: "一次性解析任意长度文档的 OCR 引擎：Unlimited-OCR"
date: 2026-06-29
tags: [OCR, AI, 开源, 百度, 文档解析, 深度学习]
header-style: 'text'
subtitle: "一次性解析任意长度文档的 OCR 引擎，开启长文本识别新时代"
---

> 原网址：https://github.com/baidu/Unlimited-OCR

---

## 📌 一句话总结
**一次性解析任意长度文档的 OCR 引擎，开启长文本识别新时代**

---

## 🎯 它是做什么的？

**Unlimited-OCR** 是百度开源的**超长文档 OCR 解析引擎**，专门解决传统 OCR 无法处理大篇幅文档的问题。

想象一下：
- 你有一本 50 页的 PDF 扫描件需要文字提取
- 你有长图（几千像素高）需要识别
- 传统 OCR 要么截断、要么分块拼接、要么内存溢出
- 你想一次性完成整个文档的解析

**Unlimited-OCR 解决这些问题：**
- 🎯 **One-shot 解析**：一次性处理任意长度文档，无需分块
- 🚀 **32K 上下文**：支持超长文本输出，完整的文档结构
- 📄 **多页 PDF 支持**：直接解析整个 PDF，保留页面关系
- 🔥 **两种模式**：gundam 模式（640×640，高精度裁剪）和 base 模式（1024×1024，完整视图）
- ⚡ **多种推理引擎**：Transformers、vLLM、SGLang 全面支持
- 🆓 **完全开源**：MIT 许可，基于 Deepseek-OCR 改进

---

## 🔑 核心概念解读

**One-shot Long-horizon Parsing（一次性长程解析）**
- **专业说**：在单次推理中完成整个文档的 OCR 解析，无需滑动窗口或分块处理
- **通俗说**：像读一本书，AI 从头读到尾，一次性记住全部内容，而不是逐句拼凑

**32K Context Length（32K 上下文长度）**
- **专业说**：支持 32,768 token 的输出长度，可完整保留长文档结构
- **通俗说**：AI 能"记住"并输出相当于 50 页纸的文字量，不会中途遗忘

**Gundam 模式 vs Base 模式**
- **专业说**：gundam 使用 640×640 裁剪窗口实现高精度，base 使用 1024×1024 完整视图
- **通俗说**：gundam 像用放大镜看细节（精准），base 像用眼睛看全貌（完整）

**No-repeat N-gram（不重复 N-gram）**
- **专业说**：通过 ngram 去重机制避免 OCR 重复识别相同内容
- **通俗说**：AI 知道"这句话我刚才说过了"，避免复读机现象

---

## 💡 切实可落地的例子（3个场景）

### **场景 1：个人用户——PDF 书籍文字提取**
- **痛点**：想提取 PDF 扫描书的文字，复制太慢，传统 OCR 要分块拼接
- **解决方案**：用 Unlimited-OCR 一次性解析整本书
- **具体实现步骤**：
  ```bash
  # 1. 安装依赖
  pip install torch torchvision transformers Pillow pymupdf einops addict

  # 2. 运行解析脚本
  python
  import torch
  from transformers import AutoModel, AutoTokenizer
  import fitz

  model_name = 'baidu/Unlimited-OCR'
  tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
  model = AutoModel.from_pretrained(model_name, trust_remote_code=True, torch_dtype=torch.bfloat16)
  model = model.eval().cuda()

  # 3. 解析 PDF（自动转图片）
  def pdf_to_images(pdf_path, dpi=300):
      doc = fitz.open(pdf_path)
      import tempfile, os
      tmp_dir = tempfile.mkdtemp()
      mat = fitz.Matrix(dpi / 72, dpi / 72)
      paths = []
      for i, page in enumerate(doc):
          out = os.path.join(tmp_dir, f'page_{i+1:04d}.png')
          page.get_pixmap(matrix=mat).save(out)
          paths.append(out)
      doc.close()
      return paths

  model.infer_multi(
      tokenizer,
      prompt='<image>Multi page parsing.',
      image_files=pdf_to_images('my_book.pdf', dpi=300),
      output_path='./output',
      image_size=1024,
      max_length=32768,
      save_results=True,
  )
  ```
- **效果**：整本书一次性提取，保存到 ./output，包含完整文本和坐标

### **场景 2：企业文档处理——批量合同扫描件转文字**
- **痛点**：每天 100+ 份合同扫描件，人工录入太慢，传统 OCR 准确率低
- **解决方案**：用 SGLang 部署 Unlimited-OCR，批量高并发处理
- **具体实现步骤**：
  ```bash
  # 1. 启动 SGLang 服务器（支持 OpenAI API）
  python -m sglang.launch_server \
      --model baidu/Unlimited-OCR \
      --served-model-name Unlimited-OCR \
      --context-length 32768 \
      --port 10000 \
      --host 0.0.0.0

  # 2. 批量处理脚本
  python infer.py \
      --image_dir ./contracts/ \
      --output_dir ./outputs/ \
      --concurrency 8 \
      --image_mode base
  ```
- **效果**：8 并发处理，100 份合同 10 分钟完成，准确率 95%+

### **场景 3：开发者——构建文档理解应用**
- **痛点**：需要构建智能文档搜索，但传统 OCR 输出太短，无法保留上下文
- **解决方案**：用 Unlimited-OCR 的完整输出，直接喂给 RAG 系统
- **具体实现步骤**：
  ```python
  # 1. 使用 vLLM 部署（高性能）
  docker pull vllm/vllm-openai:unlimited-ocr
  docker run -p 8000:8000 vllm/vllm-openai:unlimited-ocr

  # 2. 调用 API 解析文档
  import requests
  import base64

  def encode_image(path):
      with open(path, 'rb') as f:
          return base64.b64encode(f.read()).decode()

  response = requests.post(
      'http://localhost:8000/v1/chat/completions',
      json={
          "model": "Unlimited-OCR",
          "messages": [{
              "role": "user",
              "content": [
                  {"type": "text", "text": "document parsing."},
                  {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encode_image('doc.jpg')}"}}
              ]
          }],
          "max_tokens": 32768
      }
  )

  # 3. 直接输出给向量数据库
  full_text = response.json()['choices'][0]['message']['content']
  # 存入 Pinecone/Weaviate/Milvus...
  ```
- **效果**：完整文档文本入库，支持语义搜索，上下文完整保留

---

## 👥 适合谁用？

✅ **文档密集型行业**：法律、金融、医疗、教育（大量纸质文档数字化）
✅ **企业 IT 团队**：需要批量处理扫描件、构建文档管理系统
✅ **AI 开发者**：需要高质量 OCR 数据，构建文档理解/RAG 应用
✅ **研究人员**：需要长文档数据集，研究文档理解模型
✅ **个人用户**：偶尔需要提取 PDF/长图文字

❌ **只需识别少量文字的人**（用手机 OCR App 更简单）
❌ **实时识别场景**（Unlimited-OCR 是离线批处理，不是实时流）

---

## ⚠️ 注意事项

- **硬件要求**：
  - 需要 NVIDIA GPU（推荐 A100/H100，24GB+ 显存）
  - CPU 推理极慢，不建议
- **费用**：模型免费开源，但需要 GPU 资源
  - 本地 GPU：电力成本
  - 云 GPU：$2-5/小时（A100）
- **技术门槛**：⭐⭐⭐⭐☆（需要 Python、PyTorch、Docker 知识）
- **替代方案**：
  - 商业 API：Google Cloud Vision、AWS Textract（更简单但收费）
  - 轻量级开源：Tesseract、PaddleOCR（更快但功能少）
- **学习资源**：
  - GitHub：https://github.com/baidu/Unlimited-OCR
  - Hugging Face：https://huggingface.co/baidu/Unlimited-OCR
  - 论文：https://arxiv.org/abs/2606.23050
  - Demo：https://huggingface.co/spaces/baidu/Unlimited-OCR

---

## 🎁 技术特点

| 特性 | 说明 |
|------|------|
| **超长上下文** | 32K token 输出，完整保留长文档结构 |
| **双模式支持** | gundam（高精度裁剪）+ base（完整视图） |
| **多推理引擎** | Transformers、vLLM、SGLang 全面支持 |
| **PDF 原生支持** | 自动转图片，多页解析，保留页序 |
| **开放生态** | MIT 许可，基于 Deepseek-OCR 改进 |
| **生产就绪** | Docker 镜像、OpenAI 兼容 API、批量脚本 |

### 三种推理方式对比

| 引擎 | 适用场景 | 性能 | 部署难度 |
|------|---------|------|---------|
| **Transformers** | 单张/少量图片 | 中等 | ⭐⭐☆☆☆ |
| **vLLM** | 高并发生产环境 | 高 | ⭐⭐⭐☆☆ |
| **SGLang** | 极高并发 + 自定义 | 最高 | ⭐⭐⭐⭐☆ |

---

## 🔧 技术栈

**模型架构**：基于 Deepseek-OCR 改进
**推理框架**：PyTorch + Transformers / vLLM / SGLang
**支持格式**：JPG、PNG、PDF（自动转图片）
**输出格式**：纯文本 + 坐标信息（可选保存）

---

## 📚 延伸阅读

- [Unlimited-OCR GitHub](https://github.com/baidu/Unlimited-OCR)
- [Hugging Face 模型](https://huggingface.co/baidu/Unlimited-OCR)
- [arXiv 论文](https://arxiv.org/abs/2606.23050)
- [在线 Demo](https://huggingface.co/spaces/baidu/Unlimited-OCR)
- [vLLM 官方配方](https://recipes.vllm.ai/baidu/Unlimited-OCR)
- [Deepseek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR)（基础模型）
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)（百度传统 OCR）

---
