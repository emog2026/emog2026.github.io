---
title: Kubernetes 网络：CNI、负载均衡与 Ingress 完全指南
date: 2026-06-23
tags:
  - Kubernetes
  - CNI
  - 负载均衡
  - Ingress
  - 网络架构
categories:
  - Kubernetes
  - 云原生
  - 网络技术
---

## 一、Kubernetes 网络概述

### 1.1 网络架构层次

```
┌─────────────────────────────────────────────────────────┐
│                    外部流量                               │
│                  (Internet/用户)                          │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                   Ingress Controller                      │
│              (Nginx/Traefik/HAProxy/APISIX)               │
│              七层路由、SSL、认证、限流                       │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                     Service                               │
│              (ClusterIP/NodePort/LoadBalancer)            │
│              四层负载均衡、服务发现                          │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                      Pods                                 │
│               (容器网络、Pod间通信)                         │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                    CNI Plugin                             │
│          (Calico/Flannel/Cilium/Weave-Net)                │
│              网络配置、IP分配、路由策略                       │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                   Node Network                            │
│              (宿主机网络、底层网络设备)                      │
└───────────────────────────────────────────────────────────┘
```

### 1.2 核心概念对比

| 组件 | 网络层 | 作用 | 典型实现 |
|------|--------|------|----------|
| CNI | L2/L3 | Pod 网络、IP 分配、网络策略 | Calico、Flannel、Cilium |
| Service | L4 | 服务发现、负载均衡 | kube-proxy、IPVS |
| Ingress | L7 | HTTP 路由、SSL 终止 | Nginx Ingress、Traefik |

## 二、CNI 插件详解

### 2.1 CNI 简介

CNI (Container Network Interface) 是 CNCF 的网络接口标准，用于配置容器网络。

**核心功能：**
- IP 地址分配（IPAM）
- 网络接口创建
- 路由配置
- 网络策略实施

### 2.2 主流 CNI 插件对比

| 特性 | Calico | Flannel | Cilium | Weave Net |
|------|--------|---------|--------|-----------|
| 网络模式 | BGP/VXLAN | VXLAN/UDP | eBPF/VXLAN | VXLAN |
| 网络策略 | ✅ | ❌ | ✅ | ✅ |
| 性能 | 高 | 中 | 极高 | 中 |
| 复杂度 | 中 | 低 | 高 | 低 |
| 适用场景 | 生产首选 | 测试环境 | 高性能需求 | 简单部署 |

### 2.3 Calico 安装与配置

#### 快速安装

```bash
# 使用 Helm 安装
helm repo add projectcalico https://projectcalico.docs.tigera.io/charts
helm install calico projectcalico/tigera-operator --namespace calico-system --create-namespace

# 或使用 YAML 清单
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# 验证安装
kubectl get pods -n calico-system
kubectl get daemonset calico-node -n calico-system
```

#### 自定义配置

```yaml
# calico-values.yaml
installation:
  calicoNetwork:
    # 网络模式: "BGP", "VXLAN", "IPIPT" 
    ipipMode: Always
    vxlanMode: Never
    
    # Pod 网络段
    cidr: 192.168.0.0/16
    
    # MTU 设置
    mtu: 1440

# 配置 BGP
bgpConfiguration:
  asNumber: 64512
  
  # 节点间 BGP
  nodeToNodeMeshEnabled: true
  
  # 全局对等体
  peers:
    - peerIP: 192.168.1.1
      asNumber: 64513

# 网络策略
networkPolicy:
  enabled: true

# Felix 配置
felixConfiguration:
  # 日志级别
  logLevel: "Info"
  
  # IPinIP 启用
  ipipEnabled: true
```

```bash
# 安装自定义 Calico
helm upgrade --install calico projectcalico/tigera-operator \
  --namespace calico-system \
  --values calico-values.yaml
```

#### 网络策略示例

```yaml
# default-deny.yaml - 默认拒绝所有
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: default
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# allow-dns.yaml - 允许 DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: default
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53

---
# allow-web-ingress.yaml - 允许特定入站
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-ingress
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 80
```

### 2.4 Flannel 安装

