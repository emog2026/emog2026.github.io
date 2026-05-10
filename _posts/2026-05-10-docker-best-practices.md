---
title: "Docker 容器化最佳实践指南"
date: 2026-05-10
tags: [docker, 容器化, devops, 微服务, 最佳实践]
category: 技术指南
description: "一份全面的 Docker 容器化实战指南，涵盖镜像优化、生产部署、安全加固和运维管理的完整配置方案"
---

## 📌 技术概述

Docker 是一个开源的容器化平台，可以将应用程序及其依赖打包到轻量级、可移植的容器中，实现"一次构建，到处运行"。Docker 利用 Linux 容器技术（LXC）和 cgroups 资源隔离机制，提供比虚拟机更高效的资源利用率和更快的启动速度。Docker 已成为现代云原生应用开发、微服务架构和 CI/CD 流水的标准基础设施。

**主要应用场景**：
- 应用容器化部署
- 微服务架构实现
- CI/CD 流水线集成
- 开发环境标准化
- 混合云和多云部署

---

## 🎯 核心概念

### 1. 容器（Container）
- **专业解释**：容器是镜像的运行实例，使用 Linux 内核特性（命名空间、cgroups）实现资源隔离和限制
- **通俗类比**：像是一个轻量级的虚拟机，但共享宿主机内核，比虚拟机更轻量、启动更快
- **核心价值**：环境一致性、快速部署、资源高效利用

### 2. 镜像（Image）
- **专业解释**：只读的应用程序模板，包含运行应用所需的代码、运行时、库、环境变量和配置文件
- **通俗类比**：像是容器的"蓝图"或"模板"，可以基于镜像创建多个容器实例
- **核心价值**：版本控制、可复现性、分层存储

### 3. Dockerfile
- **专业解释**：文本格式的配置文件，包含一系列构建 Docker 镜像的指令
- **通俗类比**：像是容器的"菜谱"，定义了如何一步步构建出想要的镜像
- **核心价值**：基础设施即代码、自动化构建、版本管理

### 4. 多阶段构建（Multi-stage Build）
- **专业解释**：在同一个 Dockerfile 中使用多个 FROM 指令，每个 FROM 开始一个新的构建阶段，只将需要的文件复制到最终镜像
- **通俗类比**：像是在不同的厨房之间传递食材，最后只把做好的菜端给顾客，厨房的杂乱不呈现
- **核心价值**：大幅减小镜像体积（可减少 70%+）、提高安全性

### 5. 容器编排（Orchestration）
- **专业解释**：自动管理容器生命周期的技术，包括部署、扩展、负载均衡、故障自愈等
- **通俗类比**：像是一个智能调度员，自动管理大量容器的工作分配和资源调度
- **核心价值**：大规模容器管理、高可用性、弹性伸缩

---

## 🔧 软件安装与配置

### 安装方法

**1. Ubuntu/Debian 安装（推荐）**

```bash
# 更新包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
sudo docker run hello-world
```

**2. CentOS/RHEL 安装**

```bash
# 安装必要的依赖
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 添加 Docker 仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker run hello-world
```

**3. 使用一键安装脚本（开发测试环境）**

```bash
# 下载并执行 Docker 官方安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker
```

**4. macOS 安装**

```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或下载 Docker Desktop for Mac
# 访问 https://www.docker.com/products/docker-desktop
```

**5. Windows 安装**

```bash
# 启用 WSL 2
wsl --install

# 下载 Docker Desktop for Windows
# 访问 https://www.docker.com/products/docker-desktop

# 或使用 winget
winget install Docker.DockerDesktop
```

### 基础配置

**1. Docker Daemon 配置** (`/etc/docker/daemon.json`)

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ],
  "data-root": "/var/lib/docker",
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "0.0.0.0:9323",
  "default-runtime": "runc",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

**2. 配置说明**

```bash
# 创建配置目录
sudo mkdir -p /etc/docker

# 应用配置
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info
```

**3. 网络配置**

```bash
# 创建自定义桥接网络
docker network create -d bridge \
  --subnet=192.168.100.0/24 \
  --gateway=192.168.100.1 \
  my-network

# 查看网络列表
docker network ls

# 查看网络详情
docker network inspect my-network
```

### 启动与验证

**1. 服务管理**

