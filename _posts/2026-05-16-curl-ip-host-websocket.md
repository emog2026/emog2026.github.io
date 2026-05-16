---
title: "curl 高级用法：IP/Host 配置与 WebSocket 请求最佳实践"
date: 2026-05-16
tags: [curl, websocket, networking, debugging, http, devops]
category: 技术指南
description: "掌握curl的高级用法：绕过DNS解析配置自定义IP和Host头，以及原生WebSocket请求调试技巧"
---

> 研究日期：2026-05-16
> 文章来源：3篇高质量技术文档
> 更新频率：建议每6个月更新一次

---

## 📌 技术概述

curl的高级用法主要包括两个核心场景：**DNS绕过与Host头定制**（用于测试、负载均衡后端调试、SSL证书验证）和**WebSocket连接调试**（实时双向通信测试）。这些技巧在微服务架构、API开发、生产环境故障排查中至关重要。

---

## 🎯 核心概念

### 1️⃣ DNS解析绕过（--resolve）

- **专业解释**：在curl的DNS缓存中预先注入域名到IP的映射，强制curl使用指定IP连接，完全绕过系统DNS查询
- **通俗类比**：像在手机通讯录中手动设置了一个快捷拨号，不再查号直接拨打
- **核心价值**：在DNS未生效、测试特定后端服务器、Hosts文件无法修改的场景下精准连接

### 2️⃣ Host头注入（-H "Host:"）

- **专业解释**：显式设置HTTP请求的Host头部字段，覆盖URL中的主机名
- **通俗类比**：寄快递时收件人地址写的是A仓库，但包裹单上写的是B公司名字
- **核心价值**：虚拟主机测试、SaaS平台多租户调试、API网关验证

### 3️⃣ WebSocket协议升级

- **专业解释**：通过HTTP/HTTPS发起连接，收到`101 Switching Protocols`响应后升级为WebSocket双向字节流
- **通俗类比**：打电话时先按常规语音接通，然后切换到高清视频模式
- **核心价值**：实时应用调试（聊天、推送、协同编辑）

### 4️⃣ 连接重定向（--connect-to）

- **专业解释**：在HTTP层重定向连接到不同主机和端口，同时保持原始URL的Host头
- **通俗类比**：快递单上写的是北京地址，但实际送到上海仓库
- **核心价值**：TLS证书场景下的IP直连（SNI路由）

### 5️⃣ WebSocket帧处理

- **专业解释**：curl 8.11.0+原生支持WebSocket帧的发送和接收，支持文本和二进制模式
- **通俗类比**：像把信纸折叠成标准大小的信封，对方收到后能按标准拆开
- **核心价值**：无需第三方工具直接测试WebSocket服务

---

## 🔧 软件安装与配置

### 安装curl（确保WebSocket支持）

**Ubuntu/Debian**：
```bash
# 检查当前版本
curl --version

# 安装最新版本（支持WebSocket）
sudo apt update
sudo apt install curl

# 如需最新版（8.11.0+），从源码编译
wget https://curl.se/download/curl-8.11.0.tar.bz2
tar xjf curl-8.11.0.tar.bz2
cd curl-8.11.0
./configure --with-openssl --enable-websocket
make
sudo make install
```

**CentOS/RHEL**：
```bash
sudo yum install curl
# 或使用dnf
sudo dnf install curl
```

**macOS**：
```bash
# 使用Homebrew
brew install curl

# 验证WebSocket支持
curl --version | grep -i websocket
# 应显示：websocket 或 HTTP2
```

**Docker**：
```bash
docker run --rm curlimages/curl:8.11.0 --version
```

### 验证WebSocket支持

```bash
# 检查是否支持ws://协议
curl --help | grep -E "ws|websocket"

# 测试基本WebSocket连接
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  https://echo.websocket.org
```

### 常用管理命令

```bash
# 查看curl版本和支持的协议
curl --version

# 查看所有选项
curl --help all

# 测试DNS解析
curl --trace-ascii trace.txt https://example.com

# 查看DNS缓存效果（使用--resolve）
curl --resolve example.com:443:1.2.3.4 https://example.com
```

