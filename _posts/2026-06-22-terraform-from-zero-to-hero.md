# Terraform 从零到入门：实战指南

> 基础设施即代码（IaC）的最佳实践，从概念到云端部署全流程

## 目录

- [Terraform 简介](#terraform-简介)
- [安装与环境配置](#安装与环境配置)
- [核心概念](#核心概念)
- [基础语法](#基础语法)
- [实战案例一：部署 AWS EC2](#实战案例一部署-aws-ec2)
- [实战案例二：多模块架构](#实战案例二多模块架构)
- [最佳实践](#最佳实践)
- [常见问题与解决方案](#常见问题与解决方案)

---

## Terraform 简介

### 什么是 Terraform？

Terraform 是一个开源的基础设施即代码（Infrastructure as Code，IaC）工具，由 HashiCorp 公司开发。它允许用户使用声明式配置语言来定义和 provisioning 云基础设施、网络、服务等资源。

### 为什么选择 Terraform？

| 特性 | 优势 |
|------|------|
| **多云支持** | 支持 AWS、Azure、GCP、阿里云等 100+ 提供商 |
| **声明式语言** | 描述"想要什么状态"，而非"如何实现" |
| **状态管理** | 自动跟踪资源状态，确保一致性 |
| **模块化** | 可复用的代码组件 |
| **执行计划** | 变更前预览影响 |

### Terraform vs 其他 IaC 工具

```
┌─────────────────────────────────────────────────────────────┐
│                     IaC 工具对比矩阵                          │
├──────────────────┬──────────────┬──────────────┬────────────┤
│                  │  Terraform   │  Ansible     │  CloudFormation │
├──────────────────┼──────────────┼──────────────┼────────────┤
│ 类型             │  声明式       │  过程式       │  声明式     │
│ 多云支持         │  ✓ ✓ ✓       │  ✓ ✓         │  AWS Only   │
│ 学习曲线         │  中等         │  较低         │  中等       │
│ 状态管理         │  ✓ ✓ ✓       │  -            │  ✓ ✓        │
└──────────────────┴──────────────┴──────────────┴────────────┘
```

---

## 安装与环境配置

### 系统要求

- 操作系统：Windows / macOS / Linux
- 推荐内存：4GB+
- 网络连接：访问 Terraform Registry 和云服务商 API

### 安装步骤

#### Windows 安装

```powershell
# 使用 Chocolatey
choco install terraform

# 或手动下载
# 1. 访问 https://developer.hashicorp.com/terraform/downloads
# 2. 下载 Windows amd64 zip 包
# 3. 解压到 C:\Program Files\Terraform
# 4. 添加到系统 PATH
```

#### macOS 安装

```bash
# 使用 Homebrew
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# 验证安装
terraform version
```

#### Linux 安装

```bash
# Ubuntu/Debian
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# 验证
terraform version
```

### IDE 配置推荐

#### VS Code

```bash
# 安装 Terraform 扩展
code --install-extension hashicorp.terraform
```

#### JetBrains（IntelliJ/PyCharm）

- 搜索并安装 "HashiCorp Terraform" 插件

### 初始配置

```bash
# 配置自动补全
terraform -install-autocomplete

# 查看帮助
terraform --help
```

---

## 核心概念

### 1. Provider（提供商）

Provider 是 Terraform 与云服务商之间的桥梁。

```hcl
provider "aws" {
  region = "us-east-1"
}

provider "azurerm" {
  features {}
}

provider "google" {
  project = "my-project-id"
  region  = "us-central1"
}
```

### 2. Resource（资源）

Resource 是要创建/管理的具体基础设施组件。

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  
  tags = {
    Name = "WebServer"
  }
}
```

### 3. Variable（变量）

变量用于参数化配置。

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}
```

### 4. Output（输出）

输出用于展示重要信息。

```hcl
output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.web.public_ip
}
```

### 5. State（状态）

State 文件记录了实际部署的基础设施状态。

```
terraform.tfstate          # 实际状态文件
terraform.tfstate.backup   # 状态备份
```

### Terraform 工作流程图

```
┌──────────────────────────────────────────────────────────────┐
│                     Terraform 工作流程                        │
└──────────────────────────────────────────────────────────────┘

   [编写配置]          [初始化]           [计划]           [应用]
   main.tf         →  terraform init  →  terraform plan  →  terraform apply
       │                  │                  │                │
       ▼                  ▼                  ▼                ▼
   .tf 文件         下载 Provider       生成执行计划      创建/修改资源
                      插件
                      初始化后端

   [展示]           [销毁]              [导入]            [刷新]
   terraform        terraform          terraform         terraform
   output           destroy             import            refresh
```

---

## 基础语法

### 基本文件结构

```
terraform-project/
├── main.tf              # 主配置文件
├── variables.tf         # 变量定义
├── outputs.tf           # 输出定义
├── terraform.tfvars     # 变量赋值（敏感信息）
├── modules/             # 模块目录
│   ├── vpc/
│   └── ec2/
└── .gitignore           # 忽略文件
```

### 语法示例

#### 1. 基础资源定义

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-logs"
  
  tags = {
    Name        = "${var.project_name}-logs"
    Environment = var.environment
  }
}
```

#### 2. 数据源

```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
}
```

#### 3. Local Values

```hcl
locals {
  project_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket" "data" {
  bucket = "${var.project_name}-data"
  tags   = local.project_tags
}
```

#### 4. 动态块

```hcl
resource "aws_security_group_rule" "allow_ports" {
  count = length(var.allowed_ports)

  type              = "ingress"
  from_port         = var.allowed_ports[count.index]
  to_port           = var.allowed_ports[count.index]
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.main.id
}
```

---

## 实战案例一：部署 AWS EC2

### 场景描述

在 AWS 上部署一个带有安全组的 Web 服务器，并自动配置用户数据。

### 项目结构

```
aws-ec2-deployment/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
└── README.md
```

### 1. main.tf

```hcl
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "ec2-deployment/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 创建 VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# 创建公网网关
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 获取可用区
data "aws_availability_zones" "available" {
  state = "available"
}

# 创建子网
resource "aws_subnet" "public" {
  count             = length(data.aws_availability_zones.available.names)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "${var.project_name}-public-${count.index}"
  }
}

# 路由表
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
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# 安全组
resource "aws_security_group" "web" {
  name_prefix = "${var.project_name}-web-"
  description = "Security group for web server"
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
    description = "SSH from trusted IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidr
  }
  
  # 出站规则
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  lifecycle {
    create_before_destroy = true
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

# 创建 EC2 实例
resource "aws_instance" "web" {
  count                  = var.instance_count
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public[count.index % length(aws_subnet.public)].id
  vpc_security_group_ids = [aws_security_group.web.id]
  
  # 用户数据脚本
  user_data = <<-EOF
              #!/bin/bash
              # 更新系统
              yum update -y
              
              # 安装 Apache
              yum install -y httpd
              
              # 启动服务
              systemctl start httpd
              systemctl enable httpd
              
              # 创建自定义页面
              echo "<h1>Hello from Terraform!</h1>" > /var/www/html/index.html
              echo "<p>Instance: ${var.project_name}-web-${count.index + 1}</p>" >> /var/www/html/index.html
              echo "<p>Deployed at: $(date)</p>" >> /var/www/html/index.html
              EOF
  
  # 密钥对（如已有）
  key_name = var.key_name
  
  # 根卷配置
  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    delete_on_termination = true
    encrypted             = true
  }
  
  tags = {
    Name    = "${var.project_name}-web-${count.index + 1}"
    Purpose = "WebServer"
  }
  
  # 等待实例就绪
  depends_on = [aws_internet_gateway.main]
}
```

### 2. variables.tf

```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "myapp"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
  
  validation {
    condition     = can(regex("^t[23]\\.(micro|small|medium|large|xlarge)$", var.instance_type))
    error_message = "Instance type must be t2 or t3 family"
  }
}

variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 2
  
  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10"
  }
}

variable "ssh_allowed_cidr" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "key_name" {
  description = "AWS key pair name for SSH access"
  type        = string
  default     = null
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 20
  
  validation {
    condition     = var.root_volume_size >= 8 && var.root_volume_size <= 100
    error_message = "Volume size must be between 8 and 100 GB"
  }
}
```

### 3. outputs.tf

```hcl
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "security_group_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "instance_ids" {
  description = "IDs of created EC2 instances"
  value       = aws_instance.web[*].id
}

