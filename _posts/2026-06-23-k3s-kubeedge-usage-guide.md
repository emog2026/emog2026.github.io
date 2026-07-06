---
title: K3s 与 KubeEdge 轻量级 Kubernetes 实战指南
date: 2026-06-23
tags:
  - K3s
  - KubeEdge
  - Kubernetes
  - 边缘计算
  - 容器编排
categories:
  - 云原生
  - 边缘计算
---

## 一、K3s 与 KubeEdge 概述

### 1.1 K3s 简介

K3s 是 Rancher 推出的轻量级 Kubernetes 发行版，专为资源受限环境设计。

**特点：**
- 二进制文件小于 100MB
- 支持 SQLite、MySQL、PostgreSQL 等数据库
- 完全兼容 Kubernetes API
- 适合 IoT、边缘计算场景
- 支持 ARM64 和 ARMv7

**适用场景：**
- 边缘计算节点
- IoT 设备管理
- CI/CD 环境
- 开发测试环境
- 资源受限的中小型集群

### 1.2 KubeEdge 简介

KubeEdge 是 CNCF 孵化项目，专门为边缘计算设计的 Kubernetes 扩展框架。

**特点：**
- 云边协同架构
- 支持离线运行
- 设备管理（Device Mapper）
- 轻量级边缘核心
- 支持 MQTT 协议

**适用场景：**
- 工业物联网
- 智能城市
- 车联网
- 视频监控
- 传感器网络

### 1.3 架构对比

```
K3s 架构：
┌─────────────┐
│   K3s API   │
│   Server    │
└─────────────┘
       │
    ┌──┴──┐
    │     │
┌───▼─┐ ┌─▼───┐
│Agent│ │Agent│ └─ 标准节点
└─────┘ └─────┘

KubeEdge 架构：
┌─────────────┐
│CloudHub     │
│(云端适配层) │
└─────────────┘
       │
    ╱  ╲
   ╱    ╲  WebSocket
  ╱      ╲
┌─▼───────▼─┐
│ EdgeCore  │
│(边缘核心) │
└───────────┘
    │  │  │
    └──┼──┘
      Device
```

## 二、K3s 安装与配置

### 2.1 系统要求

| 资源 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核 | 2 核+ |
| 内存 | 512MB | 1GB+ |
| 磁盘 | 1GB | 10GB+ |
| 操作系统 | Linux (主流发行版) | Ubuntu 20.04+ |

### 2.2 快速安装

#### 安装 Server 节点

```bash
# 在主节点执行
curl -sfL https://get.k3s.io | sh -

# 查看服务状态
systemctl status k3s

# 查看 token（用于添加 Agent 节点）
cat /var/lib/rancher/k3s/server/node-token
```

#### 安装 Agent 节点

```bash
# 在工作节点执行
curl -sfL https://get.k3s.io | K3S_URL=https://<server-ip>:6443 \
    K3S_TOKEN=<node-token> sh -

# 验证节点连接
kubectl get nodes
```

### 2.3 配置文件详解

创建配置文件 `/etc/rancher/k3s/config.yaml`：

```yaml
# Server 节点配置
cluster-cidr: 10.42.0.0/16          # Pod 网络段
service-cidr: 10.43.0.0/16          # Service 网络段
bind-address: 0.0.0.0                # API 监听地址
https-listen-port: 6443              # API 端口
tls-san:
  - "k3s.example.com"               # 额外 SAN 名称
  - "192.168.1.100"

# 数据库配置（默认使用 SQLite）
datastore-endpoint: "mysql://k3s:password@tcp(192.168.1.10:3306)/k3s"

# 网络插件（默认使用 Flannel，可选 Wireguard、Calico）
flannel-backend: "vxlan"            # vxlan, host-gw, wireguard

# 日志配置
log: /var/log/k3s.log
v: 4                                  # 日志级别

# 功能开关
disable:
  - "traefik"                        # 禁用 Traefik
  - "servicelb"                      # 禁用内置负载均衡
enable-features:
  - "IPv6"                           # 启用 IPv6 支持
```

### 2.4 常用操作

```bash
# 查看 K3s 版本
k3s --version

# 查看 Pod 运行情况
kubectl get pods -A

# 查看 K3s 系统服务
kubectl get pods -n kube-system

# 查看 Helm 部署的应用
kubectl get helmcharts -A

# 进入容器调试
kubectl exec -it <pod-name> -n <namespace> -- sh
```