```bash
# 启动 Docker 服务
sudo systemctl start docker

# 停止 Docker 服务
sudo systemctl stop docker

# 重启 Docker 服务
sudo systemctl restart docker

# 查看服务状态
sudo systemctl status docker

# 设置开机自启
sudo systemctl enable docker
```

**2. 安装验证**

```bash
# 查看 Docker 版本
docker --version
docker version

# 查看系统信息
docker info

# 运行测试容器
docker run hello-world

# 运行交互式容器
docker run -it ubuntu bash

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a
```

**3. 权限配置**

```bash
# 创建 docker 组（通常已存在）
sudo groupadd docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录以使权限生效
# 或使用 newgrp 命令立即生效
newgrp docker

# 验证（无需 sudo）
docker run hello-world
```

### 常用管理命令

**1. 镜像管理**

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull nginx:1.21-alpine

# 查看本地镜像
docker images
docker image ls

# 删除镜像
docker rmi nginx:latest
docker image prune -a  # 删除未使用的镜像

# 构建镜像
docker build -t myapp:v1.0 .
docker build -f Dockerfile.prod -t myapp:prod .

# 导出/导入镜像
docker save -o myapp.tar myapp:v1.0
docker load -i myapp.tar
```

**2. 容器管理**

```bash
# 运行容器
docker run -d --name mynginx -p 80:80 nginx:latest

# 运行交互式容器
docker run -it --name myubuntu ubuntu bash

# 后台运行并映射端口
docker run -d \
  --name myweb \
  -p 8080:80 \
  -v /host/path:/container/path \
  -e ENV_VAR=value \
  nginx:alpine

# 查看容器日志
docker logs mynginx
docker logs -f mynginx  # 实时跟踪日志
docker logs --tail 100 mynginx  # 查看最后100行

# 进入运行中的容器
docker exec -it mynginx bash
docker exec -it mynginx /bin/sh

# 停止容器
docker stop mynginx

# 启动已停止的容器
docker start mynginx

# 重启容器
docker restart mynginx

# 删除容器
docker rm mynginx
docker container prune -f  # 删除已停止的容器
```

**3. Docker Compose 命令**

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f

# 重新构建并启动
docker compose up -d --build

# 扩容服务
docker compose up -d --scale web=3

# 执行命令
docker compose exec web bash
docker compose exec db mysql -uroot -p
```

---

## 🔨 后期维护指南

### 日志查看与分析

**1. 容器日志管理**

```bash
# 查看容器日志
docker logs mycontainer
docker logs -f --tail 100 mycontainer

# 查看所有容器的日志大小
du -sh /var/lib/docker/containers/*/*-json.log

# 清理容器日志（注意：会删除所有日志）
docker system prune -a

# 实时监控多个容器日志
docker logs -f $(docker ps -q)
```

**2. Docker 日志配置**

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production"
  }
}
```

**3. 日志分析示例**

```bash
# 统计错误日志
docker logs mycontainer 2>&1 | grep -i error | wc -l

# 查找特定时间段的日志
docker logs --since 2024-05-10T00:00:00 --until 2024-05-10T23:59:59 mycontainer

# 分析日志中的 HTTP 状态码
docker logs nginx | grep -oP 'HTTP/1\.\d"\s+\d{3}' | sort | uniq -c | sort -rn
```

### 性能监控

**1. 容器资源监控**

```bash
# 实时查看容器资源使用情况
docker stats

# 查看特定容器的资源使用
docker stats mycontainer

# 查看所有容器的资源使用（不刷新）
docker stats --no-stream

# 格式化输出
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"\

# 查看容器进程
docker top mycontainer
```

**2. 系统级监控**

```bash
# 查看 Docker 磁盘使用
docker system df

# 查看详细信息
docker system df -v

# 查看容器详细信息
docker inspect mycontainer

# 查看容器端口映射
docker port mycontainer

# 查看容器文件系统变更
docker diff mycontainer
```

**3. 监控工具集成**

```bash
# cAdvisor（容器监控）
docker run -d \
  --name=cadvisor \
  --restart=unless-stopped \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest

# Portainer（Docker 管理界面）
docker run -d \
  --name portainer \
  --restart=unless-stopped \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### 备份策略

**1. 镜像备份**