output "instance_public_ips" {
  description = "Public IP addresses of instances"
  value       = aws_instance.web[*].public_ip
}

output "instance_private_ips" {
  description = "Private IP addresses of instances"
  value       = aws_instance.web[*].private_ip
}

output "web_url" {
  description = "URL to access web servers"
  value       = "http://${aws_instance.web[0].public_ip}"
}
```

### 4. terraform.tfvars.example

```hcl
# AWS 配置
aws_region   = "us-east-1"

# 项目配置
project_name = "myapp"
environment  = "dev"

# 网络配置
vpc_cidr     = "10.0.0.0/16"

# 实例配置
instance_type   = "t3.micro"
instance_count  = 2
root_volume_size = 20

# SSH 配置
ssh_allowed_cidr = ["YOUR_IP/32"]
key_name         = "your-key-pair-name"
```

### 部署步骤

```bash
# 1. 克隆/创建项目
mkdir aws-ec2-deployment && cd aws-ec2-deployment

# 2. 创建上述文件

# 3. 配置 AWS CLI
aws configure

# 4. 配置变量文件
cp terraform.tfvars.example terraform.tfvars
# 编辑 terraform.tfvars 填入实际值

# 5. 初始化
terraform init

# 6. 格式化代码
terraform fmt

# 7. 验证配置
terraform validate

