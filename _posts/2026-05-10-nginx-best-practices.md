---
title: "Nginx 最佳实践指南"
date: 2026-05-10
tags: [nginx, web服务器, 反向代理, 负载均衡, 性能优化]
category: 技术指南
description: "一份全面的 Nginx 实战指南，涵盖反向代理、负载均衡、性能优化和安全加固的完整配置方案"
---

## 📌 技术概述

Nginx 是一款轻量级的 Web 服务器、反向代理服务器及电子邮件（IMAP/POP3）代理服务器，以其高性能、低内存占用和稳定性而闻名。Nginx 采用事件驱动、异步非阻塞处理架构，使其能够高效处理大量并发连接，广泛应用于负载均衡、反向代理、静态资源服务和 HTTP 缓存等场景。

**主要应用场景**：
- 反向代理和负载均衡
- 静态资源服务
- HTTP 缓存加速
- SSL/TLS 终止
- API 网关

---

## 🎯 核心概念

### 1. 反向代理（Reverse Proxy）
- **专业解释**：以代理服务器来接受 internet 上的连接请求，然后将请求转发给内部网络上的服务器，并将从服务器上得到的结果返回给客户端
- **通俗类比**：像餐厅的前台服务员，顾客（客户端）只和前台交互，前台负责将订单转给后厨（后端服务器），并将做好的菜端给顾客
- **核心价值**：隐藏后端服务器、负载均衡、SSL 终止、统一入口

### 2. 负载均衡（Load Balancing）
- **专业解释**：将网络流量分配到多个后端服务器的技术，提高应用可用性和响应速度
- **通俗类比**：像银行柜台有多个窗口，排队系统将客户分配到不同窗口办理业务，避免单个窗口过载
- **核心价值**：提高系统容量、故障自动转移、优化资源利用

### 3. 事件驱动架构
- **专业解释**：使用 epoll/kqueue 等I/O多路复用技术，单个进程可处理数万并发连接
- **通俗类比**：像一位经验丰富的侍者可以同时照看多桌顾客，而不是每桌配一个专职侍者
- **核心价值**：低内存占用、高并发处理能力、CPU 友好

---

## 🔧 软件安装与配置

### 安装方法

**1. 包管理器安装（推荐）**

Ubuntu/Debian:
```bash
# 安装主线版本（推荐）
sudo apt install -y curl gnupg2 ca-certificates lsb-release
echo "deb http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" \
    | sudo tee /etc/apt/sources.list.d/nginx.list
curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo apt-key add -
sudo apt update
sudo apt install -y nginx
```

CentOS/RHEL:
```bash
# 安装主线版本
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://nginx.org/packages/mainline/centos/8/nginx.repo
sudo yum install -y nginx
```

**2. Docker 安装**
```bash
# 拉取官方镜像
docker pull nginx:alpine

# 运行容器
docker run --name my-nginx \
  -p 80:80 -p 443:443 \
  -v /path/to/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /path/to/conf.d:/etc/nginx/conf.d:ro \
  -v /path/to/html:/usr/share/nginx/html:ro \
  -d nginx:alpine
```

**3. 源码编译**
```bash
# 下载源码
wget http://nginx.org/download/nginx-1.25.1.tar.gz
tar -zxvf nginx-1.25.1.tar.gz
cd nginx-1.25.1

# 配置编译选项
./configure \
  --prefix=/etc/nginx \
  --sbin-path=/usr/sbin/nginx \
  --conf-path=/etc/nginx/nginx.conf \
  --error-log-path=/var/log/nginx/error.log \
  --http-log-path=/var/log/nginx/access.log \
  --pid-path=/var/run/nginx.pid \
  --lock-path=/var/run/nginx.lock \
  --with-http_ssl_module \
  --with-http_v2_module \
  --with-http_gzip_static_module

# 编译安装
make
sudo make install
```

### 基础配置

**配置文件位置**：
- 主配置：`/etc/nginx/nginx.conf`
- 虚拟主机：`/etc/nginx/conf.d/*.conf`
- 默认站点：`/usr/share/nginx/html`

**基础配置示例**：
```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 10240;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    server_tokens off;

    include /etc/nginx/conf.d/*.conf;
}
```

### 启动与验证

**systemd 管理**：
```bash
# 启动服务
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx

# 查看版本
nginx -v

# 测试配置文件
sudo nginx -t
```