---

## 🔨 后期维护指南

### 日志查看与分析

**详细连接日志**：
```bash
# 查看完整握手过程
curl --trace-ascii - --trace-time https://example.com

# 只看请求头
curl -v https://example.com 2>&1 | grep ">"

# 只看响应头
curl -v https://example.com 2>&1 | grep "<"
```

**WebSocket调试日志**：
```bash
# WebSocket连接调试
curl --trace ws_debug.log wss://echo.websocket.org

# 查看帧级别细节
curl --no-progress-meter --no-buffer -T . -N \
  --trace ws_frames.log wss://echo.websocket.org
```

### 性能监控

```bash
# 测量连接时间
curl -o /dev/null -s -w "\
     time_namelookup:  %{time_namelookup}\n\
     time_connect:     %{time_connect}\n\
     time_appconnect:  %{time_appconnect}\n\
     time_pretransfer: %{time_pretransfer}\n\
     time_starttransfer: %{time_starttransfer}\n\
     time_total:       %{time_total}\n" \
     https://example.com

# DNS解析性能对比
time curl --resolve example.com:443:1.2.3.4 https://example.com
time curl https://example.com
```

### 备份策略

```bash
# 备份curl配置文件
cp ~/.curlrc ~/.curlrc.backup.$(date +%Y%m%d)

# 导出当前会话配置
curl --config- file.dump.conf
```

### 更新升级流程

```bash
# 检查最新版本
curl --version

# 查看最新发布版
curl -s https://api.github.com/repos/curl/curl/releases/latest | grep tag_name

# 升级到最新版（Ubuntu）
sudo apt update && sudo apt upgrade curl

# 验证WebSocket功能
curl -V | grep websocket
```

### 常见问题排查

**问题1：WebSocket连接失败（404/403）**
```bash
# 检查服务器是否支持WebSocket
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://your-server.com/ws

# 预期：HTTP/1.1 101 Switching Protocols
# 实际：可能收到404或403表示路径错误或未授权
```

**问题2：--resolve不生效**
```bash
# 确保格式正确：host:port:ip
curl --resolve example.com:443:192.168.1.1 https://example.com

# 添加--trace查看DNS查询
curl --trace-ascii dns.log --resolve example.com:443:192.168.1.1 https://example.com
```

**问题3：SSL证书错误**
```bash
# 跳过证书验证（仅测试环境）
curl --insecure --resolve example.com:443:192.168.1.1 https://example.com

# 或指定CA证书
curl --cacert /path/to/ca.pem https://example.com
```

---

## 💡 实战场景

### 场景1：测试未生效的DNS记录（DNS预热）

**需求**：网站迁移到新服务器，需要先测试新IP但DNS还未全球生效

**方案**：使用`--resolve`强制curl连接新IP

**实现**：
```bash
# 原域名 example.com 尚未解析到新IP 203.0.113.50
# 使用--resolve绕过DNS直接连接新服务器

curl --resolve example.com:443:203.0.113.50 \
  -H "Host: example.com" \
  https://example.com/api/health

# 完整测试脚本
#!/bin/bash
NEW_IP="203.0.113.50"
DOMAIN="example.com"

echo "Testing new server at $NEW_IP..."

# 测试HTTPS
curl --resolve ${DOMAIN}:443:${NEW_IP} \
  -w "HTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -o /dev/null -s \
  https://${DOMAIN}/api/health

# 测试WebSocket
curl --resolve ${DOMAIN}:443:${NEW_IP} \
  --no-progress-meter --no-buffer \
  -T . -N \
  wss://${DOMAIN}/socket.io/?EIO=4

echo "Test completed"
```

**效果**：可以在DNS全球生效前验证新服务器配置是否正确

**注意**：
- `--resolve`格式为`域名:端口:IP`，冒号分隔
- HTTPS通常用443端口，HTTP用80
- 此方法不影响其他应用，仅对当前curl命令有效

