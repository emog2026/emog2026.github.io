---
title: Terraform 完整实战指南：从入门到精通
date: 2026-06-23
tags:
  - Terraform
  - IaC
  - DevOps
  - 云原生
  - 基础设施即代码
categories:
  - DevOps
  - 云原生
---

## 一、Terraform 概述

### 1.1 什么是 Terraform

Terraform 是 HashiCorp 开发的基础设施即代码（IaC）工具，用于安全高效地构建、更改和版本化基础设施。

**核心特性：**
- 声明式语言 - 描述 desired state
- 多云支持 - AWS、Azure、GCP、阿里云等
- 资源依赖管理 - 自动处理资源创建顺序
- 状态管理 - 跟踪基础设施状态
- 模块化 - 可复用的配置模板

**工作原理：**

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   配置文件   │ ──▶ │  Terraform   │ ──▶ │  云平台 API │
│  (.tf文件)  │     │   Core Core   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  State 文件  │
                   │ (.tfstate)  │
                   └─────────────┘
```

### 1.2 核心概念

| 概念 | 说明 | 示例 |
|------|------|------|
| Provider | 云服务提供商 | AWS、Azure、GCP、阿里云 |
| Resource | 基础设施资源 | EC2、VPC、RDS |
| Variable | 输入变量 | region、instance_type |
| Output | 输出值 | instance_ip、db_endpoint |
| Module | 模块化配置 | vpc、compute、network |
| State | 状态文件 | terraform.tfstate |
| Backend | 状态存储 | S3、Consul、Azure Blob |

### 1.3 工作流

```
配置阶段      初始化       计划变更      执行变更       管理状态
  │           │           │           │           │
编写.tf    terraform   terraform   terraform   terraform
文件        init        plan        apply       show/destroy
```

## 二、Terraform 安装

### 2.1 系统要求

- 任何主流操作系统（Linux、macOS、Windows）
- Go 1.18+（编译安装）
- 互联网连接（下载 Provider）

### 2.2 安装方法

#### Linux/macOS

```bash
# 下载二进制文件
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip

# 解压
unzip terraform_1.6.0_linux_amd64.zip

# 移动到 PATH
sudo mv terraform /usr/local/bin/

# 验证安装
terraform version
```

#### 使用包管理器

```bash
# macOS (Homebrew)
brew install terraform

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y terraform

# CentOS/RHEL
sudo yum install -y terraform

# Arch Linux
sudo pacman -S terraform
```

#### Windows

```powershell
# 使用 Chocolatey
choco install terraform

# 或手动下载
# 1. 下载 https://releases.hashicorp.com/terraform/
# 2. 解压到目录
# 3. 添加到 PATH
```

### 2.3 配置环境

```bash
# 设置配置目录
export TF_PLUGIN_CACHE_DIR="$HOME/.terraform.d/plugin-cache"

# 创建日志目录
mkdir -p ~/.terraform.d/logs

# 配置自动补全（bash）
terraform -install-autocomplete

# 配置自动补全（zsh）
terraform -install-autocomplete
```

## 三、第一个 Terraform 项目

### 3.1 项目结构

```
my-terraform-project/
├── main.tf              # 主配置文件
├── variables.tf         # 变量定义
├── outputs.tf          # 输出定义
├── terraform.tfvars    # 变量值文件
├── provider.tf         # Provider 配置
└── modules/            # 模块目录
```

### 3.2 Hello World - 创建本地文件

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}

resource "local_file" "example" {
  content  = "Hello, Terraform!"
  filename = "${path.module}/hello.txt"
}

output "file_path" {
  value = local_file.example.filename
  description = "创建的文件路径"
}
```

```bash
# 初始化项目
terraform init

# 格式化配置
terraform fmt

# 验证语法
terraform validate

# 查看计划
terraform plan

# 执行变更
terraform apply

# 查看输出
terraform output file_path
```

### 3.3 核心命令详解

