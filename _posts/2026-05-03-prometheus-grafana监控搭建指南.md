---
layout: post
title: "Prometheus + Grafana 监控搭建指南：可视化的系统监控方案"
date: 2026-05-03
tags: [DevOps, 监控, Prometheus, Grafana, 可观测性]
header-style: 'text'
subtitle: "开源监控利器，实时监控服务器、应用、容器状态"
---

## 📌 一句话总结
Prometheus 负责数据采集和存储，Grafana 负责可视化展示，两者组合是业界最流行的开源监控解决方案。

## 🎯 它是做什么的？

这套监控方案就像是一个"智能仪表盘"：

- **数据采集**：自动收集服务器、应用、容器的性能指标
- **实时监控**：秒级更新，及时发现问题
- **告警通知**：异常时自动发送告警（邮件、钉钉、Slack）
- **可视化展示**：美观的图表，一目了然

## 🔑 核心概念

**Prometheus（数据采集引擎）**
- 专业说：开源的时间序列数据库和监控告警系统
- 通俗说：数据采集器，定期从各个目标收集数据

**Exporter（数据导出器）**
- 专业说：将各种指标转换为 Prometheus 格式的中间件
- 通俗说：翻译官，把不同系统的数据"翻译"成 Prometheus 能听懂的语言

**Grafana（可视化平台）**
- 专业说：开源的分析和可视化平台
- 通俗说：画画板，把数据变成好看的图表

**Alertmanager（告警管理器）**
- 专业说：处理告警的去重、分组、路由
- 通俗说：传话筒，把告警信息发送给对的人

## 💡 快速搭建

### 使用 Docker Compose 一键部署

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
```

### Prometheus 配置文件

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# 告警规则文件
rule_files:
  - "alert_rules.yml"

# 监控目标配置
scrape_configs:
  # Prometheus 自身监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # 节点监控
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
        labels:
          instance: 'server-1'

  # Docker 容器监控
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']

  # 应用监控
  - job_name: 'myapp'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app:8080']
        labels:
          environment: 'production'

# 告警管理器配置
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

### 告警规则示例

```yaml
# alert_rules.yml
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # CPU 使用率告警
      - alert: HighCPUUsage
        expr: (100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for 5 minutes on {{ $labels.instance }}"

      # 内存使用率告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for 5 minutes on {{ $labels.instance }}"

      # 磁盘空间告警
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space low"
          description: "Disk space is less than 15% on {{ $labels.instance }}"

      # 服务宕机告警
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.job }} on {{ $labels.instance }} is down"
```

## 🎨 Grafana 仪表盘配置

### 添加 Prometheus 数据源

1. 登录 Grafana（默认：admin/admin）
2. Configuration → Data Sources → Add data source
3. 选择 Prometheus
4. 配置 URL：`http://prometheus:9090`
5. 点击 "Save & Test"

### 导入现成的仪表盘

访问 Grafana 官方仪表盘市场：
- [Node Exporter Full](https://grafana.com/grafana/dashboards/1860)
- [Docker and system monitoring](https://grafana.com/grafana/dashboards/179)
- [Prometheus 2.0 Overview](https://grafana.com/grafana/dashboards/3662)

导入步骤：
1. Dashboards → Import
2. 输入仪表盘 ID 或上传 JSON 文件
3. 选择 Prometheus 数据源
4. 点击 Import

### 自定义仪表盘查询示例

```promql
# CPU 使用率
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 内存使用率
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 磁盘使用率
(1 - (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"} / node_filesystem_size_bytes)) * 100

# 网络流量
irate(node_network_receive_bytes_total{device!="lo"}[5m])
irate(node_network_transmit_bytes_total{device!="lo"}[5m])

# 磁盘 I/O
irate(node_disk_io_time_seconds_total[5m])
```

## 🚀 高级功能

### 监控 Docker 容器

```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped
```

### 监控 MySQL 数据库

```yaml
services:
  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    environment:
      - DATA_SOURCE_NAME=root:password@(mysql:3306)/
    ports:
      - "9104:9104"
    restart: unless-stopped
```

### 告警通知配置

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

# 路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'critical'

# 接收者配置
receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://localhost:5001/webhook'

  - name: 'critical'
    email_configs:
      - to: 'alert@example.com'
        from: 'prometheus@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alert@example.com'
        auth_password: 'password'
```

## 📊 常用指标查询

```promql
# 查询所有存活的目标
up

# 查询 HTTP 请求速率
rate(http_requests_total[5m])

# 查询 API 响应时间
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# 查询错误率
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# 查询容器资源使用
rate(container_cpu_usage_seconds_total{name!=""}[5m])
container_memory_usage_bytes{name!=""}
```

## ⚠️ 注意事项

- **数据保留**：Prometheus 默认保留 15 天数据，可根据需要调整
- **性能优化**：采集目标不要太多，建议不超过 1000 个
- **存储空间**：预留足够的磁盘空间用于存储时序数据
- **高可用**：生产环境建议使用 Thanos 或 Cortex 实现高可用
- **安全性**：不要暴露 Prometheus 和 Grafana 到公网

## 🔗 相关资源

- [Prometheus 官方文档](https://prometheus.io/docs/)
- [Grafana 官方文档](https://grafana.com/docs/)
- [Exporters 列表](https://prometheus.io/docs/instrumenting/exporters/)
- [Grafana 仪表盘市场](https://grafana.com/grafana/dashboards/)

---

> 💡 **提示**：完善的监控是 DevOps 的眼睛，能帮你快速发现和定位问题！