```bash
# 安装 Flannel
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml

# 验证
kubectl get ds kube-flannel-ds -n kube-flannel

# 查看 Pod 网络
kubectl exec -n kube-flannel <flannel-pod> -- cat /run/flannel/subnet.env
```

#### 自定义配置

```yaml
# kube-flannel-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-flannel-cfg
  namespace: kube-flannel
data:
  # 网络后端: vxlan, host-gw, udp
  net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan",
        "Port": 8472
      }
    }
```

### 2.5 Cilium 安装

```bash
# 使用 Helm 安装
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium --namespace kube-system --set kubeProxyReplacement=strict

# 或使用 cilium CLI
curl -L https://github.com/cilium/cilium-cli/releases/latest/download/cilium-linux-amd64.tar.gz | tar xz
sudo mv cilium /usr/local/bin/

cilium install

# 验证
cilium status
cilium connectivity test
```

#### Cilium 高级特性

```yaml
# cilium-values.yaml
kubeProxyReplacement: strict

# 启用 Hubble (可观测性)
hubble:
  enabled: true
  relay:
    enabled: true
  ui:
    enabled: true

# 网络策略
policyEnforcementMode: default

# BGP 控制
bgpControlPlane:
  enabled: true
```

```bash
# 安装
helm upgrade cilium cilium/cilium --namespace kube-system --values cilium-values.yaml

# 查看 Hubble UI
cilium hubble ui
```

## 三、Service 负载均衡

### 3.1 Service 类型

#### ClusterIP（默认）

```yaml
# service-clusterip.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - name: http
      port: 80          # Service 端口
      targetPort: 8080  # Pod 端口
      protocol: TCP
  # 可选：指定 ClusterIP
  # clusterIP: None  # 无头服务 (Headless)
```

```bash
# 应用配置
kubectl apply -f service-clusterip.yaml

# 查看服务
kubectl get svc web-service

# 查看 Endpoints
kubectl get endpoints web-service

# 测试访问
kubectl run test-pod --image=busybox -it --rm -- wget -qO- http://web-service
```

#### NodePort

```yaml
# service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - name: http
      port: 80
      targetPort: 8080
      # NodePort 端口范围: 30000-32767
      nodePort: 30080
  sessionAffinity: ClientIP  # 会话保持
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 小时
```

```bash
# 访问测试
curl http://<node-ip>:30080

# 查看服务详情
kubectl describe svc web-nodeport
```

#### LoadBalancer

```yaml
# service-loadbalancer.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-lb
  annotations:
    # AWS 注解
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: "http"
    service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "arn:aws:acm:..."
    
    # GKE 注解
    cloud.google.com/load-balancer-type: "Internal"
    
    # 阿里云注解
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-spec: "slb.s3.small"
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
    - name: https
      port: 443
      targetPort: 8443
      protocol: TCP
  # 仅限特定 IP
  loadBalancerSourceRanges:
    - 1.2.3.4/32
    - 10.0.0.0/8
```

```bash
# 应用配置
kubectl apply -f service-loadbalancer.yaml

# 查看外部 IP
kubectl get svc web-lb -w

# 访问服务
curl http://<external-ip>
```

#### ExternalName

```yaml
# service-externalname.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: database.example.com
  ports:
    - port: 3306
```

```bash
# 使用 DNS 访问
mysql -h external-db.default.svc.cluster.local
```

### 3.2 会话保持与性能

```yaml
# service-advanced.yaml
apiVersion: v1
kind: Service
metadata:
  name: advanced-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
  
  # 会话保持
  sessionAffinity: ClientIP
  
  # 性能优化
  # 配置外部流量策略 (Local vs Cluster)
  externalTrafficPolicy: Local  # 保留源 IP，但可能导致负载不均衡
  
  # 健康检查
  publishNotReadyAddresses: false
```

### 3.3 Service 高级特性

#### 无头服务（Headless）

```yaml
# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: stateful-set-service
spec:
  clusterIP: None  # 无头服务
  selector:
    app: database
  ports:
    - port: 5432
```

```bash
# DNS 解析返回所有 Pod IP
nslookup stateful-set-service
```

#### Endpoints 手动管理