```bash
# ========== 初始化 ==========
terraform init                    # 初始化工作目录
terraform init -upgrade          # 升级 Provider 和模块

# ========== 计划阶段 ==========
terraform plan                   # 查看执行计划
terraform plan -out=tfplan       # 保存计划到文件
terraform plan -var="region=us-east-1"  # 使用变量

# ========== 执行阶段 ==========
terraform apply                  # 交互式执行
terraform apply tfplan          # 执行保存的计划
terraform apply -auto-approve    # 自动确认（生产环境慎用）
terraform apply -var="instance_type=t3.micro"

# ========== 查看状态 ==========
terraform show                   # 显示状态或配置
terraform state list             # 列出所有资源
terraform show -json             # JSON 格式输出

# ========== 资源管理 ==========
terraform import                # 导入现有资源
terraform refresh               # 刷新状态文件
terraform taint <resource>      # 标记资源为需重新创建
terraform untaint <resource>    # 取消标记
terraform destroy               # 销毁所有资源

# ========== 其他工具 ==========
terraform fmt                   # 格式化代码
terraform validate             # 验证配置
terraform output               # 显示输出变量
terraform graph                # 生成依赖关系图
```

## 四、AWS 基础设施部署

### 4.1 配置 AWS Provider

```hcl
# provider.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # 配置后端（存储状态）
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Project     = var.project_name
    }
  }
}
```

### 4.2 变量定义

```hcl
# variables.tf
variable "aws_region" {
  description = "AWS 区域"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "环境名称"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment 必须是 dev、staging 或 prod"
  }
}

variable "instance_type" {
  description = "EC2 实例类型"
  type        = string
  default     = "t3.micro"
}

variable "availability_zones" {
  description = "可用区列表"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "tags" {
  description = "资源标签"
  type        = map(string)
  default     = {}
}
```

### 4.3 创建 VPC 和网络

```hcl
# network.tf
# 创建 VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# 创建 Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 创建子网
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
    Type = "private"
  }
}

# 创建路由表
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### 4.4 安全组配置

```hcl
# security.tf
# 创建安全组
resource "aws_security_group" "web" {
  name_prefix = "${var.project_name}-web-"
  description = "Web 服务器安全组"
  vpc_id      = aws_vpc.main.id

  # HTTP 入站
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS 入站
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH 入站（限制 IP）
  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_ip_ranges
  }

  # 出站规则
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

### 4.5 EC2 实例部署

```hcl
# compute.tf
# 创建 EC2 实例
resource "aws_instance" "web" {
  count                  = var.instance_count
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[count.index % length(var.availability_zones)].id
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              echo "<h1>Hello from Terraform</h1>" > /var/www/html/index.html
              EOF

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # 强制 IMDSv2
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-web-${count.index + 1}"
    Environment = var.environment
  }
}

# 获取最新 Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
```

### 4.6 输出定义

```hcl
# outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "公网子网 ID 列表"
  value       = aws_subnet.public[*].id
}

output "instance_public_ips" {
  description = "EC2 实例公网 IP"
  value       = aws_instance.web[*].public_ip
}

output "load_balancer_dns" {
  description = "负载均衡器 DNS"
  value       = try(aws_lb.main.dns_name, null)
}
```

### 4.7 变量文件

```hcl
# terraform.tfvars
aws_region        = "us-east-1"
environment       = "dev"
project_name      = "myapp"
vpc_cidr          = "10.0.0.0/16"
instance_count     = 2
instance_type      = "t3.micro"
admin_ip_ranges    = ["1.2.3.4/32"]
```

### 4.8 执行部署

```bash
# 1. 初始化
terraform init

# 2. 验证配置
terraform validate

# 3. 查看计划
terraform plan -out=tfplan

# 4. 执行部署
terraform apply tfplan

# 5. 查看输出
terraform output instance_public_ips

# 6. 访问应用
curl http://$(terraform output -raw instance_public_ips | head -1)
```

## 五、阿里云部署示例

### 5.1 阿里云 Provider 配置