```bash
# 备份单个镜像
docker save -o /backup/myapp-v1.0.tar myapp:v1.0

# 备份所有镜像
docker save -o /backup/all-images.tar $(docker images -q)

# 压缩备份
docker save myapp:v1.0 | gzip > /backup/myapp-v1.0.tar.gz

# 批量备份脚本
for image in $(docker images --format "{{.Repository}}:{{.Tag}}"); do
  echo "Backing up $image"
  docker save "$image" | gzip > "/backup/$(echo $image | tr '/:' '_').tar.gz"
done
```

**2. 数据卷备份**

```bash
# 备份数据卷
docker run --rm \
  -v mydata:/data \
  -v /backup:/backup \
  alpine tar czf /backup/mydata-$(date +%Y%m%d).tar.gz /data

# 备份所有数据卷
docker volume ls -q | xargs -I {} sh -c 'docker run --rm -v {}:/data -v /backup:/backup alpine tar czf /backup/{}.tar.gz /data'
```

**3. 自动备份脚本** (`/usr/local/bin/backup-docker.sh`)

```bash
#!/bin/bash
BACKUP_DIR="/backup/docker"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR/images
mkdir -p $BACKUP_DIR/volumes

# 备份所有镜像
echo "Backing up Docker images..."
docker save $(docker images -q) | gzip > "$BACKUP_DIR/images/all-images-$DATE.tar.gz"

# 备份所有数据卷
echo "Backing up Docker volumes..."
for volume in $(docker volume ls -q); do
  docker run --rm \
    -v "$volume":/data \
    -v "$BACKUP_DIR/volumes":/backup \
    alpine tar czf "/backup/$volume-$DATE.tar.gz" /data
done

# 删除旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

**4. 定时备份配置**

```bash
# 添加执行权限
chmod +x /usr/local/bin/backup-docker.sh

# 编辑 crontab
crontab -e

# 每天凌晨 2 点执行备份
0 2 * * * /usr/local/bin/backup-docker.sh >> /var/log/docker-backup.log 2>&1
```

### 更新升级流程

**1. 检查更新**

```bash
# Ubuntu/Debian
sudo apt-get update
apt list --upgradable | grep docker

# CentOS/RHEL
sudo yum check-update docker-ce

# 查看当前版本
docker --version
docker version
```

**2. 更新 Docker**

```bash
# Ubuntu/Debian
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# CentOS/RHEL
sudo yum update -y docker-ce docker-ce-cli containerd.io

# 验证更新
docker version
docker run hello-world
```

**3. 升级前准备**

```bash
# 1. 备份重要数据
docker run --rm \
  -v important_volume:/data \
  -v /backup:/backup \
  alpine tar czf /backup/important-$(date +%Y%m%d).tar.gz /data

# 2. 停止所有容器
docker stop $(docker ps -aq)

# 3. 导出所有镜像（可选）
docker save -o /backup/all-images-$(date +%Y%m%d).tar $(docker images -q)
```

**4. 升级后验证**

```bash
# 1. 启动 Docker 服务
sudo systemctl start docker

# 2. 测试运行
docker run hello-world

# 3. 启动应用容器
docker compose -f /path/to/docker-compose.yml up -d

# 4. 验证应用正常
curl http://localhost:8080/health
```

### 常见问题排查

**问题 1：容器无法启动**

```bash
# 查看容器日志
docker logs mycontainer

# 查看容器详情
docker inspect mycontainer

# 查看最近的容器
docker ps -a | head -5

# 重新创建容器
docker-compose up -d --force-recreate
```

**问题 2：镜像拉取失败**

```bash
# 检查网络连接
ping registry-1.docker.io

# 查看镜像是否已存在
docker images | grep nginx

# 使用国内镜像加速
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}

# 重启 Docker
sudo systemctl restart docker
```

**问题 3：容器磁盘空间不足**

```bash
# 查看磁盘使用
docker system df

# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune -f

# 清理未使用的数据卷
docker volume prune -f

# 清理未使用的网络
docker network prune -f

# 清理所有未使用的资源
docker system prune -a --volumes
```

**问题 4：容器性能问题**

```bash
# 查看容器资源使用
docker stats --no-stream

# 限制容器资源
docker update \
  --memory="512m" \
  --cpus="1.0" \
  mycontainer