---

### 场景2：调试负载均衡后的特定后端节点

**需求**：生产环境有10个后端Pod，某个用户报告问题，需要直接连接特定Pod复现

**方案**：结合`--resolve`和`-H "Host"`穿透负载均衡

**实现**：
```bash
# 获取目标Pod IP（假设为 10.244.2.15）
kubectl get pods -l app=backend -o wide

# 直接访问该Pod
curl --resolve api.example.com:443:10.244.2.15 \
  -H "Host: api.example.com" \
  -H "X-Debug-Pod: true" \
  https://api.example.com/users/123/profile

# 批量测试所有后端节点
#!/bin/bash
DOMAIN="api.example.com"
POD_IPS=("10.244.2.10" "10.244.2.11" "10.244.2.12" "10.244.2.13")

for ip in "${POD_IPS[@]}"; do
  echo "Testing pod $ip..."
  response=$(curl --resolve ${DOMAIN}:443:$ip \
    -H "Host: ${DOMAIN}" \
    -w "%{http_code}" \
    -o /dev/null \
    -s \
    https://${DOMAIN}/health)

  echo "Pod $ip: HTTP $response"
done
```

**效果**：绕过负载均衡直接调试特定实例，快速定位问题Pod

**注意**：
- 需要有网络访问权限（可能需要kubectl port-forward或VPN）
- 适合Kubernetes/Docker Swarm等容器环境
- 注意目标Pod的防火墙/NetworkPolicy配置

---

### 场景3：WebSocket实时通信调试（聊天室测试）

**需求**：开发一个聊天功能，需要测试WebSocket消息收发、重连、心跳

**方案**：使用curl 8.11.0+原生WebSocket支持进行交互式测试

**实现**：
```bash
# 基本WebSocket回显测试
echo "Hello WebSocket" | \
  curl --no-progress-meter --no-buffer \
  -T - -N \
  -H "X-Client-ID: test-001" \
  wss://echo.websocket.org

# 交互式聊天测试（读取stdin发送消息）
#!/bin/bash
WS_SERVER="wss://your-chat-app.com/socket"

echo "Connecting to $WS_SERVER..."
echo "Type messages and press Enter to send."
echo "Press Ctrl+C to exit."

# 启动WebSocket连接
curl --no-progress-meter --no-buffer \
  -T . -N \
  -H "Origin: https://your-chat-app.com" \
  -H "Cookie: session_id=abc123" \
  $WS_SERVER
```

**高级测试：发送JSON格式的WebSocket消息**
```bash
# 发送认证消息
cat <<'EOF' | curl --no-progress-meter --no-buffer -T - -N wss://api.example.com/ws
{"event": "auth", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}
EOF

# 发送聊天消息（分多行发送）
(echo '{"event": "message", "room": "general", "text": "Hello from curl"}'; \
 sleep 2; \
 echo '{"event": "ping"}'; \
 sleep 60) | \
curl --no-progress-meter --no-buffer -T - -N wss://api.example.com/ws
```

**测试连接健康和心跳**
```bash
# 测试心跳间隔
timeout 10 curl --no-progress-meter --no-buffer \
  -T . -N \
  --trace heartbeat.log \
  wss://echo.websocket.org

# 分析日志中的ping/pong帧
grep -i "ping\|pong" heartbeat.log
```

**效果**：无需安装wscat、websocat等工具，直接用curl测试WebSocket

**注意**：
- 需要curl 8.11.0或更高版本（`curl --version`查看）
- `-T .`表示从stdin读取输入（交互式）
- `-N`禁用缓冲，确保实时输出
- `--no-progress-meter`和`--no-buffer`确保实时显示

---

### 场景4：SaaS平台多租户Host头测试

**需求**：SaaS平台使用子域名区分租户（tenant1.saas.com），需要测试单个IP下的多租户路由

**方案**：使用`-H "Host"`模拟不同租户的域名访问