```hcl
# provider_alicloud.tf
terraform {
  required_providers {
    alicloud = {
      source  = "aliyun/alicloud"
      version = "~> 1.200"
    }
  }
}

provider "alicloud" {
  region = var.alicloud_region
}

# 环境变量设置
# export ALICLOUD_ACCESS_KEY="your-access-key"
# export ALICLOUD_SECRET_KEY="your-secret-key"
# export ALICLOUD_REGION="cn-hangzhou"
```

### 5.2 创建 VPC 和交换机

```hcl
# alicloud_network.tf
resource "alicloud_vpc" "main" {
  vpc_name   = "${var.project_name}-vpc"
  cidr_block = var.vpc_cidr
}

resource "alicloud_vswitch" "public" {
  vpc_id     = alicloud_vpc.main.id
  cidr_block = var.vswitch_cidr
  zone_id    = var.alicloud_zone

  tags = {
    Name = "${var.project_name}-vswitch"
  }
}
```

### 5.3 创建 ECS 实例

```hcl
# alicloud_compute.tf
data "alicloud_images" "centos_7" {
  name_regex = "^centos_7"
  owners     = "system"
}

data "alicloud_instance_types" "compute" {
  cpu_core_count = 2
  memory_size   = 4
}

resource "alicloud_security_group" "web" {
  name   = "${var.project_name}-sg"
  vpc_id = alicloud_vpc.main.id
}

resource "alicloud_security_group_rule" "allow_http" {
  type              = "ingress"
  ip_protocol       = "tcp"
  port_range        = "80/80"
  security_group_id = alicloud_security_group.web.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_instance" "web" {
  instance_name        = "${var.project_name}-ecs"
  image_id             = data.alicloud_images.centos_7.images[0].id
  instance_type        = data.alicloud_instance_types.compute.instance_types[0].id
  vswitch_id           = alicloud_vswitch.public.id
  security_group_ids   = [alicloud_security_group.web.id]
  system_disk_category = "cloud_essd"
  
  user_data = <<-EOF
              #!/bin/bash
              yum install -y nginx
              systemctl start nginx
              EOF
}
```

## 六、高级功能

### 6.1 模块化开发

#### 创建 VPC 模块

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    { Name = "${var.name}-vpc" }
  )
}

resource "aws_subnet" "public" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.cidr, 8, count.index)
  availability_zone = var.azs[count.index]

  tags = merge(
    var.tags,
    { Name = "${var.name}-public-${count.index + 1}" }
  )
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    { Name = "${var.name}-igw" }
  )
}
```

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "资源名称前缀"
  type        = string
}

variable "cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "azs" {
  description = "可用区列表"
  type        = list(string)
}

variable "tags" {
  description = "标签"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}
```

#### 使用模块

```hcl
# main.tf
module "vpc" {
  source = "./modules/vpc"

  name  = var.project_name
  cidr  = "10.0.0.0/16"
  azs   = var.availability_zones

  tags = {
    Environment = var.environment
  }
}

# 使用模块输出
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_ids[0]
  # ...
}
```

### 6.2 数据源使用

```hcl
# data.tf
# 获取现有 VPC
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["my-existing-vpc"]
  }
}

# 获取现有子网
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }

  filter {
    name   = "tag:Type"
    values = ["private"]
  }
}

# 获取最新的 AMI
data "aws_ami" "latest_ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# 获取当前账户 ID
data "aws_caller_identity" "current" {}

# 获取当前区域
data "aws_region" "current" {}
```

### 6.3 条件和循环

```hcl
# 条件表达式
resource "aws_instance" "conditional" {
  count = var.create_instance ? 1 : 0
  
  instance_type = var.environment == "prod" ? "t3.large" : "t3.micro"
  
  enable_volume = true
  
  # 使用三元运算符
  volume_size = var.environment == "prod" ? 100 : 20
}

# 循环创建资源
resource "aws_s3_bucket" "logs" {
  count = length(var.log_buckets)
  
  bucket = "${var.project_name}-logs-${count.index}"
}

# for 表达式
output "instance_ips" {
  value = [for instance in aws_instance.web : instance.public_ip]
}

# 过滤列表
output "production_instances" {
  value = [
    for instance in aws_instance.web : 
    instance.id
    if instance.tags["Environment"] == "prod"
  ]
}

# map 表达式
output "instance_details" {
  value = {
    for instance in aws_instance.web : 
    instance.id => {
      public_ip  = instance.public_ip
      private_ip = instance.private_ip
    }
  }
}
```