# 查看容器进程
docker top mycontainer

# 查看容器文件系统使用
docker exec mycontainer df -h
```

### 定期维护任务

**每日检查**：
- 检查容器运行状态
- 监控资源使用情况
- 查看错误日志

**每周任务**：
- 清理未使用的镜像和容器
- 检查安全更新
- 备份关键数据

**每月任务**：
- 完整备份镜像和数据卷
- 性能评估和优化
- 审查安全配置
- 更新基础镜像

---

## 💡 实战场景

### 场景 1：Node.js 应用容器化

**需求**：将一个 Express.js 应用容器化，生产镜像从 500MB 优化到 50MB 以下

**方案**：使用多阶段构建 + Alpine 基础镜像

**实现**：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件（利用层缓存）
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:20-alpine

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 从构建阶段复制依赖和构建产物
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "dist/index.js"]
```

**效果**：镜像从 580MB 降至 45MB，启动速度提升 3 倍，安全性提高

**注意**：Alpine 使用 musl libc，某些原生 Node.js 模块可能不兼容，需要测试验证

---

### 场景 2：Python 数据科学应用容器化

**需求**：容器化包含 NumPy、Pandas、Scikit-learn 的数据分析应用，优化镜像大小和构建速度

**方案**：多阶段构建 + 依赖缓存 + 清理机制

**实现**：

```dockerfile
# 基础镜像
FROM python:3.11-slim AS base

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        && rm -rf /var/lib/apt/lists/*

# 构建阶段
FROM base AS builder

WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖并缓存
RUN pip install --no-cache-dir --user -r requirements.txt

# 运行阶段
FROM base AS final

WORKDIR /app

# 从构建阶段复制安装的包
COPY --from=builder /root/.local /root/.local

# 复制应用代码
COPY . .

# 确保脚本在 PATH 中
ENV PATH=/root/.local/bin:$PATH

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# 启动命令
CMD ["python", "app.py"]
```

**requirements.txt**：

```txt
numpy==1.24.3
pandas==2.0.2
scikit-learn==1.2.2
flask==2.3.0
gunicorn==21.2.0
```

**效果**：镜像大小减少 40%，构建时间缩短 60%

**注意**：使用 `--no-install-recommends` 避免安装不必要的包，清理 apt 缓存减小镜像体积

---

### 场景 3：Go 应用极小化镜像

**需求**：构建极小的 Go 应用运行时镜像（< 10MB）

**方案**：静态编译 + scratch 基础镜像

**实现**：

```dockerfile
# 构建阶段
FROM golang:1.21-alpine AS builder

# 安装必要工具
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# 复制 go mod 文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建静态可执行文件
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -a -installsuffix cgo \
    -o main .

# 运行阶段（使用 scratch 基础镜像）
FROM scratch

# 从构建阶段复制 CA 证书
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 复制构建的二进制文件
COPY --from=builder /app/main /main

# 暴露端口
EXPOSE 8080

# 健康检查（需要添加到应用代码中）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/main", "--healthcheck"]

# 启动应用
CMD ["/main"]
```

**应用代码中的健康检查** (`main.go`)：

```go
package main

import (
    "fmt"
    "net/http"
    "os"
)

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    fmt.Fprintf(w, "OK")
}

func main() {
    http.HandleFunc("/health", healthCheckHandler)

    // 支持命令行健康检查
    if len(os.Args) > 1 && os.Args[1] == "--healthcheck" {
        resp, err := http.Get("http://localhost:8080/health")
        if err != nil || resp.StatusCode != 200 {
            os.Exit(1)
        }
        os.Exit(0)
    }

    http.ListenAndServe(":8080", nil)
}
```

**效果**：最终镜像仅 2-5MB，无任何安全漏洞，启动速度快

**注意**：scratch 镜像无 shell，调试困难，建议在构建阶段充分测试

---

### 场景 4：Docker Compose 生产环境部署

**需求**：使用 Docker Compose 部署一个包含 Web 应用、数据库、Redis 缓存的生产环境

**方案**：使用 Docker Compose 配置多容器应用

**实现**：