**实现**：
```bash
# 测试多个租户域名（都指向同一IP）
SAAS_IP="192.0.2.50"
TENANTS=("tenant1" "tenant2" "tenant3")

for tenant in "${TENANTS[@]}"; do
  domain="${tenant}.saas.com"
  echo "Testing $domain..."

  curl --resolve ${domain}:443:${SAAS_IP} \
    -H "Host: ${domain}" \
    -H "Authorization: Bearer test-token" \
    -w "\nHTTP: %{http_code} | Tenant: ${tenant}\n" \
    -o /dev/null -s \
    https://${domain}/api/tenant/info
done

# 测试租户隔离（确保tenant1无法访问tenant2的数据）
curl --resolve tenant1.saas.com:443:192.0.2.50 \
  -H "Host: tenant1.saas.com" \
  -H "Authorization: Bearer tenant1-token" \
  https://tenant1.saas.com/api/tenant2/data

# 预期结果：403 Forbidden（租户隔离正常）
```

**效果**：验证多租户路由和隔离机制是否正确

**注意**：
- Host头必须与SSL证书匹配（或使用--insecure）
- 测试时要确保租户数据真正隔离
- 可以结合`--trace`查看请求头传递情况

---

### 场景5：TLS/SNI场景下的IP直连

**需求**：服务器使用SNI（Server Name Indication）路由，直接IP访问会返回默认证书

**方案**：使用`--connect-to`在建立TLS连接前重定向到目标IP

**实现**：
```bash
# --connect-to格式：HOST:PORT:CONNECT-HOST:CONNECT-PORT

# 示例1：访问通过SNI路由的HTTPS服务
curl --connect-to example.com:443:internal-server.example.com:8443 \
  https://example.com/api/data

# 示例2：云函数/CDN后端调试
curl --connect-to api.example.com:443:origin-server.cloudflare.com:443 \
  -H "Host: api.example.com" \
  https://api.example.com/health

# 示例3：Kubernetes Ingress后端Pod直连
curl --connect-to app.example.com:443:10.244.1.5:8443 \
  --insecure \
  https://app.example.com/metrics
```

**对比不同方法**：
```bash
# 方法1：--resolve（DNS缓存层）
curl --resolve example.com:443:1.2.3.4 https://example.com

# 方法2：-H "Host"（仅HTTP层）
curl -H "Host: example.com" https://1.2.3.4/

# 方法3：--connect-to（连接层，推荐用于SNI）
curl --connect-to example.com:443:real-backend:443 https://example.com
```

**效果**：正确处理SNI场景，避免证书不匹配错误

**注意**：
- `--connect-to`优于`--resolve`在SNI场景下
- 需要curl 7.49.0+版本
- 格式严格：`目标主机:目标端口:实际主机:实际端口`

---

## ⚙️ 核心配置/代码模板

### DNS绕过配置模板

```bash
#!/bin/bash
# dns-bypass.sh - 绕过DNS直接访问指定IP

DOMAIN="example.com"
IP="203.0.113.50"
PORT="443"

# HTTPS请求
curl --resolve ${DOMAIN}:${PORT}:${IP} \
  -H "Host: ${DOMAIN}" \
  -w "\nDNS Bypass: ${DOMAIN} -> ${IP}\n" \
  https://${DOMAIN}/api/endpoint

# 批量解析多个域名
declare -A DNS_MAP=(
  ["api.example.com"]="192.0.2.10"
  ["cdn.example.com"]="192.0.2.20"
  ["auth.example.com"]="192.0.2.30"
)

for domain in "${!DNS_MAP[@]}"; do
  ip=${DNS_MAP[$domain]}
  echo "Resolving $domain -> $ip"
  curl --resolve ${domain}:443:$ip \
    -o /dev/null -s -w "HTTP %{http_code}\n" \
    https://${domain}/health
done
```

### Host头配置模板