### 6.4 动态块

```hcl
# dynamic.tf
resource "aws_security_group" "dynamic_rules" {
  name_prefix = "dynamic-"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      description = ingress.value.description
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = ingress.value.cidr_blocks
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# 使用
variable "ingress_rules" {
  type = list(object({
    description = string
    port        = number
    cidr_blocks = list(string)
  }))
  default = [
    {
      description = "HTTP"
      port        = 80
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      description = "HTTPS"
      port        = 443
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}
```

### 6.5 依赖关系

```hcl
# 隐式依赖（自动处理）
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id  # 隐式依赖
  cidr_block = "10.0.1.0/24"
}

# 显式依赖
resource "aws_db_instance" "database" {
  # ...
}

resource "aws_instance" "app" {
  depends_on = [aws_db_instance.database]
  
  # 确保 DB 先创建完成
}

# 时间延迟
resource "time_sleep" "wait_30_seconds" {
  depends_on      = [aws_rds_cluster.main]
  create_duration = "30s"
}

resource "aws_eks_node_group" "main" {
  depends_on = [time_sleep.wait_30_seconds]
  # ...
}
```

### 6.6 生命周期管理

```hcl
# lifecycle.tf
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  lifecycle {
    # 创建前先销毁（适用于不可变资源）
    create_before_destroy = true

    # 忽略特定属性变更
    ignore_changes = [
      tags,
      root_block_device[0].volume_size,
    ]

    # 防止意外删除
    prevent_destroy = true

    # 替换触发条件
    replace_triggered_by = [
      aws_ami.latest.id
    ]
  }
}
```

### 6.7 Provisioners（慎用）

```hcl
# provisioner.tf
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  # 远程执行（推荐使用 user_data 替代）
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      user        = "admin"
      private_key = file("~/.ssh/id_rsa")
      host        = self.public_ip
    }

    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y docker.io",
    ]
  }

  # 本地执行
  provisioner "local-exec" {
    command = "echo ${self.public_ip} >> hosts.txt"
  }

  # 销毁时执行
  provisioner "local-exec" {
    when    = destroy
    command = "rm -f hosts.txt"
  }
}
```

## 七、状态管理

### 7.1 状态后端配置

```hcl
# S3 后端（推荐）
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789:key/12345678"
    dynamodb_table = "terraform-state-lock"
  }
}

# Azure Blob Storage
terraform {
  backend "azurerm" {
    resource_group_name   = "terraform-state-rg"
    storage_account_name  = "tfstate"
    container_name        = "tfstate"
    key                   = "prod.terraform.tfstate"
  }
}

# GCS
terraform {
  backend "gcs" {
    bucket = "terraform-state"
    prefix = "prod"
  }
}
```

### 7.2 状态管理命令

```bash
# 查看状态
terraform state list

# 查看特定资源详情
terraform state show 'aws_instance.web[0]'

# 从状态中移除资源（不删除实际资源）
terraform state rm 'aws_instance.old'

# 移动资源
terraform state mv 'aws_instance.web' 'aws_instance.web_server'

# 导入现有资源
terraform import aws_instance.web i-1234567890abcdef0

# 刷新状态（更新为实际状态）
terraform refresh

# 备份状态文件
terraform state pull > backup.tfstate

# 从备份恢复
terraform state push backup.tfstate
```

### 7.3 状态隔离策略

```bash
# 按环境隔离
dev/
├── main.tf
└── backend.tf    # key = "dev/terraform.tfstate"

prod/
├── main.tf
└── backend.tf    # key = "prod/terraform.tfstate"

# 按团队隔离
network/
├── main.tf
└── backend.tf    # key = "network/terraform.tfstate"

compute/
├── main.tf
└── backend.tf    # key = "compute/terraform.tfstate"
```

## 八、多环境配置

### 8.1 目录结构