**验证安装**：
```bash
# 检查服务是否运行
sudo systemctl is-active nginx

# 检查端口监听
sudo netstat -tlnp | grep nginx

# 测试访问
curl http://localhost

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 常用管理命令

```bash
# 平滑重载配置（推荐）
sudo nginx -s reload

# 快速停止服务
sudo nginx -s stop

# 优雅停止服务
sudo nginx -s quit

# 重新打开日志文件
sudo nginx -s reopen

# 查看运行时信息
ps aux | grep nginx

# 查看连接数
sudo netstat -an | grep :80 | wc -l

# 杀死所有 Nginx 进程
sudo pkill -9 nginx
```

---

## 🔨 后期维护指南

### 日志查看与分析

**实时查看日志**：
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log

# 同时查看两个日志
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

**日志分析**：
```bash
# 统计访问量最高的IP
sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计访问最多的URL
sudo awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 统计HTTP状态码
sudo awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 查找404错误
sudo grep " 404 " /var/log/nginx/access.log

# 统计响应时间大于3秒的请求
sudo awk '($NF > 3){print $7, $NF}' /var/log/nginx/access.log
```

### 性能监控

**系统监控**：
```bash
# 查看Nginx进程资源使用
top -p $(pgrep nginx | head -1)

# 查看连接数统计
sudo netstat -an | grep :80 | awk '{print $6}' | sort | uniq -c | sort -rn

# 查看当前连接数
sudo ss -ant | grep :80 | wc -l

# 查看每个IP的连接数
sudo netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -20
```

**启用状态监控模块**：
```nginx
# 在 server 块中添加
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

访问 `http://localhost/nginx_status` 查看状态：
```
Active connections: 24
server accepts handled requests
 12345 12345 123456
Reading: 0 Writing: 2 Waiting: 22
```

### 备份策略

**配置文件备份**：
```bash
# 创建备份目录
sudo mkdir -p /backup/nginx

# 备份配置文件
sudo tar -czf /backup/nginx/nginx-conf-$(date +%Y%m%d).tar.gz \
  /etc/nginx/nginx.conf \
  /etc/nginx/conf.d/ \
  /etc/nginx/mime.types

# 保留最近30天的备份
sudo find /backup/nginx -name "nginx-conf-*.tar.gz" -mtime +30 -delete
```