# 8. 查看执行计划
terraform plan

# 9. 应用配置
terraform apply

# 10. 查看输出
terraform output

# 11. 访问 Web 服务器
curl http://$(terraform output -raw instance_public_ips | head -1)
```

### 清理资源

```bash
# 销毁所有资源
terraform destroy

# 或指定变量文件
terraform destroy -var-file="production.tfvars"
```

---

## 实战案例二：多模块架构

### 场景描述

构建一个三层架构的应用，包含 VPC、RDS 数据库和 ALB 负载均衡。

### 项目结构

```
three-tier-app/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── loadbalancer/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── README.md
```

### 主配置 main.tf

```hcl
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "three-tier-app/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC 模块
module "vpc" {
  source = "./modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  
  availability_zones = var.availability_zones
  
  enable_nat_gateway   = var.environment == "prod"
  enable_vpn_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = var.common_tags
}

# 数据库模块
module "database" {
  source = "./modules/database"
  
  project_name = var.project_name
  environment  = var.environment
  
  # 网络配置
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  
  # 数据库配置
  engine            = var.db_engine
  engine_version    = var.db_engine_version
  instance_class    = var.db_instance_class
  allocated_storage = var.db_storage
  storage_type      = "gp3"
  storage_encrypted = var.environment == "prod"
  
  # 凭证（从 Secrets Manager 或变量获取）
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  # 备份配置
  backup_retention_period = var.db_backup_retention
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  
  # 高可用
  multi_az               = var.environment == "prod"
  
  tags = var.common_tags
}

# 计算模块
module "compute" {
  source = "./modules/compute"
  
  project_name = var.project_name
  environment  = var.environment
  
  # 网络配置
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  
  # 实例配置
  ami_id          = var.ami_id
  instance_type   = var.instance_type
  instance_count  = var.instance_count
  key_name        = var.key_name
  
  # 安全配置
  allowed_cidr = var.vpc_cidr
  
  # 数据库连接
  db_endpoint = module.database.db_endpoint
  db_name     = module.database.db_name
  db_username = module.database.db_username
  
  # ALB 目标组
  target_group_arns = [module.loadbalancer.target_group_arn]
  
  tags = var.common_tags
}

# 负载均衡模块
module "loadbalancer" {
  source = "./modules/loadbalancer"
  
  project_name = var.project_name
  environment  = var.environment
  
  # 网络配置
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  
  # ALB 配置
  internal           = false
  certificate_arn    = var.ssl_certificate_arn
  
  # 安全配置
  allowed_cidr = ["0.0.0.0/0"]
  
  tags = var.common_tags
}
```

### VPC 模块示例

```hcl
# modules/vpc/main.tf

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-vpc" }
  )
}

# 公有子网
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-public-${var.availability_zones[count.index]}"
      Type = "public"
    }
  )
}

# 私有子网
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-private-${var.availability_zones[count.index]}"
      Type = "private"
    }
  )
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-igw" }
  )
}