### 2.5 卸载 K3s

```bash
# Server 节点卸载
/usr/local/bin/k3s-uninstall.sh

# Agent 节点卸载
/usr/local/bin/k3s-agent-uninstall.sh

# 完全清理
rm -rf /etc/rancher/k3s
rm -rf /var/lib/rancher/k3s
rm -rf /var/lib/kubelet
```

## 三、KubeEdge 安装与配置

### 3.1 系统要求

| 组件 | 配置要求 |
|------|----------|
| 云端 | Kubernetes 集群（v1.18+） |
| 边缘 | CPU ≥ 1 核，内存 ≥ 1GB |
| 网络 | 云端到边缘网络可达 |

### 3.2 架构组件

```
云端组件：
├── CloudHub      - WebSocket 连接器
├── CloudCore     - 云边协同控制器
└── EdgeController - 边缘节点管理

边缘端组件：
├── EdgeHub       - 云端通信代理
├── EdgeCore      - 边缘核心组件
├── MetaManager   - 元数据管理
├── EdgeMesh      - 边缘网络
└── DeviceTwin    - 设备数据同步
```

### 3.3 安装云端

#### 方法一：使用 keadm（推荐）

```bash
# 下载 keadm
wget https://github.com/kubeedge/kubeedge/releases/download/v1.17.0/keadm-v1.17.0-linux-amd64.tar.gz
tar -zxvf keadm-v1.17.0-linux-amd64.tar.gz
cd keadm-v1.17.0-linux-amd64
sudo cp keadm /usr/local/bin/

# 初始化云端
sudo keadm init \
    --kube-config=/root/.kube/config \
    --kubeedge-version=v1.17.0 \
    --advertise-address=<云端IP>

# 获取 token
sudo keadm gettoken
```

#### 方法二：使用 Helm

```bash
# 添加 KubeEdge Helm 仓库
helm repo add kubeedge https://kubeedge.github.io/kubeedge

# 安装云端
helm install kubeedge kubeedge/kubeedge \
    --namespace kubeedge \
    --create-namespace \
    --set cloudHub.ha.wd=true \
    --set cloudCore.modules.cloudHub.enable=true

# 查看安装状态
kubectl get pods -n kubeedge
```

### 3.4 安装边缘端

```bash
# 在边缘节点执行
sudo keadm join \
    --cloudcore-ipport=<云端IP>:10000 \
    --edgenode-name=<边缘节点名称> \
    --kubeedge-version=v1.17.0 \
    --token=<token>

# 如果边缘节点无法直接连接云端，使用中转
sudo keadm join \
    --cloudcore-ipport=<中转IP>:10000 \
    --edgenode-name=<边缘节点名称> \
    --kubeedge-version=v1.17.0 \
    --token=<token> \
    --cert-port=10002 \
    --tunnelport=10004
```

### 3.5 验证安装

```bash
# 在云端验证
kubectl get nodes

# 查看边缘节点详情
kubectl describe node <边缘节点名>

# 测试 Pod 调度到边缘
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx-edge
spec:
  nodeName: <边缘节点名>
  containers:
  - name: nginx
    image: nginx
EOF

# 查看 Pod 状态
kubectl get pods -o wide
```

## 四、KubeEdge 高级功能

### 4.1 设备管理（Device Mapper）

```bash
# 创建设备模型
cat > device-model.json <<EOF
{
  "apiVersion": "devices.kubeedge.io/v1beta1",
  "kind": "DeviceModel",
  "metadata": {
    "name": "sensor-model"
  },
  "spec": {
    "deviceType": "sensor",
    "properties": [
      {
        "name": "temperature",
        "dataType": "int",
        "description": "Temperature in Celsius"
      }
    ]
  }
}
EOF

kubectl apply -f device-model.json

# 创建设备实例
cat > device-instance.json <<EOF
{
  "apiVersion": "devices.kubeedge.io/v1beta1",
  "kind": "Device",
  "metadata": {
    "name": "sensor-01",
    "labels": {
      "model": "sensor-model"
    }
  },
  "spec": {
    "deviceModelRef": {
      "name": "sensor-model"
    },
    "nodeSelector": {
      "nodeSelectorTerms": [
        {
          "matchExpressions": [
            {
              "key": "node-role.kubernetes.io/edge",
              "operator": "Exists"
            }
          ]
        }
      ]
    }
  }
}
EOF

kubectl apply -f device-instance.json

# 查看设备
kubectl get devices
```