**自动备份脚本** (`/usr/local/bin/backup-nginx.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backup/nginx"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份文件名
BACKUP_FILE="$BACKUP_DIR/nginx-full-$(date +%Y%m%d-%H%M%S).tar.gz"

# 执行备份
tar -czf $BACKUP_FILE \
  /etc/nginx/ \
  /var/log/nginx/ \
  /usr/share/nginx/html/

# 删除旧备份
find $BACKUP_DIR -name "nginx-full-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
```

设置定时任务：
```bash
# 编辑 crontab
sudo crontab -e

# 每天凌晨2点执行备份
0 2 * * * /usr/local/bin/backup-nginx.sh >> /var/log/nginx-backup.log 2>&1
```

### 更新升级流程

**检查更新**：
```bash
# Ubuntu/Debian
sudo apt update
apt list --upgradable | grep nginx

# CentOS/RHEL
sudo yum check-update nginx
```

**更新流程**：
```bash
# 1. 备份当前配置
sudo cp -r /etc/nginx /etc/nginx.backup

# 2. 测试新版本配置
sudo apt install --only-upgrade nginx

# 3. 测试配置文件
sudo nginx -t

# 4. 如果测试通过，平滑重载
sudo nginx -s reload

# 5. 验证服务正常
sudo systemctl status nginx
curl http://localhost
```

**回滚方案**：
```bash
# 如果更新后出现问题，回滚配置
sudo systemctl stop nginx
sudo rm -rf /etc/nginx
sudo mv /etc/nginx.backup /etc/nginx
sudo systemctl start nginx
```

### 常见问题排查

**问题1：服务无法启动**
```bash
# 检查配置文件语法
sudo nginx -t

# 检查端口占用
sudo netstat -tlnp | grep :80

# 查看系统日志
sudo journalctl -u nginx -n 50
```

**问题2：502 Bad Gateway**
```bash
# 检查后端服务状态
curl http://localhost:8080

# 检查 upstream 配置
sudo grep -A 10 "upstream" /etc/nginx/conf.d/*.conf

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

**问题3：静态资源404**
```bash
# 检查文件路径
ls -la /usr/share/nginx/html/

# 检查文件权限
sudo chown -R nginx:nginx /usr/share/nginx/html/

# 检查 SELinux 状态
sudo getenforce

# 如果需要，临时关闭 SELinux 测试
sudo setenforce 0
```

**问题4：性能下降**
```bash
# 查看当前连接数
sudo ss -ant | grep :80 | wc -l

# 检查工作进程数
ps aux | grep nginx

# 查看系统资源
top
free -h
iostat -x 1

# 启用访问日志分析
sudo awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

### 定期维护任务

**每日检查**：
- 检查错误日志是否有异常
- 监控服务器资源使用情况
- 检查 SSL 证书有效期

**每周任务**：
- 分析访问日志，优化配置
- 检查更新和安全公告
- 清理过期日志文件

**每月任务**：
- 完整备份配置和数据
- 性能测试和调优
- 审查安全配置

---

## 💡 实战场景

### 场景 1：HTTP 反向代理配置

**需求**：将域名 `www.example.com` 的请求代理到后端服务器（127.0.0.1:8080），实现前后端分离架构

**方案**：使用 upstream 配置后端服务器组，通过 location 块配置代理规则

**实现**：
```nginx
# 定义后端服务器组
upstream backend_server {
    server 127.0.0.1:8080;
    # 可以添加多个服务器实现负载均衡
    # server 127.0.0.1:8081;
    # server 127.0.0.1:8082;
}

server {
    # 监听80端口
    listen 80;
    server_name www.example.com;

    # 字符编码
    charset utf-8;

    # 反向代理配置
    location / {
        proxy_pass http://backend_server;
        
        # 设置代理请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲区设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # 静态文件直接由 nginx 处理
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**效果**：用户访问 www.example.com 时，Nginx 将动态请求转发到后端服务器，静态资源直接由 Nginx 返回，提升整体性能

**注意**：
- 后端服务器需要正确处理 X-Forwarded-For 头获取真实客户端 IP
- 静态资源路径需要与实际目录结构匹配
- 生产环境建议配置多个后端服务器实现高可用

---

### 场景 2：HTTPS 安全配置

**需求**：为网站启用 HTTPS 加密，使用 TLS 1.2+ 协议，确保传输安全

**方案**：配置 SSL 证书，启用现代加密协议和安全的加密套件

**实现**：
```nginx
server {
    # 监听443端口，启用SSL和HTTP/2
    listen 443 ssl http2;
    server_name www.example.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 协议配置（仅支持安全的 TLS 1.2 和 1.3）
    ssl_protocols TLSv1.2 TLSv1.3;

    # 安全的加密套件
    ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
    ssl_prefer_server_ciphers on;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # 安全头设置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 反向代理配置
    location / {
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP 自动跳转到 HTTPS
server {
    listen 80;
    server_name www.example.com;
    return 301 https://$server_name$request_uri;
}
```

**效果**：所有 HTTP 请求自动跳转到 HTTPS，使用现代加密协议保护数据传输安全

**注意**：
- SSL 证书需要从受信任的 CA 机构申请（推荐使用 Let's Encrypt 免费证书）
- 推荐使用 ECC 证书代替 RSA 证书，性能更好
- 定期更新 SSL 配置以应对新的安全威胁

---

### 场景 3：负载均衡配置

**需求**：将请求分发到三台后端服务器（192.168.1.11:80、192.168.1.12:80、192.168.1.13:80），实现高可用和负载分担

**方案**：使用 upstream 配置服务器组，采用加权轮询策略

**实现**：
```nginx
http {
    # 定义负载均衡服务器组
    upstream load_balance_server {
        # 加权轮询：weight 越高，分配到的请求越多
        server 192.168.1.11:80 weight=5;
        server 192.168.1.12:80 weight=3;
        server 192.168.1.13:80 weight=2;
        
        # 备用服务器（当主服务器都不可用时启用）
        # server 192.168.1.14:80 backup;
        
        # 健康检查相关参数
        # max_fails=3: 3次失败后标记为不可用
        # fail_timeout=30s: 30秒后重新尝试
        server 192.168.1.15:80 max_fails=3 fail_timeout=30s;
        
        # 保持连接配置
        keepalive 32;
        keepalive_timeout 60s;
    }

    server {
        listen 80;
        server_name www.example.com;

        location / {
            proxy_pass http://load_balance_server;
            
            # HTTP/1.1 协议支持 keepalive
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            
            # 代理头设置
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
```

**负载均衡策略**：

1. **轮询（默认）**
```nginx
upstream backend {
    server 192.168.1.11:80;
    server 192.168.1.12:80;
}
```

2. **加权轮询**
```nginx
upstream backend {
    server 192.168.1.11:80 weight=3;
    server 192.168.1.12:80 weight=1;
}
```

3. **最少连接**
```nginx
upstream backend {
    least_conn;
    server 192.168.1.11:80;
    server 192.168.1.12:80;
}
```

4. **IP Hash**
```nginx
upstream backend {
    ip_hash;
    server 192.168.1.11:80;
    server 192.168.1.12:80;
}
```

**效果**：请求根据配置的策略分发到不同后端服务器，提高系统整体容量和可用性

**注意**：
- 使用 IP Hash 策略时，添加或删除服务器会导致会话重新分配
- 加权轮询适合服务器性能不等的场景
- 生产环境建议配合健康检查使用

---

### 场景 4：静态站点优化配置

**需求**：部署高性能静态资源站点，启用 gzip 压缩和缓存控制

**方案**：配置 sendfile、tcp_nopush、gzip 等优化参数

**实现**：
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 10240;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main buffer=32k flush=5s;
    error_log /var/log/nginx/error.log warn;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # 隐藏版本信息
    server_tokens off;

    server {
        listen 80;
        server_name static.example.com;
        root /var/www/static;
        index index.html;

        # 字符编码
        charset utf-8;

        # 缓存控制
        location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        location ~* \.(css|js)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        location ~* \.(woff|woff2|ttf|eot|otf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Access-Control-Allow-Origin *;
            access_log off;
        }

        # HTML 文件不缓存
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, must-revalidate";
        }

        # 禁止访问隐藏文件
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
```

**效果**：静态资源启用长期缓存和 gzip 压缩，大幅提升加载速度，减少带宽消耗

**注意**：
- 文件更新后需要修改文件名（版本号）来强制客户端重新下载
- access_log off 可以减少磁盘 I/O，但会失去访问统计
- 图片文件已经压缩过，不需要再次 gzip 压缩

---

## ⚙️ 核心配置模板

### 1. 基础优化配置（/etc/nginx/nginx.conf）

```nginx
# 运行用户
user nginx;

# 工作进程数（auto = CPU 核心数）
worker_processes auto;
worker_rlimit_nofile 65535;

# 错误日志
error_log /var/log/nginx/error.log warn;

# PID 文件
pid /var/run/nginx.pid;

events {
    # 每个工作进程的最大连接数
    worker_connections 10240;
    use epoll;
    multi_accept on;
}

http {
    # MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志（带缓冲）
    access_log /var/log/nginx/access.log main buffer=32k flush=5s;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # 包含其他配置文件
    include /etc/nginx/conf.d/*.conf;
}
```

### 2. 反向代理配置（/etc/nginx/conf.d/proxy.conf）

```nginx
upstream backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 3. HTTPS 配置模板（/etc/nginx/conf.d/https.conf）

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    location / {
        # 你的配置
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🚨 常见陷阱与解决方案

### 陷阱 1：worker_processes 设置不当

**问题现象**：CPU 使用率低，但处理大量请求时性能瓶颈明显

**根本原因**：worker_processes 设置为 1，未能充分利用多核 CPU

**解决方案**：
```nginx
# 根据CPU核心数设置
worker_processes auto;  # 自动检测CPU核心数
# 或明确指定
worker_processes 4;  # 4核CPU
```

**预防措施**：使用 `auto` 参数让 Nginx 自动检测 CPU 核心数

---

### 陷阱 2：worker_connections 设置过小

**问题现象**：高并发时出现 "worker_connections are not enough" 错误

**根本原因**：worker_connections 默认值 512 对高并发场景太小

**解决方案**：
```nginx
events {
    worker_connections 10240;  # 提高连接数限制
}
```

**计算公式**：`最大并发连接数 = worker_processes × worker_connections`

---

### 陷阱 3：未启用 keepalive 连接

**问题现象**：后端服务器连接数过高，TIME_WAIT 连接多

**根本原因**：每次请求都创建新连接，TCP 开销大

**解决方案**：
```nginx
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;  # 保持32个空闲连接
    keepalive_timeout 60s;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

---

### 陷阱 4：缓冲区设置不当导致磁盘 I/O

**问题现象**：代理响应时出现临时文件写入，性能下降

**根本原因**：proxy_buffers 设置过小，大响应被写入磁盘

**解决方案**：
```nginx
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

**注意**：增大缓冲区会增加内存使用，需要权衡

---

### 陷阱 5：未限制客户端请求速率

**问题现象**：遭受 DDoS 攻击或恶意爬虫导致服务不可用

**根本原因**：未配置请求速率限制

**解决方案**：
```nginx
http {
    # 定义限流区域
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    
    server {
        # 限制并发连接数
        limit_conn addr 10;
        
        # 限制请求速率（burst=20 允许突发）
        limit_req zone=one burst=20 nodelay;
        
        # 限制响应速率
        limit_rate_after 10m;
        limit_rate 1m;
    }
}
```

---

### 陷阱 6：SSL 配置不安全

**问题现象**：SSL Labs 评分低，使用已弃用的加密协议

**根本原因**：使用旧版 SSL 协议和弱加密套件

**解决方案**：
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
ssl_prefer_server_ciphers on;
```

---

## 🛡️ 安全加固配置

### 1. 隐藏版本信息

```nginx
http {
    server_tokens off;
}
```

### 2. 禁止直接通过 IP 访问

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    return 444;
}
```

### 3. 限制请求方法

```nginx
if ($request_method !~ ^(GET|HEAD|POST)$ ) {
    return 405;
}
```

### 4. 防止目录遍历

```nginx
location ~ /\.(svn|git|hg) {
    deny all;
    access_log off;
    log_not_found off;
}
```

### 5. 限制请求体大小

```nginx
client_max_body_size 10m;
client_body_buffer_size 128k;
```

---

## 🔧 性能调优参数

### Linux 系统参数优化（/etc/sysctl.conf）

```bash
# 增加系统文件描述符限制
fs.file-max = 2097152

# 增加连接队列
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535

# 优化 TCP 连接
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30

# 增加 TCP 读写缓冲区
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
```

### Nginx 配置优化

```nginx
# 工作进程数
worker_processes auto;

# 每个进程的最大连接数
worker_connections 10240;

# 启用 epoll（Linux）
use epoll;

# 启用 sendfile
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# 保持连接
keepalive_timeout 65;
keepalive_requests 100;
```

---

## 📊 监控和日志

### 1. 访问日志格式

```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                '$request_time $upstream_response_time';

log_format detailed '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time $upstream_response_time '
                   '$upstream_addr $upstream_status '
                   '$upstream_response_time $upstream_connect_time';
```

### 2. 状态监控模块

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### 3. 日志缓冲

```nginx
access_log /var/log/nginx/access.log main buffer=32k flush=5s;
```

---

## 🔗 资源推荐

### 官方文档
- [Nginx 官方文档](http://nginx.org/en/docs/)
- [Nginx 官方博客](https://blog.nginx.org/)
- [Nginx 性能调优指南](https://www.nginx.com/blog/tuning-nginx/)

### 配置生成工具
- [nginxconfig.io](https://nginxconfig.io/) - 在线 Nginx 配置生成器

### 学习资源
- [dunwu/nginx-tutorial](https://github.com/dunwu/nginx-tutorial) - Nginx 极简教程
- [Nginx Cookbook](https://www.nginx.com/resources/library/nginx-cookbook/) - 官方 cookbook

### 安全相关
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/) - SSL 配置生成器
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL 配置测试工具

### 推荐工具
- `nginx -t` - 测试配置文件语法
- `nginx -s reload` - 平滑重载配置
- `nginx -s stop` - 快速停止 Nginx
- `systemctl status nginx` - 查看 Nginx 运行状态
- `journalctl -u nginx -f` - 查看 Nginx 日志

### 延伸阅读
- F5 Networks: [Tuning NGINX for Performance](https://www.f5.com/company/blog/nginx/tuning-nginx)
- NGINX Plus: [Performance Tuning Tips & Tricks](https://blog.nginx.org/blog/performance-tuning-tips-tricks)
- YuFanOnSoftware: [NGINX 配置最佳实践](https://yufanonsoftware.me/posts/nginx-configuration-best-practice.html)

---

## 📝 总结

本指南涵盖了 Nginx 的核心概念、实战场景、配置模板、常见陷阱和性能优化等方面。在实际应用中，请根据具体需求和环境选择合适的配置方案，并定期更新和优化配置。

**关键要点**：
1. 使用主线版本（mainline）获取最新特性和安全修复
2. 根据硬件配置合理设置 worker_processes 和 worker_connections
3. 启用 HTTP/2 和 keepalive 连接提升性能
4. 配置 SSL/TLS 时使用现代协议和安全的加密套件
5. 实施安全加固措施（隐藏版本、限流、访问控制等）
6. 启用 gzip 压缩和缓存控制优化静态资源
7. 配置日志缓冲和监控便于问题排查
8. 定期测试配置文件语法并平滑重载配置