```yaml
# endpoints-custom.yaml
apiVersion: v1
kind: Endpoints
metadata:
  name: custom-service
subsets:
  - addresses:
      - ip: 10.0.0.1
      - ip: 10.0.0.2
    ports:
      - port: 80
        protocol: TCP
        name: http

---
apiVersion: v1
kind: Service
metadata:
  name: custom-service
spec:
  ports:
    - port: 80
      targetPort: 80
```

#### EndpointSlice（推荐）

```yaml
# endpointslice.yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: web-endslices
  addressType: IPv4
endpoints:
  - addresses:
      - "10.244.1.5"
      - "10.244.2.8"
    conditions:
      ready: true
    targetRef:
      kind: Pod
      name: web-pod-1
ports:
  - name: http
    port: 80
    protocol: TCP
```

### 3.4 kube-proxy 配置

```bash
# 查看 kube-proxy 模式
kubectl get cm kube-proxy -n kube-system -o yaml | grep mode

# 修改为 IPVS 模式（推荐）
kubectl edit cm kube-proxy -n kube-system

# 修改以下内容
# mode: "ipvs"

# 重启 kube-proxy
kubectl rollout restart daemonset kube-proxy -n kube-system
```

```yaml
# kube-proxy 配置示例
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-proxy
  namespace: kube-system
data:
  config.conf: |-
    apiVersion: kubeproxy.config.k8s.io/v1alpha1
    kind: KubeProxyConfiguration
    # IPVS 模式
    mode: "ipvs"
    
    # 调度算法: rr, lc, dh, sh, sed, nq
    scheduler: "lc"
    
    # IPVS TCP 超时
    tcpTimeout: "900s"
    tcpFinTimeout: "30s"
    udpTimeout: "300s"
    
    # 连接跟踪
    conntrack:
      # TCP 连接跟踪超时
      tcpEstablishedTimeout: "86400s"
      # 可用连接跟踪数量
      maxPerCore: 32768
```

## 四、Ingress 控制器

### 4.1 Nginx Ingress Controller

#### 安装

```bash
# 使用 Helm 安装
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux

# 或使用 YAML
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

# 验证安装
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

#### 基本使用

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:alpine
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80

---
# ingress-basic.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

```bash
# 应用配置
kubectl apply -f deployment.yaml
kubectl apply -f ingress-basic.yaml

# 查看 Ingress
kubectl get ingress
kubectl describe ingress web-ingress

# 添加 DNS 记录或 /etc/hosts
# <ingress-ip> web.example.com

# 测试访问
curl -H "Host: web.example.com" http://<ingress-ip>
```

#### 高级配置

```yaml
# ingress-advanced.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: advanced-ingress
  annotations:
    # 重写路径
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    
    # SSL 重定向
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    
    # 限速
    nginx.ingress.kubernetes.io/limit-rps: "10"
    nginx.ingress.kubernetes.io/limit-connections: "5"
    
    # 认证
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
    
    # CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    
    # 自定义错误
    nginx.ingress.kubernetes.io/custom-http-errors: "404,503"
    
    # 代理缓冲
    nginx.ingress.kubernetes.io/proxy-buffer-size: "128k"
    
    # 日志格式
    nginx.ingress.kubernetes.io/log-format: '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"'
    
    # 白名单
    nginx.ingress.kubernetes.io/whitelist-source-range: "10.0.0.0/8,192.168.0.0/16"

spec:
  ingressClassName: nginx
  
  # TLS 配置
  tls:
    - hosts:
        - web.example.com
      secretName: web-tls
  
  # 规则配置
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-service
                port:
                  number: 8080
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

#### SSL/TLS 配置

```bash
# 生成自签名证书（测试用）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=web.example.com/O=web.example.com"

# 创建 Secret
kubectl create secret tls web-tls \
  --cert=tls.crt \
  --key=tls.key

# 使用 cert-manager 自动管理证书（推荐）
# 安装 cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 创建 ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

```yaml
# ingress-cert-manager.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - web.example.com
      secretName: web-tls
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

#### 金丝雀部署