### 4.2 云边应用部署

```yaml
# deployment-edge.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: edge-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: edge-app
  template:
    metadata:
      labels:
        app: edge-app
    spec:
      nodeSelector:
        node-role.kubernetes.io/edge: ""
      containers:
      - name: app
        image: nginx:alpine
        resources:
          limits:
            memory: "128Mi"
            cpu: "100m"
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        hostPath:
          path: /var/edge-data
```

```bash
# 部署到边缘节点
kubectl apply -f deployment-edge.yaml

# 查看部署状态
kubectl get pods -o wide -l app=edge-app
```

### 4.3 边缘函数（EdgeX Foundry 集成）

```bash
# 部署 EdgeX Foundry
git clone https://github.com/edgexfoundry/edgex-compose.git
cd edgex-compose

# 使用 Docker Compose 部署到边缘节点
docker-compose -f docker-compose.yml up -d

# 验证服务
curl http://<边缘IP>:48080/api/v1/ping
```

### 4.4 边缘自治（离线运行）

```bash
# 在边缘端启动自治模式
sudo systemctl start edgecore

# 模拟网络断开
# 边缘节点继续运行已有应用

# 恢复网络后自动同步状态
# 查看同步状态
kubectl get pods -o wide
```

## 五、K3s 与 KubeEdge 对比

| 特性 | K3s | KubeEdge |
|------|-----|----------|
| 定位 | 轻量级 K8s 发行版 | 边缘计算扩展框架 |
| 部署难度 | 简单，一条命令安装 | 需要云端+边缘两步 |
| 离线能力 | 有限 | 完整支持边缘自治 |
| 设备管理 | 需要额外组件 | 内置 Device Mapper |
| 网络方案 | Flannel（默认） | EdgeMesh |
| 适用规模 | 小型集群（<50节点） | 大规模边缘（1000+节点） |
| 学习曲线 | 较低 | 较高 |

### 选择建议

**选择 K3s：**
- 需要标准 K8s 体验
- 资源受限的小型部署
- 快速原型验证
- IoT 网关场景

**选择 KubeEdge：**
- 大规模边缘节点管理
- 需要设备管理能力
- 网络不稳定环境
- 工业物联网场景

**组合使用：**
- K3s 作为边缘端轻量 K8s
- KubeEdge 作为云边协同层
- 分层架构降低复杂度

## 六、实战案例

### 6.1 使用 K3s 部署轻量应用

```bash
# 部署 Nginx
kubectl create deployment nginx --image=nginx

# 暴露服务
kubectl expose deployment nginx --port=80 --type=NodePort

# 查看服务
kubectl get svc
curl http://<node-ip>:<nodeport>
```

### 6.2 使用 KubeEdge 构建物联网平台

```bash
# 1. 部署云端
sudo keadm init --advertise-address=192.168.1.100

# 2. 在多个边缘节点安装
for node in edge1 edge2 edge3; do
    ssh $node "keadm join --cloudcore-ipport=192.168.1.100:10000 \
        --edgenode-name=$node --token=\$(keadm gettoken)"
done

# 3. 创建设备模型
kubectl apply -f - <<EOF
apiVersion: devices.kubeedge.io/v1beta1
kind: DeviceModel
metadata:
  name: smart-sensor
spec:
  deviceType: "sensor"
  properties:
  - name: "data"
    dataType: "string"
EOF

# 4. 部署边缘应用
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iot-gateway
spec:
  replicas: 3
  template:
    spec:
      nodeSelector:
        node-role.kubernetes.io/edge: ""
      containers:
      - name: mqtt
        image: eclipse-mosquitto:2.0
        ports:
        - containerPort: 1883
      - name: collector
        image: iot-data-collector:latest
        env:
        - name: MQTT_BROKER
          value: "localhost:1883"
EOF
```

### 6.3 监控与日志

```bash
# K3s 部署 Prometheus
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# KubeEdge 部署监控
kubectl apply -f https://raw.githubusercontent.com/kubeedge/kubeedge/master/build/cloud/edge-metrics-service.yaml

# 查看 EdgeCore 状态
kubectl -n kubeedge get cm -o yaml edge-metrics
```

## 七、故障排查

### 7.1 K3s 常见问题

**问题：节点 NotReady**

```bash
# 检查服务状态
systemctl status k3s

# 查看日志
journalctl -u k3s -f

# 重启服务
systemctl restart k3s
```