# NAT Gateway（按需）
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-nat-eip" }
  )
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-nat" }
  )
  
  depends_on = [aws_eip.nat]
}

# 路由表
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-public-rt" }
  )
}

resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? 1 : 0
  vpc_id = aws_vpc.main.id
  
  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[0].id
    }
  }
  
  tags = merge(
    var.tags,
    { Name = "${var.project_name}-${var.environment}-private-rt" }
  )
}

# 路由表关联
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = var.enable_nat_gateway ? length(aws_subnet.private) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
}
```

### 模块输出定义

```hcl
# modules/vpc/outputs.tf

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}
```

---

## 最佳实践

### 1. 代码组织

```
recommended-structure/
├── environments/
│   ├── dev/
│   │   ├── backend.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
├── modules/
│   ├── vpc/
│   ├── compute/
│   └── networking/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
```

### 2. 状态管理最佳实践

#### 远程状态存储

```hcl
# 推荐：使用 S3 + DynamoDB 锁定
terraform {
  backend "s3" {
    bucket         = "company-terraform-state"
    key            = "apps/${var.project_name}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "alias/terraform-state-key"
    dynamodb_table = "terraform-state-locks"
  }
}
```

#### 状态分离策略

```hcl
# 大型项目应分离状态
terraform {
  # 网络/基础设施状态
  backend "s3" {
    key = "infrastructure/network/terraform.tfstate"
  }
}

terraform {
  # 应用状态
  backend "s3" {
    key = "apps/app-service/terraform.tfstate"
  }
}
```

### 3. 安全最佳实践

#### 敏感数据管理

```hcl
# ❌ 不推荐：明文密码
variable "db_password" {
  default = "MyPassword123"
}

# ✅ 推荐：从环境变量读取
variable "db_password" {
  type      = string
  sensitive = true
}

# 从环境变量读取
# export TF_VAR_db_password="secret"

# ✅ 更佳：使用 AWS Secrets Manager
data "aws_secretsmanager_secret" "db" {
  name = "prod/db/credentials"
}

data "aws_secretsmanager_secret_version" "db" {
  secret_id = data.aws_secretsmanager_secret.db.id
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db.secret_string
}
```

#### 加密配置

```hcl
# 启用资源加密
resource "aws_s3_bucket" "logs" {
  bucket = "${var.project_name}-logs"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_ebs_volume" "data" {
  encrypted = true
  kms_key_id = aws_kms_key.data.arn
}
```

### 4. 变量管理

#### 变量定义规范

```hcl
# ✅ 推荐：完整的变量定义
variable "instance_type" {
  description = "EC2 instance type for application servers"
  type        = string
  default     = "t3.medium"
  
  validation {
    condition     = contains(["t3.medium", "t3.large", "t3.xlarge"], var.instance_type)
    error_message = "Instance type must be t3.medium, t3.large, or t3.xlarge"
  }
}

variable "auto_scaling_config" {
  description = "Auto scaling configuration"
  type = object({
    min_size = number
    max_size = number
    desired_capacity = number
  })
  default = {
    min_size         = 2
    max_size         = 10
    desired_capacity = 2
  }
  
  validation {
    condition     = var.auto_scaling_config.min_size <= var.auto_scaling_config.desired_capacity
    error_message = "min_size must be less than or equal to desired_capacity"
  }
}
```

### 5. 依赖管理

#### 显式依赖

```hcl
# ✅ 使用 depends_on 显式声明依赖
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  depends_on = [
    aws_db_instance.main,
    aws_elasticache_cluster.redis
  ]
}
```

#### 隐式依赖（推荐）

```hcl
# ✅ 使用资源引用创建隐式依赖
resource "aws_security_group" "app" {
  name = "app-sg"
}

resource "aws_instance" "app" {
  vpc_security_group_ids = [aws_security_group.app.id]
  # 隐式依赖：aws_security_group.app
}
```

### 6. 生命周期管理

```hcl
# 防止意外删除
resource "aws_s3_bucket" "important-data" {
  bucket = "${var.project_name}-data"
  
  lifecycle {
    prevent_destroy = true
  }
}

# 创建后替换
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  lifecycle {
    create_before_destroy = true
  }
}