```
terraform-project/
├── environments/
│   ├── dev/
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── backend.tf
│       └── terraform.tfvars
├── modules/
│   ├── vpc/
│   ├── compute/
│   └── database/
├── main.tf
├── variables.tf
└── outputs.tf
```

### 8.2 使用 Workspaces

```bash
# 创建工作空间
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# 切换工作空间
terraform workspace select dev

# 查看当前工作空间
terraform workspace show

# 列出所有工作空间
terraform workspace list
```

```hcl
# variables.tf - 根据工作空间使用不同变量
variable "environment" {
  type    = string
  default = terraform.workspace
}

variable "instance_count" {
  default = {
    dev     = 1
    staging = 2
    prod    = 4
  }
}

# main.tf - 使用工作空间变量
resource "aws_instance" "web" {
  count = var.instance_count[terraform.workspace]
  # ...
}
```

### 8.3 使用 Terragrunt（推荐）

```hcl
# terragrunt.hcl
terraform {
  source = "git::ssh://git@github.com/org/terraform-modules.git//vpc?ref=v1.0.0"
}

# 依赖其他模块
dependencies {
  paths = ["../network"]
}

# 自动输入
inputs = {
  region       = "us-east-1"
  environment  = "dev"
  vpc_cidr     = "10.0.0.0/16"
  project_name = "myapp"
}

# 生成后端配置
remote_state {
  backend = "s3"
  config = {
    bucket         = "my-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

## 九、CI/CD 集成

### 9.1 GitHub Actions

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:

env:
  TF_VERSION: "1.6.0"
  AWS_REGION: "us-east-1"

jobs:
  terraform:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Format
        run: terraform fmt -check
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
      
      - name: Terraform Apply (main only)
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve tfplan
```

### 9.2 GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - plan
  - apply

variables:
  TF_VERSION: "1.6.0"
  AWS_REGION: "us-east-1"

before_script:
  - apk add --no-cache terraform=$TF_VERSION
  - terraform --version
  - export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
  - export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

fmt:
  stage: validate
  script:
    - terraform fmt -check
  only:
    - merge_requests

validate:
  stage: validate
  script:
    - terraform init
    - terraform validate
  only:
    - merge_requests

plan:
  stage: plan
  script:
    - terraform init
    - terraform plan -out=tfplan
  artifacts:
    paths:
      - tfplan
  only:
    - merge_requests
    - main

apply:
  stage: apply
  script:
    - terraform apply -auto-approve tfplan
  dependencies:
    - plan
  when: manual
  only:
    - main
```

### 9.3 Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        TF_VERSION = '1.6.0'
        AWS_REGION = 'us-east-1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Terraform') {
            steps {
                sh """
                    wget https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip
                    unzip terraform_${TF_VERSION}_linux_amd64.zip
                    sudo mv terraform /usr/local/bin/
                    terraform version
                """
            }
        }
        
        stage('Init') {
            steps {
                sh 'terraform init'
            }
        }
        
        stage('Validate') {
            steps {
                sh 'terraform validate'
            }
        }
        
        stage('Plan') {
            steps {
                sh 'terraform plan -out=tfplan'
            }
        }
        
        stage('Apply') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Apply Terraform changes?'
                sh 'terraform apply tfplan'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```

## 十、安全最佳实践

### 10.1 凭证管理

```hcl
# 使用环境变量
provider "aws" {
  region = var.aws_region
  
  # 从环境变量读取
  # AWS_ACCESS_KEY_ID
  # AWS_SECRET_ACCESS_KEY
  # AWS_SESSION_TOKEN
}

# 使用共享凭证文件
# ~/.aws/credentials
# [default]
# aws_access_key_id = xxx
# aws_secret_access_key = xxx

# 使用 Assume Role
provider "aws" {
  region = "us-east-1"
  
  assume_role {
    role_arn = "arn:aws:iam::123456789012:role/TerraformRole"
    session_name = "TerraformSession"
  }
}
```

### 10.2 敏感数据管理