```bash
#!/bin/bash
# host-header-config.sh - 自定义Host头测试

# 基础Host头设置
curl -H "Host: custom.example.com" http://192.168.1.1/api

# 多个Host头测试
HOSTS=("frontend.internal" "backend.internal" "admin.internal")

for host in "${HOSTS[@]}"; do
  echo "Testing Host: $host"
  curl -H "Host: $host" \
    -H "X-Forwarded-For: 203.0.113.100" \
    -H "X-Real-IP: 203.0.113.100" \
    http://192.168.1.1/vhost-test
done

# 虚拟主机测试（Apache/Nginx）
curl -H "Host: dev.example.com" http://shared-ip-server/
curl -H "Host: staging.example.com" http://shared-ip-server/
curl -H "Host: prod.example.com" http://shared-ip-server/
```

### WebSocket请求模板

```bash
#!/bin/bash
# websocket-test.sh - WebSocket连接测试脚本

# 配置
WS_SERVER="wss://echo.websocket.org"
TIMEOUT=30

# 检查curl版本
CURL_VERSION=$(curl --version | head -n 1 | awk '{print $2}')
echo "Using curl version: $CURL_VERSION"

# 测试1：基本WebSocket连接
echo "=== Test 1: Basic WebSocket Echo ==="
echo "Test message" | \
curl --no-progress-meter --no-buffer \
  -T - -N \
  --connect-timeout $TIMEOUT \
  $WS_SERVER

echo -e "\n"

# 测试2：带自定义头的WebSocket
echo "=== Test 2: WebSocket with Custom Headers ==="
echo '{"type": "ping", "data": "test"}' | \
curl --no-progress-meter --no-buffer \
  -T - -N \
  -H "Origin: https://example.com" \
  -H "Cookie: session_id=abc123" \
  -H "X-Client-Version: 1.0.0" \
  $WS_SERVER

echo -e "\n"

# 测试3：长时间连接（心跳测试）
echo "=== Test 3: Long-lived Connection (heartbeat) ==="
timeout 60 \
curl --no-progress-meter --no-buffer \
  -T . -N \
  $WS_SERVER

echo -e "\n"

# 测试4：多个WebSocket连接
echo "=== Test 4: Concurrent Connections ==="
for i in {1..3}; do
  (
    echo "Client $i: Hello" | \
    curl --no-progress-meter --no-buffer \
      -T - -N \
      -H "X-Client-ID: client-$i" \
      $WS_SERVER
  ) &
done
wait
```

### 组合配置（IP + Host + WebSocket）

```bash
#!/bin/bash
# combined-ws-test.sh - 组合使用所有高级选项

WS_DOMAIN="ws.example.com"
WS_IP="10.244.1.20"

# 使用--resolve连接WebSocket服务器
curl --resolve ${WS_DOMAIN}:443:${WS_IP} \
  -H "Host: ${WS_DOMAIN}" \
  -H "Origin: https://example.com" \
  --no-progress-meter --no-buffer \
  -T . -N \
  wss://${WS_DOMAIN}/socket.io/

# 使用--connect-to连接SNI路由的WebSocket
curl --connect-to ${WS_DOMAIN}:443:internal-backend:8443 \
  -H "Host: ${WS_DOMAIN}" \
  --no-progress-meter --no-buffer \
  -T . -N \
  wss://${WS_DOMAIN}/ws
```

---

## 🚨 常见陷阱与解决方案

### 陷阱1：使用 `:latest` 标签导致WebSocket不可用

**问题现象**：
```bash
curl: (1) Protocol "wss" not supported on this system
```

**根本原因**：
Docker镜像中的curl版本过旧（< 8.11.0），不支持WebSocket协议

**解决方案**：
```bash
# ❌ 错误：使用默认版本
docker run --rm curl curl --version
# curl 7.81.0

# ✅ 正确：指定支持WebSocket的版本
docker run --rm curlimages/curl:8.11.0 curl --version
# curl 8.11.0

# ✅ 或使用最新标签
docker run --rm curlimages/curl:latest curl --version
```

**预防措施**：
- 生产环境固定版本号（如`curlimages/curl:8.11.0`）
- 定期检查curl更新日志
- 在CI/CD中添加版本检查