# 忽略特定变更
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  lifecycle {
    ignore_changes = [
      instance_type,  # 允许手动调整实例大小
      user_data       # 允许手动修改启动脚本
    ]
  }
}
```

### 7. 工作流自动化

#### GitOps 集成

```bash
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: latest
      
      - name: Terraform Init
        run: terraform init
        env:
          AWS Credentials: ${{ secrets.AWS_CREDENTIALS }}
      
      - name: Terraform Format Check
        run: terraform fmt -check
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
        continue-on-error: true
      
      - name: Terraform Apply (main only)
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve tfplan
```

---

## 常见问题与解决方案

### 1. 状态文件问题

#### 问题：状态文件锁定

```bash
# 查看锁信息
terraform force-unlock <LOCK_ID>

# 强制解锁（谨慎使用）
terraform force-unlock -force <LOCK_ID>
```

#### 问题：状态漂移

```bash
# 刷新状态
terraform refresh

# 重建状态
terraform state pull > terraform.tfstate
terraform state push terraform.tfstate
```

### 2. 资源导入

```bash
# 导入现有资源到 Terraform
# 1. 在代码中定义资源
resource "aws_instance" "existing" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}

# 2. 导入资源
terraform import aws_instance.existing i-1234567890abcdef0

# 3. 更新状态
terraform plan
```

### 3. 版本迁移

```hcl
# 使用 Terraform 版本约束
terraform {
  required_version = ">= 1.0.0, < 2.0.0"
}

# Provider 版本管理
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0, < 6.0"
    }
  }
}
```

### 4. 性能优化

```bash
# 并行操作（-parallelism）
terraform apply -parallelism=10

# 禁用详细日志（加速执行）
export TF_LOG=ERROR
terraform apply
```

### 5. 环境变量管理

```bash
# AWS 凭证
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Terraform 变量
export TF_VAR_instance_type="t3.large"
export TF_VAR_environment="production"

# 禁用颜色输出（CI 环境）
export TF_NO_COLOR=1
export TF_CLI_CONFIG_FILE="$HOME/.terraformrc"
```

### 6. 调试技巧

```bash
# 启用调试日志
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform-debug.log

# 查看详细计划
terraform plan -detail

# 图形化依赖关系
terraform graph | dot -Tpng > graph.png

# 输出特定资源
terraform show -json > output.json
```

---

## 学习资源

### 官方文档
- [Terraform 官方文档](https://developer.hashicorp.com/terraform/docs)
- [Provider Registry](https://registry.terraform.io/)
- [Terraform Module Registry](https://registry.terraform.io/modules)

### 推荐课程
- [Terraform: Up & Running](https://www.terraformupandrunning.com/)
- [HashiCorp Certified: Terraform Associate](https://www.hashicorp.com/certification/terraform-associate)

### 社区资源
- [Awesome Terraform](https://github.com/shinhwag/awesome-terraform)
- [Terraform Weekly](https://terraform-weekly.com/)

### 模块仓库
- [terraform-aws-modules](https://github.com/terraform-aws-modules)
- [terraform-aws-vpc](https://github.com/terraform-aws-modules/terraform-aws-vpc)
- [terraform-aws-ec2-instance](https://github.com/terraform-aws-modules/terraform-aws-ec2-instance)

---

## 总结

Terraform 作为 IaC 的代表工具，已经成为了现代 DevOps 实践中的标准配置。通过本教程，你应该能够：

1. ✅ 理解 Terraform 的核心概念和工作原理
2. ✅ 从零开始编写 Terraform 配置
3. ✅ 部署实际的云基础设施
4. ✅ 使用模块构建可复用的架构
5. ✅ 应用最佳实践确保安全与可维护性

### 下一步学习建议

- **深入学习**：探索更复杂的模块设计和工作空间
- **CI/CD 集成**：将 Terraform 集成到自动化流水线
- **多环境管理**：使用 Terraform Workspace 或目录结构管理多环境
- **安全加固**：学习 Terraform Cloud/Enterprise 的企业级功能
- **生态扩展**：结合 Packer、Consul、Vault 等工具构建完整的 DevOps 工具链

> **最后提醒**：生产环境务必使用远程状态、锁定机制和适当的权限控制！

---

*文档版本：v1.0*  
*更新日期：2026-06-22*  
*适用 Terraform 版本：≥ 1.5.0*