```yaml
# canary-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-canary
  annotations:
    # 启用金丝雀
    nginx.ingress.kubernetes.io/canary: "true"
    
    # 流量分割
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% 流量
    
    # 基于 Header 分流
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "true"
    
    # 基于 Cookie 分流
    nginx.ingress.kubernetes.io/canary-by-cookie: "canary_user"

spec:
  ingressClassName: nginx
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service-v2  # 新版本
                port:
                  number: 80
```

### 4.2 Traefik Ingress

#### 安装

```bash
# 使用 Helm 安装
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik \
  --namespace traefik \
  --create-namespace \
  --set dashboard.enabled=true \
  --set dashboard.domain=traefik.example.com

# 验证
kubectl get pods -n traefik
kubectl get svc -n traefik
```

#### 基本配置

```yaml
# traefik-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-traefik
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
spec:
  ingressClassName: traefik
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

#### 中间件配置

```yaml
# traefik-middleware.yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: strip-prefix
spec:
  stripPrefix:
    prefixes:
      - /api
      - /v1

---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: rate-limit
spec:
  rateLimit:
    average: 100
    burst: 50

---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: basic-auth
spec:
  basicAuth:
    users:
      - "admin:$apr1$hash"  # htpasswd 生成

---
# 使用中间件
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-traefik
  annotations:
    traefik.ingress.kubernetes.io/router.middlewares: default-strip-prefix,default-rate-limit
spec:
  ingressClassName: traefik
  rules:
    - host: web.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### 4.3 APISIX Ingress

#### 安装

```bash
# 添加 Helm 仓库
helm repo add apisix https://charts.apiseven.com
helm repo update

# 安装 APISIX
helm install apisix apisix/apisix \
  --namespace apisix \
  --create-namespace \
  --set ingress-controller.enabled=true

# 验证
kubectl get pods -n apisix
kubectl get svc -n apisix
```

#### 基本使用

```yaml
# apisix-route.yaml
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: web-route
spec:
  http:
    - name: web-rule
      match:
        paths:
          - /api/*
        methods:
          - GET
          - POST
      backends:
        - serviceName: api-service
          servicePort: 8080
      plugins:
        - name: limit-req
          enable: true
          config:
            rate: 100
            burst: 50
        - name: prometheus
          enable: true

---
apiVersion: apisix.apache.org/v2
kind: ApisixTls
metadata:
  name: web-tls
spec:
  hosts:
    - web.example.com
  secret:
    name: web-tls-secret
    namespace: default
```

### 4.4 Ingress 控制器对比

| 特性 | Nginx Ingress | Traefik | APISIX | HAProxy |
|------|---------------|---------|--------|---------|
| 性能 | 高 | 中 | 极高 | 极高 |
| 配置复杂度 | 中 | 低 | 中 | 高 |
| 动态配置 | 支持 | 原生支持 | 支持 | 有限 |
| 插件生态 | 丰富 | 中等 | 丰富 | 中等 |
| 监控集成 | 好 | 好 | 极好 | 好 |
| 学习曲线 | 中 | 低 | 中 | 高 |
| 适用场景 | 通用 | 简单部署 | 高性能 | 传统负载均衡 |

## 五、实战案例

### 5.1 微服务架构

```yaml
# 微服务部署示例
---
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: frontend:latest
          ports:
            - containerPort: 3000

---
# frontend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000

---
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: DB_HOST
              value: "database-service"

---
# backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080

---
# database-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "password"
          volumeMounts:
            - name: data
              mountPath: /var/lib/mysql
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: mysql-pvc

---
# database-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: database-service
spec:
  selector:
    app: database
  ports:
    - port: 3306
      targetPort: 3306
  clusterIP: None  # 无头服务

---
# ingress-routes.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: backend-service
                port:
                  number: 8080
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

### 5.2 多环境配置

```yaml
# dev-environment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: dev
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-staging"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - dev.example.com
      secretName: dev-tls
  rules:
    - host: dev.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80

---
# prod-environment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: prod

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: prod
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/enable-modsecurity: "true"
    nginx.ingress.kubernetes.io/modsecurity-snippet: |
      SecRuleEngine On
      SecRequestBodyAccess On
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: prod-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

### 5.3 高可用配置