**问题：Pod 无法拉取镜像**

```bash
# 配置镜像加速
sudo mkdir -p /etc/rancher/k3s
cat <<EOF | sudo tee /etc/rancher/k3s/registries.yaml
mirrors:
  docker.io:
    endpoint:
      - "https://docker.mirrors.ustc.edu.cn"
EOF

sudo systemctl restart k3s
```

### 7.2 KubeEdge 常见问题

**问题：边缘节点连接失败**

```bash
# 检查云端服务
kubectl get pods -n kubeedge

# 检查边缘日志
journalctl -u edgecore -f

# 重新加入边缘节点
sudo keadm reset
sudo keadm join --cloudcore-ipport=<云端IP>:10000 \
    --edgenode-name=<节点名> --token=<token>
```

**问题：设备数据不同步**

```bash
# 检查 DeviceTwin 状态
kubectl get devices -o wide

# 查看设备事件
kubectl get events --field-selector involvedObject.kind=Device
```

## 八、最佳实践

### 8.1 安全配置

```yaml
# K3s 启用 RBAC
# /etc/rancher/k3s/config.yaml
---
disable:
  - "servicelb"
tls-san:
  - "k3s.internal"

# 创建用户
kubectl create serviceaccount developer
kubectl create rolebinding developer-binding \
    --clusterrole=edit \
    --serviceaccount=default:developer \
    --user=developer@example.com
```

```bash
# KubeEdge 启用证书认证
sudo keadm init --set=cloudCore.modules.dynamicController.enable=true

# 配置边缘证书
sudo vim /etc/kubeedge/config.yaml
# 修改：
#   token: <your-token>
#   hostnameOverride: <edge-node-name>
```

### 8.2 性能优化

```bash
# K3s 资源限制
kubectl patch deployment app -n default -p '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "app",
          "resources": {
            "limits": {"cpu": "500m", "memory": "512Mi"},
            "requests": {"cpu": "100m", "memory": "128Mi"}
          }
        }]
      }
    }
  }
}'

# KubeEdge 边缘优化
# /etc/kubeedge/config/edgecore.yaml
modules:
  edgeMesh:
    enable: false    # 轻量级环境关闭
  eventBus:
    mqttMode: 0      # 使用内存模式
```

### 8.3 高可用部署

```bash
# K3s 高可用
# MySQL 数据库
mysql -u root -p
CREATE DATABASE k3s;
CREATE USER 'k3s'@'%' IDENTIFIED BY 'password';
GRANT ALL ON k3s.* TO 'k3s'@'%';

# Server 节点配置
cat <<EOF | tee /etc/rancher/k3s/config.yaml
datastore-endpoint: "mysql://k3s:password@tcp(mysql.example.com:3306)/k3s"
tls-san:
  - "k3s-1.example.com"
  - "k3s-2.example.com"
  - "192.168.1.100"
cluster-init: true
server: https://192.168.1.100:6443
token: " SECRET_TOKEN "
EOF
```

## 九、升级维护

### 9.1 K3s 升级

```bash
# 在线升级
curl -sfL https://get.k3s.io | INSTALL_K3S_CHANNEL=stable sh -

# 指定版本
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=v1.27.3+k3s1 sh -

# 验证升级
k3s --version
kubectl get nodes
```

### 9.2 KubeEdge 升级

```bash
# 升级云端
helm upgrade kubeedge kubeedge/kubeedge \
    --namespace kubeedge \
    --set cloudCore.version=v1.18.0

# 升级边缘
sudo keadm upgrade \
    --kubeedge-version=v1.18.0 \
    --from-version=v1.17.0

# 验证
kubectl get nodes
edgecore --version
```

## 十、学习资源

- K3s 官网：https://k3s.io/
- KubeEdge 官网：https://kubeedge.io/
- K3s GitHub：https://github.com/k3s-io/k3s
- KubeEdge GitHub：https://github.com/kubeedge/kubeedge
- 边缘计算白皮书：CNCF Edge WG

## 总结

K3s 和 KubeEdge 各有所长，选择时应考虑：

1. **K3s** - 简单易用的轻量级 Kubernetes，适合快速部署和资源受限场景
2. **KubeEdge** - 专业的边缘计算框架，适合大规模云边协同场景
3. **组合使用** - 发挥各自优势，构建完整的边缘计算解决方案

通过本文的实战步骤，你可以快速搭建自己的轻量级 Kubernetes 或边缘计算平台。