```yaml
version: '3.8'

services:
  # Web 应用
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: myapp:${VERSION:-latest}
    container_name: myapp-web
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    volumes:
      - ./public:/app/public
      - web-logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass redispass
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: myapp-nginx
    restart: unless-stopped
    ports:
      - "443:443"
      - "8080:8080"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./public:/usr/share/nginx/html:ro
    depends_on:
      - web
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 128M

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  db-data:
    driver: local
  redis-data:
    driver: local
  web-logs:
    driver: local
```

**部署脚本** (`deploy.sh`)：

```bash
#!/bin/bash

set -e

# 配置环境变量
export VERSION=${VERSION:-$(git rev-parse --short HEAD)}
export COMPOSE_PROJECT_NAME=myapp

# 拉取最新镜像
docker compose pull

# 构建应用镜像
docker compose build

# 停止旧容器
docker compose down

# 启动新容器
docker compose up -d

# 等待服务健康检查
echo "Waiting for services to be healthy..."
sleep 30

# 运行数据库迁移
docker compose exec web npm run migrate

# 清理旧镜像
docker image prune -f

echo "Deployment completed successfully!"
```

**效果**：实现多容器编排、自动重启、健康检查、资源限制等功能

**注意**：
- 生产环境应使用 secrets 管理敏感信息
- 配置日志轮转避免磁盘占满
- 定期备份数据卷
- 监控容器资源使用情况

---

## ⚙️ 核心配置模板

### 1. .dockerignore 文件模板

```dockerignore
# Node.js
node_modules
npm-debug.log
yarn-error.log

# Python
__pycache__
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# Git
.git
.gitignore

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# 测试
coverage
.nyc_output
*.test.js

# 文档
README.md
CHANGELOG.md
*.md

# 环境变量
.env
.env.local
.env.*.local

# 临时文件
*.log
tmp/
temp/
```

### 2. 多阶段构建模板

```dockerfile
# 构建阶段
FROM builder-image:tag AS builder

WORKDIR /build

# 安装构建依赖
COPY build-deps.json .
RUN install-build-deps.sh

# 复制源代码
COPY . .

# 构建应用
RUN build-application.sh

# 运行阶段
FROM runtime-image:tag AS runtime

# 安装运行时依赖
COPY runtime-deps.json .
RUN install-runtime-deps.sh

# 从构建阶段复制构建产物
COPY --from=builder /build/dist /app/dist

# 设置运行时用户
RUN adduser -D -u 1000 appuser
USER appuser

WORKDIR /app

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动命令
CMD ["start-application.sh"]
```

### 3. Docker Compose 生产环境模板

```yaml
version: '3.8'

services:
  app:
    image: ${REGISTRY}/${IMAGE}:${TAG}
    restart: unless-stopped
    environment:
      - ENV_VAR=${ENV_VALUE}
    env_file:
      - .env.production
    configs:
      - source: app_config
        target: /app/config.yml
    secrets:
      - source: db_password
        target: /app/secrets/db_password
    volumes:
      - app_data:/app/data
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      mode: replicated
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first
      rollback_config:
        parallelism: 0
        delay: 5s
        failure_action: pause
        order: stop-first

networks:
  app_network:
    driver: overlay
    attachable: true

volumes:
  app_data:
    driver: local

configs:
  app_config:
    file: ./config.yml

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 🚨 常见陷阱与解决方案

### 陷阱 1：频繁使用 latest 标签

**问题现象**：无法追踪镜像版本，可能导致不可预期的更新和破坏性变更

**根本原因**：latest 标签总是指向最新版本，无法确定当前使用的具体版本

**解决方案**：
```dockerfile
# 不推荐
FROM node:latest

# 推荐
FROM node:20.11.0-alpine

# 使用构建参数
ARG NODE_VERSION=20.11.0
FROM node:${NODE_VERSION}-alpine
```

**预防措施**：建立版本锁定机制，在 Dockerfile 和 docker-compose.yml 中明确指定版本号

---

### 陷阱 2：单个 RUN 包含多个操作

**问题现象**：破坏层缓存，每次都重新执行所有操作，构建时间长

**根本原因**：将变化频率不同的操作合并到同一个 RUN 指令中

**解决方案**：
```dockerfile
# 不推荐
RUN apt-get update && apt-get install -y git curl && \
    npm install && \
    npm run build