---

### 陷阱2：`--resolve` 格式错误导致不生效

**问题现象**：
```bash
curl --resolve example.com 203.0.113.50 https://example.com
# 仍然连接到旧IP
```

**根本原因**：
`--resolve`格式要求严格的`域名:端口:IP`，缺少端口会失效

**解决方案**：
```bash
# ❌ 错误格式
curl --resolve example.com 203.0.113.50 https://example.com
curl --resolve example.com:203.0.113.50 https://example.com

# ✅ 正确格式（HTTPS用443）
curl --resolve example.com:443:203.0.113.50 https://example.com

# ✅ 正确格式（HTTP用80）
curl --resolve example.com:80:203.0.113.50 http://example.com

# ✅ 同时指定HTTP和HTTPS
curl --resolve example.com:80:203.0.113.50 \
     --resolve example.com:443:203.0.113.50 \
     https://example.com
```

**预防措施**：
- 在脚本中验证参数格式
- 使用`--trace`查看DNS查询过程
- 编写wrapper函数强制验证格式

---

### 陷阱3：Host头与SSL证书不匹配

**问题现象**：
```bash
curl: (60) SSL: certificate subject name does not match target host name
```

**根本原因**：
使用`-H "Host"`修改Host头后，TLS握手中的SNI仍使用URL中的域名，导致证书验证失败

**解决方案**：
```bash
# 场景：要访问203.0.113.50但Host头设为example.com

# ❌ 错误：证书不匹配
curl -H "Host: example.com" https://203.0.113.50/

# ✅ 方案1：跳过证书验证（仅测试环境）
curl -H "Host: example.com" --insecure https://203.0.113.50/

# ✅ 方案2：使用--resolve（推荐）
curl --resolve example.com:443:203.0.113.50 \
  -H "Host: example.com" \
  https://example.com/

# ✅ 方案3：使用--connect-to（SNI场景）
curl --connect-to example.com:443:203.0.113.50:443 \
  https://example.com/
```

**预防措施**：
- 生产环境不使用`--insecure`
- 使用`--resolve`或`--connect-to`替代直接IP+Host头
- 测试环境配置自签名证书或使用内部CA

---

### 陷阱4：WebSocket连接超时或无响应

**问题现象**：
```bash
curl wss://echo.websocket.org
# 命令挂起，无输出
```

**根本原因**：
curl默认等待标准输入，缺少实时输出选项导致看起来无响应

**解决方案**：
```bash
# ❌ 错误：默认行为（等待stdin）
curl wss://echo.websocket.org

# ✅ 正确：添加实时输出选项
echo "test" | \
curl --no-progress-meter --no-buffer \
  -T - -N \
  wss://echo.websocket.org

# ✅ 交互式模式
curl --no-progress-meter --no-buffer -T . -N wss://echo.websocket.org

# 参数说明：
# -T . / -T -   从stdin读取输入
# -N            禁用缓冲（No-buffer）
# --no-buffer   确保实时输出
# --no-progress-meter 不显示进度条
```

**预防措施**：
- WebSocket测试总是添加`-N`和`--no-buffer`
- 使用`timeout`命令防止无限挂起
- 建立标准测试模板脚本

---

### 陷阱5：混合使用--resolve和--connect-to导致冲突

**问题现象**：
```bash
curl --resolve example.com:443:1.2.3.4 \
     --connect-to example.com:443:5.6.7.8:443 \
     https://example.com
# 连接到错误的IP
```

**根本原因**：
两个选项都作用于连接层，同时使用时行为不确定

**解决方案**：
```bash
# ❌ 错误：冲突
curl --resolve example.com:443:1.2.3.4 \
     --connect-to example.com:443:5.6.7.8:443 \
     https://example.com

# ✅ 正确：只使用一个（DNS缓存用--resolve）
curl --resolve example.com:443:1.2.3.4 https://example.com

# ✅ 正确：只使用一个（SNI场景用--connect-to）
curl --connect-to example.com:443:1.2.3.4:443 https://example.com

# 选择建议：
# - 简单DNS绕过：用--resolve
# - TLS/SNI复杂场景：用--connect-to
# - 两个都不要同时使用
```