```hcl
# 使用 Vault Provider
provider "vault" {
  address = "https://vault.internal"
  token    = var.vault_token
}

data "vault_generic_secret" "db_password" {
  path = "secret/prod/database"
}

resource "aws_db_instance" "main" {
  password = data.vault_generic_secret.db_password.data["password"]
}

# 使用 SSM Parameter Store
data "aws_ssm_parameter" "db_password" {
  name = "/prod/db/password"
}

# 使用 Secrets Manager
data "aws_secretsmanager_secret" "db_password" {
  name = "prod/database/password"
}

data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = data.aws_secretsmanager_secret.db_password.id
}
```

### 10.3 状态加密

```hcl
# S3 加密
terraform {
  backend "s3" {
    bucket         = "terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789:key/12345678"
  }
}

# 启用版本控制
# aws s3api put-bucket-versioning \
#   --bucket terraform-state \
#   --versioning-configuration Status=Enabled
```

## 十一、故障排查

### 11.1 常见错误

```bash
# 错误：Provider 未初始化
terraform init

# 错误：语法错误
terraform validate
terraform fmt

# 错误：变量未定义
terraform plan -var="region=us-east-1"
# 或创建 terraform.tfvars

# 错误：状态锁定
# 等待或解锁（谨慎）
terraform force-unlock <LOCK_ID>

# 错误：资源已存在
terraform import <resource_type>.<resource_name> <resource_id>
# 或使用 terraform state rm
```

### 11.2 调试技巧

```bash
# 启用详细日志
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log

# 追踪执行
terraform apply -trace

# 查看状态差异
terraform plan -refresh-only

# 生成依赖图
terraform graph | dot -Tpng > graph.png

# 清理缓存
terraform init -upgrade
rm -rf .terraform/
```

### 11.3 性能优化

```bash
# 并行创建
export TF_PARALLELISM=10

# 禁用插件缓存
export TF_PLUGIN_CACHE_MAY_BREAK_DEPENDENCY_CHAIN=1

# 使用状态快照
terraform state pull > snapshot.tfstate

# 优化 Provider 版本
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

## 十二、学习资源和最佳实践

### 12.1 最佳实践

1. **代码组织**
   - 模块化设计
   - 分离环境配置
   - 使用标准目录结构

2. **状态管理**
   - 使用远程后端
   - 启用状态锁定
   - 定期备份状态

3. **安全考虑**
   - 不在代码中硬编码凭证
   - 加密敏感数据
   - 使用最小权限原则

4. **团队协作**
   - 版本控制所有代码
   - 使用 CI/CD
   - Code Review 所有变更

5. **文档维护**
   - 注释复杂逻辑
   - 更新 README
   - 维护变更日志

### 12.2 常用模块资源

- [Terraform Registry](https://registry.terraform.io/) - 官方模块仓库
- [Awesome Terraform](https://github.com/shuaibiyy/awesome-terraform) - 精选资源列表
- [Terraform Best Practices](https://www.terraform-best-practices.com/) - 最佳实践指南
- [Terraform Cookbook](https://github.com/PaloAltoNetworks/terraform-cookbook) - 实战示例

### 12.3 命令速查表

```bash
# 初始化
terraform init [-upgrade]

# 格式化和验证
terraform fmt [-check]
terraform validate

# 计划和执行
terraform plan [-out=tfplan]
terraform apply [tfplan]

# 状态管理
terraform state list
terraform state show <resource>
terraform state rm <resource>
terraform import <resource> <id>

# 工作空间
terraform workspace list
terraform workspace new <name>
terraform workspace select <name>

# 输出
terraform output
terraform output <name>

# 销毁
terraform destroy
```

## 总结

Terraform 作为 IaC 工具，提供了：

1. **多云支持** - 统一管理不同云平台
2. **声明式语法** - 描述 desired state
3. **状态管理** - 跟踪基础设施变更
4. **模块化设计** - 代码复用和维护
5. **丰富的生态** - 社区支持和集成工具

通过本文的实战案例，你可以快速上手 Terraform，从简单的本地文件到复杂的云基础设施部署。记住：**基础设施即代码不仅是技术，更是文化和实践。**