# 推荐：按变化频率分层
RUN apt-get update && \
    apt-get install -y --no-install-recommends git curl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
```

**预防措施**：将不常变化的操作放在前面，经常变化的操作放在后面

---

### 陷阱 3：Dockerfile 中包含敏感信息

**问题现象**：密钥、密码、API Token 等敏感信息被打包进镜像

**根本原因**：直接在 Dockerfile 中硬编码敏感信息，或复制包含敏感信息的文件

**解决方案**：
```dockerfile
# 不推荐
ENV API_KEY=sk-1234567890abcdef
ENV DATABASE_PASSWORD=mypassword

# 推荐：使用构建参数和运行时环境变量
ARG API_KEY
ENV API_KEY=${API_KEY}

# 在 docker-compose.yml 中定义
environment:
  - API_KEY_FILE=/run/secrets/api_key

# 使用 Docker secrets
secrets:
  api_key:
    file: ./secrets/api_key.txt
```

**预防措施**：
- 添加敏感文件到 .dockerignore
- 使用环境变量或 secrets 管理敏感信息
- 定期扫描镜像中的敏感信息

---

### 陷阱 4：忽视 .dockerignore 文件

**问题现象**：node_modules、.git 等大文件或敏感文件被复制到镜像中

**根本原因**：构建上下文包含所有文件，构建时复制了不必要的文件

**解决方案**：
```dockerignore
# 依赖目录
node_modules/
vendor/
__pycache__/

# 版本控制
.git/
.gitignore

# 文档
README.md
docs/

# 测试
*.test.js
coverage/

# 临时文件
*.log
tmp/
.env
```

**预防措施**：项目初始化时就配置好 .dockerignore 文件

---

### 陷阱 5：以 root 用户运行应用

**问题现象**：容器有完全的系统权限，安全风险高

**根本原因**：默认情况下容器以 root 用户运行

**解决方案**：
```dockerfile
# 创建非 root 用户
RUN addgroup -g 1001 -S appuser && \
    adduser -S -u 1001 -G appuser appuser

# 设置目录权限
RUN chown -R appuser:appuser /app

# 切换到非 root 用户
USER appuser

# 使用特定 UID
USER 1000:1000
```

**预防措施**：在 Dockerfile 中添加 USER 指令，使用非 root 用户运行应用

---

### 陷阱 6：未限制容器资源

**问题现象**：容器占用过多资源，影响其他容器或宿主机

**根本原因**：未设置 CPU、内存等资源限制

**解决方案**：
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M

# 或使用命令行
docker run -m 512m --cpus="1.0" myapp
```

**预防措施**：根据应用需求设置合理的资源限制

---

### 陷阱 7：日志文件无限增长

**问题现象**：容器日志文件占满磁盘空间

**根本原因**：未配置日志轮转策略

**解决方案**：
```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**预防措施**：配置日志驱动和日志轮转，定期清理旧日志

---

## 🔗 资源推荐

### 官方文档
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Build 最佳实践](https://docs.docker.com/build/building/best-practices/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Docker Hub](https://hub.docker.com/)

### 学习资源
- [Docker 教程](https://docs.docker.com/get-started/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker 安全指南](https://docs.docker.com/engine/security/)

### 工具推荐
- **镜像构建**：
  - [BuildKit](https://docs.docker.com/build/buildkit/) - 下一代构建工具
  - [Buildah](https://buildah.io/) - 无需守护进程的构建工具

- **镜像扫描**：
  - [Trivy](https://github.com/aquasecurity/trivy) - 全功能安全扫描器
  - [Snyk](https://snyk.io/) - 依赖漏洞扫描

- **镜像优化**：
  - [docker-slim](https://github.com/docker-slim/docker-slim) - 镜像优化工具
  - [dive](https://github.com/wagoodman/dive) - 镜像分析工具

- **监控工具**：
  - [cAdvisor](https://github.com/google/cadvisor) - 容器监控
  - [Portainer](https://www.portainer.io/) - Docker 管理界面

### 延伸阅读
- [Docker Security Best Practices](https://snyk.io/blog/10-docker-image-security-best-practices/)
- [Dockerfile Patterns](https://github.com/hexops/dockerfile)
- [Production-Ready Docker Compose](https://www.bunnyshell.com/blog/is-docker-compose-production-ready/)