**预防措施**：
- 团队代码审查检查这种混合使用
- 在文档中明确说明两个选项的适用场景
- 编写linter或pre-commit hook检测

---

## 🔗 资源推荐

### 官方文档

- **curl官方WebSocket文档**：[WebSocket with curl](https://curl.se/docs/websocket.html)
  - 最权威的WebSocket API文档
  - 涵盖libcurl和命令行两种用法

- **everything curl - WebSocket章节**：[WebSocket - everything curl](https://everything.curl.dev/helpers/ws/index.html)
  - curl官方书籍的WebSocket专门章节
  - 详细解释协议升级过程

- **curl发布说明**：[curl 8.11.0 Release Notes](https://github.com/curl/curl/releases/tag/curl_8_11_0)
  - WebSocket功能成为稳定版本的发布说明

### 推荐工具

- **websocat**：命令行WebSocket专用工具（功能比curl更丰富）
  ```bash
  # 安装
  cargo install websocat

  # 使用
  websocat wss://echo.websocket.org
  ```

- **wscat**：Node.js编写的WebSocket客户端
  ```bash
  npm install -g wscat
  wscat -c wss://echo.websocket.org
  ```

- **mosh**：移动终端工具（支持网络切换时保持连接）

### 延伸阅读

- **Curl Finally Speaks WebSocket**（DevOps博客）
  - 介绍curl 8.11.0的WebSocket新功能
  - 实战案例和迁移指南

- **HTTP Host头漏洞防护**
  - OWASP关于Host头注入的安全建议
  - 如何防止Host头攻击

- **WebSocket协议RFC 6455**
  - WebSocket协议的官方规范
  - 深入理解帧格式、握手流程

- **SNI（Server Name Indiation）详解**
  - 理解为什么直接IP访问HTTPS会失败
  - CDN和负载均衡中的SNI应用

### 测试服务

- **WebSocket Echo Server**：`wss://echo.websocket.org`
  - 公共WebSocket回显测试服务器
  - 返回你发送的任何消息

- **HTTP测试服务**：`https://httpbin.org`
  - 提供各种HTTP端点测试工具
  - 可测试Host头、headers等

### 社区资源

- **curl邮件列表**：https://lists.haxx.se/listinfo/curl-users
- **Stack Overflow - curl标签**：https://stackoverflow.com/questions/tagged/curl
- **GitHub Discussions**：https://github.com/curl/curl/discussions

---

## 📚 附录

### curl版本演进

| 版本 | 发布日期 | WebSocket支持 | 重要特性 |
|------|----------|---------------|----------|
| 7.0 | 2000-03 | ❌ | 初始版本 |
| 7.40 | 2015-03 | ❌ | 添加--connect-to |
| 7.50 | 2016-08 | ❌ | --resolve性能优化 |
| 7.86 | 2022-12 | 实验性 | WebSocket实验功能 |
| **8.11.0** | **2024-11-06** | ✅ 稳定 | WebSocket成为正式功能 |

### 快速参考卡

```bash
# DNS绕过
curl --resolve domain:443:ip https://domain

# Host头定制
curl -H "Host: custom.com" http://ip/

# SNI路由
curl --connect-to domain:443:real-ip:443 https://domain

# WebSocket基本测试
echo "test" | curl --no-progress-meter --no-buffer -T - -N wss://echo.websocket.org

# WebSocket带自定义头
echo '{"msg":"hello"}' | curl -H "Origin: https://example.com" --no-buffer -T - -N wss://api.example.com/ws

# 组合使用
curl --resolve ws.domain.com:443:10.0.0.5 -H "Host: ws.domain.com" wss://ws.domain.com/socket
```

---

**最后更新**：2026-05-16
**适用curl版本**：8.11.0+
**维护者**：技术团队
**反馈渠道**：提交Issue或Pull Request