```yaml
# ingress-ha.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
spec:
  replicas: 3  # 多副本
  revisionHistoryLimit: 10
  
  # 反亲和性确保不同节点
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values:
                    - nginx-ingress
            topologyKey: kubernetes.io/hostname
  
  # 滚动更新策略
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  # 资源限制
  template:
    metadata:
      labels:
        app: nginx-ingress
    spec:
      # 优先级
      priorityClassName: system-cluster-critical
      
      # 容忍关键节点
      tolerations:
        - key: "CriticalAddonsOnly"
          operator: "Exists"
      
      containers:
        - name: nginx-ingress-controller
          image: registry.k8s.io/ingress-nginx/controller:v1.9.4
          
          # 资源配置
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          
          # 健康检查
          livenessProbe:
            httpGet:
              path: /healthz
              port: 10254
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /healthz
              port: 10254
            initialDelaySeconds: 5
            periodSeconds: 5

---
# Service 配置
apiVersion: v1
kind: Service
metadata:
  name: nginx-ingress-controller
  namespace: ingress-nginx
spec:
  type: LoadBalancer
  # 保留源 IP
  externalTrafficPolicy: Local
  
  # 会话保持
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  
  # 健康检查端口
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
    - name: https
      port: 443
      targetPort: 443
      protocol: TCP
    - name: health
      port: 10254
      targetPort: 10254
      protocol: TCP
  
  selector:
    app: nginx-ingress
```

## 六、监控与调试

### 6.1 网络策略调试

```bash
# Calico
calicoctl get networkpolicies
calicoctl get workloadendpoints

# 查看策略应用
kubectl get networkpolicy --all-namespaces

# 测试网络连通性
kubectl run test-pod --image=nicolaka/netshoot -it --rm -- bash
# 在 Pod 中测试
wget -O- http://service-name
```

### 6.2 Service 调试

```bash
# 查看 Endpoints
kubectl get endpoints

# 查看 DNS 解析
kubectl run test-dns --image=busybox -it --rm -- nslookup service-name

# 测试服务访问
kubectl port-forward svc/service-name 8080:80

# 查看 kube-proxy iptables 规则
kubectl exec -n kube-system kube-proxy-xxx -- iptables-save | grep service-name

# IPVS 查看规则
kubectl exec -n kube-system kube-proxy-xxx -- ipvsadm -Ln
```

### 6.3 Ingress 调试

```bash
# 查看 Ingress 状态
kubectl get ingress -A

# 查看 Ingress Controller 日志
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# 进入 Ingress Controller
kubectl exec -n ingress-nginx -it deployment/ingress-nginx-controller -- /bin/sh

# 查看 nginx 配置
kubectl exec -n ingress-nginx deployment/ingress-nginx-controller -- cat /etc/nginx/nginx.conf

# 测试 Ingress
curl -v -H "Host: example.com" http://<ingress-ip>
```

### 6.4 性能监控

```yaml
# 安装 Prometheus Operator
kubectl apply -f https://github.com/prometheus-operator/prometheus-operator/releases/latest/download/bundle.yaml

# Service Monitor 示例
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: nginx-ingress
  namespace: ingress-nginx
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: ingress-nginx
  endpoints:
    - port: metrics
      interval: 30s
```

```bash
# 查看监控指标
# Nginx Ingress
curl http://ingress-nginx-controller.ingress-nginx:10254/metrics

# Traefik
curl http://traefik.traefik:9000/metrics

# APISIX
curl http://apisix-admin/apisix/admin/prometheus/metrics
```

## 七、故障排查

### 7.1 网络不通问题

```bash
# 检查 Pod 网络
kubectl exec <pod> -- ip addr
kubectl exec <pod> -- ip route

# 检查 DNS
kubectl exec <pod> -- nslookup kubernetes.default.svc.cluster.local

# 检查 Service
kubectl get endpoints <service>
kubectl describe svc <service>

# 检查网络策略
kubectl get networkpolicy -A
```

### 7.2 Ingress 502/504 错误

```bash
# 检查 Service 是否存在
kubectl get svc

# 检查 Endpoints
kubectl get endpoints <service>

# 检查 Pod 状态
kubectl get pods -l app=<app-label>

# 查看 Ingress 日志
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller --tail=100

# 检查配置
kubectl describe ingress <ingress-name>
```

