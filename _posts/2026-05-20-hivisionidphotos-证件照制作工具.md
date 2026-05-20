---
layout: post
title: "一键生成各种规格证件照的免费 AI 工具：HivisionIDPhotos"
date: 2026-05-20
tags: [AI, 开发, 实用工具]
header-style: 'text'
subtitle: "一键生成各种规格证件照的免费 AI 工具，支持抠图、换底色、排版，纯离线运行"
---

> 原网址：https://github.com/Zeyi-Lin/HivisionIDPhotos

---

📌 **一句话总结**：一键生成各种规格证件照的免费 AI 工具，支持抠图、换底色、排版，纯离线运行

🎯 **它是做什么的？**

HivisionIDPhotos 是一个"智能证件照工厂"。想象一下：
- 你自拍一张生活照 → AI 自动识别人脸 → 抠掉背景 → 换成蓝底/红底 → 裁剪成标准尺寸 → 排版成六寸相纸照片
- 全程**不需要联网**，不需要 Photoshop，不需要专业摄影棚
- 支持一寸、二寸、护照、签证等各种尺寸规格
- 还能美颜、旋转对齐人脸、生成打印排版

它的核心优势是**轻量级**和**离线运行**——只需要 CPU 就能快速处理，不像其他 AI 工具必须用显卡。

🔑 **核心概念解读**

**人像抠图（Portrait Matting）**
- 专业说：从图像中精确分离人物主体与背景的算法
- 通俗说：就像给照片里的人"剪影"，把人从背景中抠出来，背景变透明
- 生活类比：小时候手工课上，沿着照片边缘把人剪下来的过程

**证件照排版（Layout Photos）**
- 专业说：将标准证件照按照打印纸张尺寸进行多图排列
- 通俗说：把一张证件照复制多份，整齐地排在一张六寸相纸上，方便打印后裁剪
- 生活类比：就像便利店里贴满大头贴的排列方式

**人脸检测与对齐（Face Detection & Alignment）**
- 专业说：定位图像中人脸位置并校正姿态角度
- 通俗说：找到人脸在哪里，然后把歪着的脸"扶正"
- 生活类比：摄影师喊"头往左偏一点"在帮你调整角度

**美颜参数（Beauty Enhancement）**
- 专业说：对人像进行磨皮、美白等美化处理
- 通俗说：像美图秀秀一样，让皮肤看起来更光滑、更自然

💡 **切实可落地的例子**

**场景 1：求职者制作证件照**
- 痛点：明天面试需要证件照，照相馆要等 1 小时，还要 30 元
- 方案：用手机自拍一张，上传到 HivisionIDPhotos，一键生成二寸蓝底证件照
- 具体实现步骤：

```bash
# 1. 安装环境
git clone https://github.com/Zeyi-Lin/HivisionIDPhotos.git
cd HivisionIDPhotos
pip install -r requirements.txt
pip install -r requirements-app.txt

# 2. 下载模型
python scripts/download_model.py --models all

# 3. 启动网页版
python app.py

# 4. 浏览器打开 http://127.0.0.1:7860，上传你的自拍照
# 5. 选择"二寸"、"蓝底"，点击"生成证件照"
# 6. 下载高清证件照 + 六寸排版照
```
- 效果：5 分钟搞定，节省 30 元，照片质量媲美照相馆

**场景 2：开发者为公司集成证件照功能**
- 痛点：公司 HR 系统需要员工自助上传证件照，但不想接入收费 API
- 方案：部署 HivisionIDPhotos API 服务，让员工自己上传照片自动生成
- 具体实现步骤：

```bash
# 1. 启动 API 服务
python deploy_api.py

# 2. 用 Python 调用 API
import requests

# 上传照片并生成证件照
response = requests.post(
    "http://127.0.0.1:8080/idphoto",
    files={"file": open("employee.jpg", "rb")},
    data={
        "height": 413,  # 二寸高度
        "width": 295,   # 二寸宽度
        "color": "4f83ce",  # 蓝底
        "face_alignment": True  # 自动对齐人脸
    }
)

# 3. 保存结果
with open("idphoto_output.png", "wb") as f:
    f.write(response.content)
```
- 效果：零成本接入，员工 24 小时自助办理，HR 不用人工处理

**场景 3：打印店老板批量处理证件照**
- 痛点：客户要各种尺寸的证件照，手动排版太慢
- 方案：批量处理客户照片，自动生成不同规格的排版照
- 具体实现步骤：

```bash
# 创建批处理脚本 batch_process.sh
#!/bin/bash

for file in customer_photos/*.jpg; do
    filename=$(basename "$file" .jpg)

    # 生成一寸红底
    python inference.py -i "$file" -o "output/${filename}_1inch_red.jpg" \
        --height 295 --width 209 -c ff0000

    # 生成二寸蓝底
    python inference.py -i "$file" -o "output/${filename}_2inch_blue.jpg" \
        --height 413 --width 295 -c 4f83ce

    # 生成六寸排版照（包含 8 张二寸照）
    python inference.py -t generate_layout_photos \
        -i "output/${filename}_2inch_blue.jpg" \
        -o "output/${filename}_layout_6inch.jpg" \
        --height 413 --width 295 -k 200
done

# 运行批处理
chmod +x batch_process.sh
./batch_process.sh
```
- 效果：10 分钟处理 50 个客户照片，直接打印裁剪即可

👥 **适合谁用？**

✅ 需要证件照但不想去照相馆的个人用户
✅ 需要集成证件照功能的开发者（HR 系统、招聘平台等）
✅ 打印店、照相馆等批量处理业务
✅ 对隐私敏感的用户（纯离线，照片不上传云端）
❌ 对照片质量要求极高的专业摄影场合（如艺人宣传照）

⚠️ **注意事项**

- **完全免费**：开源项目，无付费功能
- **学习曲线**：⭐⭐⭐☆☆（需熟悉 Python 命令行）
- **硬件要求**：
  - CPU 推理：普通电脑即可，处理速度 0.2-7 秒/张
  - GPU 加速：需要 16GB 显存的英伟达显卡（可选）
- **替代方案**：
  - 在线证件照平台（如证件照大师）：收费但更简单
  - PS 手动处理：需要专业技能，耗时较长
  - 其他开源工具如 remove.bg：只支持抠图，不支持证件照生成