### 7.3 性能问题

```bash
# 检查节点网络
kubectl get nodes -o wide

# 检查 CNI 状态
kubectl get ds -n calico-system
kubectl get ds -n kube-flannel

# 检查 kube-proxy
kubectl logs -n kube-system -l k8s-app=kube-proxy

# 网络性能测试
kubectl run perf-test --image=nicolaka/netshoot -it --rm -- qperf <target-ip> tcp_lat
```

### 7.4 证书问题

```bash
# 查看证书 Secret
kubectl get secrets

# 查看证书详情
kubectl describe secret <tls-secret>

# 检查 cert-manager 状态
kubectl get certificate
kubectl get certificaterequest
kubectl describe certificate <cert-name>
```

## 八、最佳实践

### 8.1 网络设计原则

1. **选择合适的 CNI**
   - 简单环境：Flannel
   - 生产环境：Calico
   - 高性能需求：Cilium

2. **Service 使用原则**
   - 内部通信：ClusterIP
   - 外部访问：Ingress + LoadBalancer
   - 避免直接使用 NodePort

3. **Ingress 规划**
   - 使用统一入口
   - 配置 TLS 证书
   - 实施速率限制
   - 启用日志监控

### 8.2 安全建议

```yaml
# 网络策略示例
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# 只允许特定入站
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-nginx
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 80

---
# Pod 安全标准
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
        readOnlyRootFilesystem: true
```

### 8.3 性能优化

```yaml
# kube-proxy IPVS 优化
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-proxy
  namespace: kube-system
data:
  config.conf: |-
    mode: ipvs
    scheduler: "lc"
    conntrack:
      maxPerCore: 32768
      tcpClose: 3600
      tcpEstablished: 86400

---
# Ingress 性能优化
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
data:
  # 连接处理
  worker-processes: "auto"
  worker-connections: "10240"
  worker-shutdown-timeout: "240s"
  
  # 性能优化
  keep-alive: "100"
  keep-alive-requests: "100"
  
  # 缓冲
  client-body-buffer-size: "128k"
  proxy-buffer-size: "128k"
  proxy-buffers-number: "4"
  
  # 日志
  log-format-upstream: '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id'
  
  # 监控
  enable-vts-status: "true"
```

### 8.4 高可用配置

```yaml
# 多副本 Ingress Controller
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-ingress
  namespace: ingress-nginx
spec:
  replicas: 3
  
  # 反亲和性
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - nginx-ingress
          topologyKey: "kubernetes.io/hostname"
  
  # 优先级
  template:
    metadata:
      labels:
        app: nginx-ingress
    spec:
      priorityClassName: system-cluster-critical
      tolerations:
        - key: CriticalAddonsOnly
          operator: Exists
      containers:
        - name: nginx-ingress
          # 资源配置
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
```

## 九、故障排查速查表

| 问题 | 检查项 | 解决方案 |
|------|--------|----------|
| Pod 无法访问 Service | Endpoints、网络策略 | 检查 kubectl get endpoints |
| Ingress 502 | 后端 Service、Pod | 检查 Service 和 Pod 状态 |
| DNS 解析失败 | CoreDNS、网络策略 | 检查 CoreDNS Pod |
| 证书错误 | Secret、cert-manager | 检查 TLS Secret |
| 性能问题 | kube-proxy 模式、CNI | 使用 IPVS、优化 CNI |
| 网络策略不生效 | CNI 支持、标签匹配 | 使用支持策略的 CNI |

## 十、总结

Kubernetes 网络三层架构：

1. **CNI 层** - 基础网络设施
   - Calico：生产首选，支持网络策略
   - Flannel：简单易用
   - Cilium：高性能 eBPF

2. **Service 层** - 服务发现与负载均衡
   - ClusterIP：内部通信
   - LoadBalancer：外部访问
   - Headless：有状态应用

3. **Ingress 层** - 七层路由
   - Nginx：通用选择
   - Traefik：简单部署
   - APISIX：高性能需求

通过合理选择和配置这三层组件，可以构建稳定、高性能、安全的 Kubernetes 网络架构。
