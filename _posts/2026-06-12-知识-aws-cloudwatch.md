---
layout: post
title: "AWS 云平台的全科医生 — CloudWatch 监控服务"
date: 2026-06-12
tags: [知识, 开发, DevOps, AWS, 监控, 云计算]
header-style: 'text'
subtitle: "24小时监控诊断所有 AWS 服务的健康状况"
---

> 📚 知识关键词：AWS CloudWatch、监控、日志、告警、DevOps、可观测性

## 📌 一句话总结
AWS 云平台的"全科医生"，24小时监控诊断所有服务的健康状况。

---

## 🎯 这是什么？

### 基础定义
AWS CloudWatch 是亚马逊云科技（AWS）提供的监控和可观测性服务，用于收集日志、指标和事件，帮助您监控 AWS 资源和应用程序的健康状况。

### 通俗类比

**想象一家大型医院的监控中心**：

- **AWS 资源** = 病人（EC2、RDS、Lambda 等）
- **CloudWatch** = 全科医生+监护仪+病历系统
- **Metrics（指标）** = 生命体征（心率、血压、体温）
- **Logs（日志）** = 病历记录
- **Alarms（告警）** = 心电监护仪报警
- **Dashboards（仪表板）** = 护士站的监控大屏
- **Events（事件）** = 病情变化记录

没有 CloudWatch，就像医院没有监护仪，病人出问题了才知道；有了 CloudWatch，可以实时监控、提前预警、快速诊断。

**另一个类比**：
- **传统监控** = 每天早上问一次"你还好吗？"（被动监控）
- **CloudWatch** = 24小时心电图监控+智能预警（主动监控）

### 为什么存在

当您在 AWS 上运行应用时，会遇到的问题：

- 🚨 **服务器什么时候会挂？** → CloudWatch 实时监控，提前预警
- 📈 **流量突增时是否正常？** → CloudWatch 自动扩展
- 🔍 **应用出问题了怎么排查？** → CloudWatch 日志分析
- 💰 **资源使用是否合理？** → CloudWatch 成本优化
- 📊 **老板要看到整体状况？** → CloudWatch 仪表板

---

## 🏗️ 核心原理

### 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS CloudWatch                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              数据收集层                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │ Metrics  │  │  Logs    │  │ Events   │          │ │
│  │  │ 指标数据  │  │  日志数据 │  │  事件数据 │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              数据处理层                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │Alarms    │  │Insights  │  │Canaries  │          │ │
│  │  │ 告警规则  │  │ 智能分析 │  │ 监控探针 │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
│                           ↓                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              可视化与操作层                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │Dashboards│  │  Lambda  │  │  SNS     │          │ │
│  │  │ 仪表板   │  │ 自动化   │  │ 通知服务 │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 关键概念

#### 1. Metrics（指标）

**专业说**：随时间变化的数据点，表示 AWS 资源的性能或状态

**通俗说**：像"生命体征"，定期记录的数值（心率、血压等）

**类型**：
- **标准指标**：AWS 自动收集（如 CPUUtilization、DiskReadBytes）
- **自定义指标**：应用程序通过 API 上报

**维度**：
- 命名空间：如 AWS/EC2、AWS/RDS
- 指标名称：如 CPUUtilization
- 维度：如 InstanceId、AutoScalingGroupName

**示例**：
```python
# Python：使用 Boto3 发送自定义指标
import boto3

cloudwatch = boto3.client('cloudwatch')

# 发送自定义指标
response = cloudwatch.put_metric_data(
    Namespace='MyApplication',
    MetricData=[
        {
            'MetricName': 'OrderCount',
            'Value': 100,
            'Unit': 'Count',
            'Dimensions': [
                {
                    'Name': 'Environment',
                    'Value': 'Production'
                },
                {
                    'Name': 'Region',
                    'Value': 'us-east-1'
                }
            ],
            'Timestamp': datetime.datetime.now(),
            'StorageResolution': 60  # 1分钟精度
        },
    ]
)

# 批量发送指标
response = cloudwatch.put_metric_data(
    Namespace='MyApplication',
    MetricData=[
        {
            'MetricName': 'RequestLatency',
            'Value': 150,
            'Unit': 'Milliseconds',
            'Dimensions': [{'Name': 'Service', 'Value': 'API'}]
        },
        {
            'MetricName': 'ErrorRate',
            'Value': 0.5,
            'Unit': 'Percent',
            'Dimensions': [{'Name': 'Service', 'Value': 'API'}]
        }
    ]
)
```

```bash
# AWS CLI：查询指标
aws cloudwatch list-metrics --namespace AWS/EC2

# AWS CLI：获取指标统计数据
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2024-06-01T00:00:00Z \
  --end-time 2024-06-01T23:59:59Z \
  --period 300 \
  --statistics Average,Maximum,Minimum
```

#### 2. Logs（日志）

**专业说**：系统、应用程序和服务的文本记录，用于故障排查和审计

**通俗说**：像"病历本"，记录发生了什么事

**功能**：
- **日志收集**：自动收集 EC2、Lambda、CloudTrail 等日志
- **日志搜索**：快速查找特定内容
- **日志分析**：使用 CloudWatch Logs Insights 分析

**示例**：
```bash
# 创建日志组
aws logs create-log-group --log-group-name /aws/lambda/my-function

# 创建日志流
aws logs create-log-stream \
  --log-group-name /aws/lambda/my-function \
  --log-stream-name 2024/06/12/[$LATEST]abc123

# 发送日志事件
aws logs put-log-events \
  --log-group-name /aws/lambda/my-function \
  --log-stream-name 2024/06/12/[$LATEST]abc123 \
  --log-events timestamp=1686528000000,message="Starting execution"

# 查询日志（Insights）
aws logs start-query \
  --log-group-name /aws/lambda/my-function \
  --start-time 1686528000 \
  --end-time 1686614400 \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc'
```

**CloudWatch Logs Insights 查询语法**：
```sql
-- 查询所有错误日志
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc

-- 统计错误类型
fields @message
| filter @message like /ERROR/
| parse @message "ERROR: *" as errorMessage
| stats count(*) by errorMessage
| sort count desc

-- 查询 Lambda 执行时间
fields @timestamp, @duration
| filter @message like /REPORT/
| sort @duration desc
| limit 10

-- 查询 API 请求延迟
fields @timestamp, latency
| parse @message "* latency: *" as requestId, latency
| filter latency > 1000
| stats avg(latency), max(latency), min(latency)
```

#### 3. Alarms（告警）

**专业说**：监控指标的状态变化，达到阈值时触发通知或自动操作

**通俗说**：像"心电监护仪报警"，异常时自动提醒

**告警状态**：
- **OK**：正常
- **ALARM**：告警触发
- **INSUFFICIENT_DATA**：数据不足

**操作**：
- 发送 SNS 通知
- 执行 Lambda 函数
- 停止/启动 EC2 实例
- 执行 Auto Scaling 策略

**示例**：
```python
# Python：创建告警
import boto3

cloudwatch = boto3.client('cloudwatch')

# 创建 CPU 使用率告警
response = cloudwatch.put_metric_alarm(
    AlarmName='HighCPUAlarm',
    AlarmDescription='Alert when CPU exceeds 80%',
    ActionsEnabled=True,
    OKActions=['arn:aws:sns:us-east-1:123456789012:OKTopic'],
    AlarmActions=['arn:aws:sns:us-east-1:123456789012:AlarmTopic'],
    InsufficientDataActions=['arn:aws:sns:us-east-1:123456789012:InsufficientTopic'],
    MetricName='CPUUtilization',
    Namespace='AWS/EC2',
    Statistic='Average',
    Period=300,  # 5分钟
    EvaluationPeriods=2,  # 连续2个周期
    Threshold=80.0,
    ComparisonOperator='GreaterThanThreshold',
    Dimensions=[
        {
            'Name': 'InstanceId',
            'Value': 'i-1234567890abcdef0'
        },
    ]
)

# 创建 Lambda 错误告警
response = cloudwatch.put_metric_alarm(
    AlarmName='LambdaErrorsAlarm',
    AlarmDescription='Alert on Lambda function errors',
    MetricName='Errors',
    Namespace='AWS/Lambda',
    Statistic='Sum',
    Period=60,
    EvaluationPeriods=1,
    Threshold=5,
    ComparisonOperator='GreaterThanThreshold',
    Dimensions=[
        {
            'Name': 'FunctionName',
            'Value': 'my-lambda-function'
        },
    ]
)
```

```bash
# AWS CLI：创建告警
aws cloudwatch put-metric-alarm \
  --alarm-name HighCPUAlarm \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:AlarmTopic

# 列出所有告警
aws cloudwatch describe-alarms

# 禁用告警
aws cloudwatch disable-alarm-actions --alarm-names HighCPUAlarm

# 启用告警
aws cloudwatch enable-alarm-actions --alarm-names HighCPUAlarm

# 删除告警
aws cloudwatch delete-alarms --alarm-names HighCPUAlarm
```

#### 4. Dashboards（仪表板）

**专业说**：可视化展示多个指标和日志的集中视图

**通俗说**：像"监控大屏"，一眼看到所有重要信息

**功能**：
- 自定义布局
- 实时更新
- 多种图表类型（折线图、堆叠图、饼图等）
- 支持导出和分享

**示例**：
```python
# Python：创建仪表板
import boto3
import json

cloudwatch = boto3.client('cloudwatch')

# 创建仪表板
dashboard_body = {
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 6,
            "height": 6,
            "properties": {
                "metrics": [
                    ["AWS/EC2", "CPUUtilization", "InstanceId", "i-1234567890abcdef0", {"stat": "Average"}],
                    [".", "NetworkIn", ".", ".", {"stat": "Sum"}],
                    [".", "NetworkOut", ".", ".", {"stat": "Sum"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "EC2 Instance Metrics"
            }
        },
        {
            "type": "log",
            "x": 6,
            "y": 0,
            "width": 6,
            "height": 6,
            "properties": {
                "logGroupName": "/aws/lambda/my-function",
                "region": "us-east-1",
                "title": "Lambda Function Logs",
                "query": "* | filter @message like /ERROR/",
                "view": "table"
            }
        }
    ]
}

response = cloudwatch.put_dashboard(
    DashboardName='MyApplicationDashboard',
    DashboardBody=json.dumps(dashboard_body)
)
```

```bash
# AWS CLI：创建仪表板
cat > dashboard.json << EOF
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          ["AWS/EC2", "CPUUtilization", {"stat": "Average"}],
          [".", "NetworkIn", ".", {"stat": "Sum"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "EC2 Metrics"
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --dashboard-name MyDashboard \
  --dashboard-body file://dashboard.json

# 列出所有仪表板
aws cloudwatch list-dashboards

# 获取仪表板
aws cloudwatch get-dashboard --dashboard-name MyDashboard

# 删除仪表板
aws cloudwatch delete-dashboards --dashboard-names MyDashboard
```

#### 5. Events（事件）

**专业说**：表示 AWS 资源状态变化的实时流

**通俗说**：像"病历记录"，记录发生了什么事

**EventBridge（原 CloudWatch Events）**：
- 规则匹配：根据模式匹配事件
- 目标触发：触发 Lambda、SNS、SQS 等
- 计划任务：类似 cron 的定时任务

**示例**：
```python
# Python：创建事件规则
import boto3
import json

events = boto3.client('events')

# 创建定时任务
response = events.put_rule(
    Name='HourlyBackup',
    ScheduleExpression='rate(1 hour)',  # 每小时
    State='ENABLED',
    Description='Run hourly backup'
)

# 添加目标
response = events.put_targets(
    Rule='HourlyBackup',
    Targets=[
        {
            'Id': '1',
            'Arn': 'arn:aws:lambda:us-east-1:123456789012:function:BackupFunction',
            'Input': json.dumps({'backup_type': 'hourly'}),
            'RoleArn': 'arn:aws:iam::123456789012:role:EventsInvokeLambdaRole'
        }
    ]
)

# 创建事件模式匹配规则
response = events.put_rule(
    Name='EC2StateChange',
    EventPattern=json.dumps({
        "source": ["aws.ec2"],
        "detail-type": ["EC2 Instance State-change Notification"],
        "detail": {
            "state": ["running"]
        }
    }),
    State='ENABLED'
)
```

#### 6. CloudWatch Synthetics（监控探针）

**专业说**：可以监控端点和 API 的 Canary 脚本

**通俗说**：像"体检机器人"，定期检查应用是否正常

**功能**：
- 端点监控：检查网站可访问性
- API 监控：检查 API 响应
- 性能监控：检查响应时间
- 内容验证：检查返回内容

**示例**：
```python
# Canary 脚本示例（Node.js）
var synthesize = require('synthetics');

// API 监控
exports.handler = async function() {
  const response = await synthesize.executeUrl('https://api.example.com/health', {
    validateResponse: function(res) {
      if (res.statusCode !== 200) {
        throw new Error('Expected 200 OK, got ' + res.statusCode);
      }
      const body = JSON.parse(res.body);
      if (body.status !== 'healthy') {
        throw new Error('Health check failed');
      }
    }
  });
  return response;
};

// 网页监控
exports.handler = async function() {
  const page = await synthesize.getPage();
  await page.goto('https://example.com');
  
  // 等待特定元素
  await page.waitForSelector('#main-content', {timeout: 5000});
  
  // 检查标题
  const title = await page.title();
  if (!title.includes('Example')) {
    throw new Error('Page title does not contain "Example"');
  }
  
  // 截图
  await page.screenshot();
  return page;
};
```

#### 7. CloudWatch Agent

**专业说**：安装在 EC2 或本地服务器的代理，收集系统和应用指标

**通俗说**：像"家庭医生助理"，定期检查各项指标

**功能**：
- 收集系统指标：CPU、内存、磁盘、网络
- 收集应用日志
- 收集自定义指标

**配置示例**：
```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "region": "us-east-1"
  },
  "metrics": {
    "namespace": "MyServer",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_active", "cpu_usage_idle"]
      },
      "mem": {
        "measurement": ["mem_used_percent"]
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["*"]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/myapp/*.log",
            "log_group_name": "/var/log/myapp",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

---

## 📜 发展背景

### 起源
- **2009年**：CloudWatch 随 AWS EC2 一起发布
- **动机**：提供云资源的监控能力，让用户了解资源使用情况

### 演进历程

| 年份 | 里程碑 |
|------|--------|
| 2009 | CloudWatch 发布，监控 EC2 |
| 2011 | 支持自定义指标 |
| 2014 | CloudWatch Logs 发布 |
| 2015 | CloudWatch Alarms 增强 |
| 2016 | CloudWatch Events 发布 |
| 2018 | CloudWatch Insights 发布 |
| 2019 | CloudWatch Synthetics 发布 |
| 2020 | Contributor Insights 发布 |
| 2021 | Container Insights 发布 |
| 2022 | EKS 加权支持 |
| 2023 | CloudWatch Logs Insights 查询增强 |
| 2024 | Application Signals 发布 |

### 当前状态
- **地位**：AWS 可观测性的核心服务
- **市场**：所有主流云厂商都有类似服务
- **生态**：与 AWS 所有服务深度集成
- **应用**：几乎所有 AWS 用户都在使用

---

## 💼 应用场景

### 场景 1：EC2 实例监控

**痛点**：EC2 实例性能问题不知道，用户投诉才发现。

**解决方案**：用 CloudWatch 全面监控 EC2 实例。

**具体实现**：

```python
# 监控脚本
import boto3
import psutil
import time

cloudwatch = boto3.client('cloudwatch')
INSTANCE_ID = 'i-1234567890abcdef0'

def send_metrics():
    """发送自定义指标"""
    # CPU 使用率
    cpu_percent = psutil.cpu_percent(interval=1)
    
    # 内存使用率
    memory = psutil.virtual_memory()
    memory_percent = memory.percent
    
    # 磁盘使用率
    disk = psutil.disk_usage('/')
    disk_percent = disk.percent
    
    # 发送到 CloudWatch
    cloudwatch.put_metric_data(
        Namespace='CustomMetrics',
        MetricData=[
            {
                'MetricName': 'CPUUtilization',
                'Value': cpu_percent,
                'Unit': 'Percent',
                'Dimensions': [{'Name': 'InstanceId', 'Value': INSTANCE_ID}]
            },
            {
                'MetricName': 'MemoryUtilization',
                'Value': memory_percent,
                'Unit': 'Percent',
                'Dimensions': [{'Name': 'InstanceId', 'Value': INSTANCE_ID}]
            },
            {
                'MetricName': 'DiskUtilization',
                'Value': disk_percent,
                'Unit': 'Percent',
                'Dimensions': [{'Name': 'InstanceId', 'Value': INSTANCE_ID}]
            }
        ]
    )

def create_alarms():
    """创建告警"""
    # CPU 告警
    cloudwatch.put_metric_alarm(
        AlarmName='HighCPUAlarm',
        MetricName='CPUUtilization',
        Namespace='AWS/EC2',
        Statistic='Average',
        Period=300,
        EvaluationPeriods=2,
        Threshold=80,
        ComparisonOperator='GreaterThanThreshold',
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic'],
        Dimensions=[{'Name': 'InstanceId', 'Value': INSTANCE_ID}]
    )
    
    # 内存告警
    cloudwatch.put_metric_alarm(
        AlarmName='HighMemoryAlarm',
        MetricName='MemoryUtilization',
        Namespace='CustomMetrics',
        Statistic='Average',
        Period=300,
        EvaluationPeriods=2,
        Threshold=85,
        ComparisonOperator='GreaterThanThreshold',
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic'],
        Dimensions=[{'Name': 'InstanceId', 'Value': INSTANCE_ID}]
    )

if __name__ == '__main__':
    while True:
        send_metrics()
        time.sleep(60)  # 每分钟发送一次
```

**创建监控仪表板**：
```python
def create_ec2_dashboard():
    """创建 EC2 监控仪表板"""
    dashboard_body = {
        "widgets": [
            # CPU 使用率图表
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 6,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/EC2", "CPUUtilization", "InstanceId", INSTANCE_ID, {"stat": "Average"}]
                    ],
                    "period": 300,
                    "stat": "Average",
                    "region": "us-east-1",
                    "title": "CPU Utilization",
                    "yAxis": {"left": {"max": 100, "min": 0}}
                }
            },
            # 网络流量图表
            {
                "type": "metric",
                "x": 6,
                "y": 0,
                "width": 6,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/EC2", "NetworkIn", "InstanceId", INSTANCE_ID, {"stat": "Sum"}],
                        [".", "NetworkOut", ".", {"stat": "Sum"}]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "Network Traffic"
                }
            },
            # 磁盘 I/O 图表
            {
                "type": "metric",
                "x": 0,
                "y": 6,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/EC2", "DiskReadBytes", "InstanceId", INSTANCE_ID, {"stat": "Sum"}],
                        [".", "DiskWriteBytes", ".", {"stat": "Sum"}]
                    ],
                    "period": 300,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "Disk I/O"
                }
            }
        ]
    }
    
    cloudwatch.put_dashboard(
        DashboardName='EC2-' + INSTANCE_ID,
        DashboardBody=json.dumps(dashboard_body)
    )
```

**效果**：
- 📊 **实时监控**：CPU、内存、网络、磁盘一目了然
- 🚨 **自动告警**：异常时自动通知运维团队
- 📈 **趋势分析**：了解资源使用趋势
- 💰 **成本优化**：发现资源浪费

---

### 场景 2：Lambda 函数监控

**痛点**：Lambda 函数执行失败不知道，错误日志分散难以查找。

**解决方案**：用 CloudWatch 全面监控 Lambda 函数。

**具体实现**：

```python
# Lambda 函数代码（添加自定义指标）
import boto3
import json
import time
from contextlib import contextmanager

cloudwatch = boto3.client('cloudwatch')

def put_metric(metric_name, value, unit='Count', dimensions=None):
    """发送自定义指标"""
    if dimensions is None:
        dimensions = []
    
    cloudwatch.put_metric_data(
        Namespace='MyApplication',
        MetricData=[{
            'MetricName': metric_name,
            'Value': value,
            'Unit': unit,
            'Dimensions': dimensions,
            'Timestamp': time.time()
        }]
    )

@contextmanager
def timer(metric_name, dimensions=None):
    """计时器上下文管理器"""
    start = time.time()
    try:
        yield
    finally:
        duration = (time.time() - start) * 1000  # 转换为毫秒
        put_metric(metric_name, duration, 'Milliseconds', dimensions)

def lambda_handler(event, context):
    """Lambda 处理函数"""
    function_name = context.function_name
    request_id = context.request_id
    
    dimensions = [
        {'Name': 'FunctionName', 'Value': function_name},
        {'Name': 'RequestId', 'Value': request_id}
    ]
    
    try:
        # 记录开始
        put_metric('InvocationCount', 1, 'Count', dimensions)
        
        # 业务逻辑
        with timer('ExecutionTime', dimensions):
            # 模拟业务处理
            time.sleep(0.5)
            result = process_order(event)
        
        # 成功指标
        put_metric('SuccessCount', 1, 'Count', dimensions)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        # 错误指标
        put_metric('ErrorCount', 1, 'Count', dimensions)
        print(f"Error: {str(e)}")
        raise

def process_order(event):
    """处理订单"""
    # 业务逻辑
    return {'orderId': '12345', 'status': 'processed'}
```

**创建 Lambda 告警**：
```python
def create_lambda_alarms(function_name):
    """创建 Lambda 函数告警"""
    # 错误告警
    cloudwatch.put_metric_alarm(
        AlarmName=f'{function_name}-Errors',
        AlarmDescription='Alert on Lambda function errors',
        MetricName='Errors',
        Namespace='AWS/Lambda',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=5,
        ComparisonOperator='GreaterThanThreshold',
        Dimensions=[{'Name': 'FunctionName', 'Value': function_name}],
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic']
    )
    
    # 执行时间告警
    cloudwatch.put_metric_alarm(
        AlarmName=f'{function_name}-Duration',
        AlarmDescription='Alert on Lambda function duration',
        MetricName='Duration',
        Namespace='AWS/Lambda',
        Statistic='Average',
        Period=300,
        EvaluationPeriods=1,
        Threshold=10000,  # 10秒
        ComparisonOperator='GreaterThanThreshold',
        Dimensions=[{'Name': 'FunctionName', 'Value': function_name}],
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic']
    )
    
    # 节流告警
    cloudwatch.put_metric_alarm(
        AlarmName=f'{function_name}-Throttles',
        AlarmDescription='Alert on Lambda throttles',
        MetricName='Throttles',
        Namespace='AWS/Lambda',
        Statistic='Sum',
        Period=300,
        EvaluationPeriods=1,
        Threshold=1,
        ComparisonOperator='GreaterThanThreshold',
        Dimensions=[{'Name': 'FunctionName', 'Value': function_name}],
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic']
    )
```

**日志分析**：
```sql
-- CloudWatch Logs Insights 查询
-- 查询所有错误
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc

-- 统计错误类型
fields @message
| filter @message like /ERROR/
| parse @message "Error: *" as errorType
| stats count(*) by errorType
| sort count desc

-- 查询执行时间
fields @timestamp, duration
| filter @type = "REPORT"
| parse @message "Duration: * ms" as duration
| stats avg(duration), max(duration), min(duration) as duration

-- 查询特定请求
fields @timestamp, @message
| filter @message like /orderId-12345/
| sort @timestamp asc
```

**效果**：
- 📊 **完整监控**：调用次数、错误率、执行时间一目了然
- 🔍 **快速定位**：日志集中存储，快速查询
- 🚨 **自动告警**：异常时自动通知
- 💰 **成本优化**：发现长时间运行的函数

---

### 场景 3：API 监控

**痛点**：API 性能问题难以及时发现，用户体验差。

**解决方案**：用 CloudWatch Synthetics 监控 API。

**具体实现**：

**Canary 脚本**（Node.js）：
```javascript
// API 监控脚本
var synthetics = require('synthetics');
var assert = require('assert');

const API_BASE_URL = 'https://api.example.com';
const API_KEY = process.env.API_KEY;

// 设置请求头
const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

// GET 请求监控
exports.handler = async function() {
    const options = {
        headers: headers,
        validateResponse: function(res) {
            // 验证状态码
            if (res.statusCode !== 200) {
                throw new Error(`Expected 200, got ${res.statusCode}`);
            }
            
            // 验证响应体
            const body = JSON.parse(res.body);
            assert.ok(body.status === 'success', 'API status should be success');
            assert.ok(body.data !== undefined, 'Response should have data');
        }
    };
    
    const response = await synthetics.executeUrl(
        `${API_BASE_URL}/health`,
        options
    );
    
    return response;
};

// POST 请求监控
exports.handler = async function() {
    const startTime = Date.now();
    
    const options = {
        headers: headers,
        body: JSON.stringify({
            test: 'canary',
            timestamp: new Date().toISOString()
        }),
        validateResponse: function(res) {
            if (res.statusCode !== 201) {
                throw new Error(`Expected 201, got ${res.statusCode}`);
            }
        }
    };
    
    const response = await synthetics.executeUrl(
        `${API_BASE_URL}/orders`,
        {
            ...options,
            method: 'POST'
        }
    );
    
    // 记录自定义指标
    const duration = Date.now() - startTime;
    console.log(`API_RESPONSE_TIME: ${duration}ms`);
    
    return response;
};

// 复杂场景监控
exports.handler = async function() {
    const page = await synthetics.getPage();
    const startTime = Date.now();
    
    try {
        // 1. 获取认证令牌
        const authResponse = await page.evaluate(async (url, credentials) => {
            const response = await fetch(url + '/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentials)
            });
            return response.json();
        }, API_BASE_URL, {
            username: 'testuser',
            password: 'testpass'
        });
        
        assert.ok(authResponse.token, 'Should receive auth token');
        
        // 2. 创建订单
        const orderResponse = await page.evaluate(async (url, token, orderData) => {
            const response = await fetch(url + '/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            return response.json();
        }, API_BASE_URL, authResponse.token, {
            productId: '12345',
            quantity: 2
        });
        
        assert.ok(orderResponse.orderId, 'Should receive order ID');
        
        // 3. 查询订单
        const getResponse = await page.evaluate(async (url, token, orderId) => {
            const response = await fetch(url + '/orders/' + orderId, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.json();
        }, API_BASE_URL, authResponse.token, orderResponse.orderId);
        
        assert.ok(getResponse.status === 'pending', 'Order should be pending');
        
        // 记录成功指标
        const duration = Date.now() - startTime;
        console.log(`E2E_TEST_DURATION: ${duration}ms`);
        console.log(`E2E_TEST_STATUS: success`);
        
    } catch (error) {
        console.log(`E2E_TEST_STATUS: failed`);
        console.log(`E2E_TEST_ERROR: ${error.message}`);
        throw error;
    }
    
    await page.screenshot({
        path: '/tmp/canary-screenshot.png'
    });
};
```

**创建 Canary**：
```python
import boto3
import json

synthetics = boto3.client('synthetics')

# 创建 Canary
def create_canary():
    response = synthetics.create_canary(
        Name='API-Health-Check',
        Code={
            'S3Bucket': 'my-canary-scripts',
            'S3Key': 'api-health-check.zip',
            'Handler': 'index.handler'  # Node.js 处理函数
        },
        ArtifactS3Location='my-canary-artifacts',
        ExecutionInput={
            'API_BASE_URL': 'https://api.example.com',
            'API_KEY': 'your-api-key'
        },
        Schedule={
            'Expression': 'rate(5 minutes)',  # 每5分钟运行
            'DurationInSeconds': 300
        },
        RunConfig={
            'TimeoutInSeconds': 60,
            'MemoryInMB': 512,
            'ActiveTracing': True
        },
        SuccessRetentionPeriodInDays=30,
        FailureRetentionPeriodInDays=30,
        Tags=[
            {'Key': 'Environment', 'Value': 'Production'},
            {'Key': 'Application', 'Value': 'API'}
        ]
    )
    return response

# 创建 Canary 告警
def create_canary_alarms(canary_name):
    # 成功率告警
    cloudwatch.put_metric_alarm(
        AlarmName=f'{canary_name}-SuccessRate',
        AlarmDescription='Alert on Canary success rate',
        MetricName='SuccessPercent',
        Namespace='CloudWatchSynthetics',
        Statistic='Average',
        Period=300,
        EvaluationPeriods=1,
        Threshold=90,
        ComparisonOperator='LessThanThreshold',
        Dimensions=[
            {'Name': 'CanaryName', 'Value': canary_name}
        ],
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic']
    )
    
    # 执行时间告警
    cloudwatch.put_metric_alarm(
        AlarmName=f'{canary_name}-Duration',
        AlarmDescription='Alert on Canary duration',
        MetricName='Duration',
        Namespace='CloudWatchSynthetics',
        Statistic='Average',
        Period=300,
        EvaluationPeriods=1,
        Threshold=5000,  # 5秒
        ComparisonOperator='GreaterThanThreshold',
        Dimensions=[
            {'Name': 'CanaryName', 'Value': canary_name}
        ],
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:OpsTopic']
    )
```

**效果**：
- ✅ **主动监控**：定期主动检查 API 健康状况
- 🌍 **全球覆盖**：从多个区域监控
- 🔍 **端到端测试**：模拟真实用户场景
- 📊 **性能追踪**：记录响应时间
- 🎨 **截图记录**：失败时自动截图

---

### 场景 4：成本监控

**痛点**：AWS 账单突然暴涨，不知道是哪些服务造成的。

**解决方案**：用 CloudWatch 监控资源使用，优化成本。

**具体实现**：

**创建成本告警**：
```python
import boto3

ce = boto3.client('ce')
cloudwatch = boto3.client('cloudwatch')

# 设置预算告警
def create_cost_alarm():
    # 获取每日成本
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': '2024-06-01',
            'End': '2024-06-02'
        },
        Granularity='DAILY',
        Metrics=['BlendedCost'],
        GroupBy=[
            {'Type': 'DIMENSION', 'Key': 'SERVICE'}
        ]
    )
    
    # 发送自定义成本指标
    for result in response['ResultsByTime']:
        total_cost = 0
        for group in result['Groups']:
            service = group['Keys'][0]
            amount = float(group['Metrics']['BlendedCost']['Amount'])
            total_cost += amount
            
            # 发送服务级别指标
            cloudwatch.put_metric_data(
                Namespace='AWS/Cost',
                MetricData=[{
                    'MetricName': 'DailyCost',
                    'Value': amount,
                    'Unit': 'Count',
                    'Dimensions': [
                        {'Name': 'Service', 'Value': service},
                        {'Name': 'Currency', 'Value': 'USD'}
                    ],
                    'Timestamp': result['TimePeriod']['Start']
                }]
            )
        
        # 发送总成本指标
        cloudwatch.put_metric_data(
            Namespace='AWS/Cost',
            MetricData=[{
                'MetricName': 'TotalDailyCost',
                'Value': total_cost,
                'Unit': 'Count',
                'Dimensions': [{'Name': 'Currency', 'Value': 'USD'}],
                'Timestamp': result['TimePeriod']['Start']
            }]
        )
    
    # 创建成本告警
    cloudwatch.put_metric_alarm(
        AlarmName='HighDailyCostAlarm',
        AlarmDescription='Alert when daily cost exceeds threshold',
        MetricName='TotalDailyCost',
        Namespace='AWS/Cost',
        Statistic='Sum',
        Period=86400,  # 1天
        EvaluationPeriods=1,
        Threshold=100,  # $100
        ComparisonOperator='GreaterThanThreshold',
        AlarmActions=['arn:aws:sns:us-east-1:123456789012:FinanceTopic']
    )

# 创建资源使用告警
def create_resource_alarms():
    # EC2 未使用实例告警
    cloudwatch.put_metric_alarm(
        AlarmName='IdleEC2Instances',
        AlarmDescription='Alert on idle EC2 instances',
        MetricName='CPUUtilization',
        Namespace='AWS/EC2',
        Statistic='Average',
        Period=3600,  # 1小时
        EvaluationPeriods=24,  # 连续24小时
        Threshold=5,  # CPU < 5%
        ComparisonOperator='LessThanThreshold',
        TreatMissingData='notBreaching'
    )
    
    # EBS 未使用卷告警
    cloudwatch.put_metric_alarm(
        AlarmName='IdleEBSVolumes',
        AlarmDescription='Alert on idle EBS volumes',
        MetricName='VolumeIdleTime',
        Namespace='AWS/EBS',
        Statistic='Sum',
        Period=3600,
        EvaluationPeriods=24,
        Threshold=85500,  # 23.75小时（秒）
        ComparisonOperator='GreaterThanThreshold',
        TreatMissingData='notBreaching'
    )
    
    # RDS 未使用连接告警
    cloudwatch.put_metric_alarm(
        AlarmName='LowRDSConnections',
        AlarmDescription='Alert on low RDS connections',
        MetricName='DatabaseConnections',
        Namespace='AWS/RDS',
        Statistic='Average',
        Period=3600,
        EvaluationPeriods=168,  # 1周
        Threshold=5,
        ComparisonOperator='LessThanThreshold',
        TreatMissingData='notBreaching'
    )
```

**创建成本仪表板**：
```python
def create_cost_dashboard():
    """创建成本监控仪表板"""
    dashboard_body = {
        "widgets": [
            # 总成本趋势
            {
                "type": "metric",
                "x": 0,
                "y": 0,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/Cost", "TotalDailyCost", {"stat": "Sum"}]
                    ],
                    "period": 86400,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "Daily Cost Trend",
                    "yAxis": {"left": {"label": "USD"}}
                }
            },
            # 各服务成本
            {
                "type": "metric",
                "x": 0,
                "y": 6,
                "width": 12,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/Cost", "DailyCost", "Service", "EC2", {"stat": "Sum"}],
                        [".", ".", "Service", "RDS", {"stat": "Sum"}],
                        [".", ".", "Service", "Lambda", {"stat": "Sum"}],
                        [".", ".", "Service", "S3", {"stat": "Sum"}]
                    ],
                    "period": 86400,
                    "stat": "Sum",
                    "region": "us-east-1",
                    "title": "Cost by Service"
                }
            },
            # EC2 成本详情
            {
                "type": "metric",
                "x": 0,
                "y": 12,
                "width": 6,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/EC2", "CPUUtilization", {"label": "CPU %", "stat": "Average"}],
                        [".", "NetworkIn", ".", {"label": "Network In", "stat": "Sum"}],
                        [".", "NetworkOut", ".", {"label": "Network Out", "stat": "Sum"}]
                    ],
                    "period": 300,
                    "region": "us-east-1",
                    "title": "EC2 Utilization vs Cost"
                }
            },
            # Lambda 成本详情
            {
                "type": "metric",
                "x": 6,
                "y": 12,
                "width": 6,
                "height": 6,
                "properties": {
                    "metrics": [
                        ["AWS/Lambda", "Duration", {"label": "Duration", "stat": "Average"}],
                        [".", "Invocations", ".", {"label": "Invocations", "stat": "Sum"}],
                        [".", "Errors", ".", {"label": "Errors", "stat": "Sum"}]
                    ],
                    "period": 300,
                    "region": "us-east-1",
                    "title": "Lambda Metrics"
                }
            }
        ]
    }
    
    cloudwatch.put_dashboard(
        DashboardName='CostMonitoring',
        DashboardBody=json.dumps(dashboard_body)
    )
```

**效果**：
- 💰 **成本可视化**：清楚看到钱花在哪里
- 🚨 **超预算告警**：成本超标自动通知
- 🔍 **浪费发现**：发现未使用的资源
- 📈 **趋势分析**：预测未来成本
- 🎯 **优化建议**：根据监控数据优化资源

---

## 🔧 工具与生态

### 核心服务

| 服务 | 用途 | 特点 |
|------|------|------|
| **CloudWatch Metrics** | 指标监控 | 15个月标准指标，15个月自定义指标 |
| **CloudWatch Logs** | 日志管理 | 收集、存储、分析日志 |
| **CloudWatch Alarms** | 告警通知 | 状态变化时触发操作 |
| **CloudWatch Dashboards** | 可视化 | 自定义监控视图 |
| **EventBridge** | 事件处理 | 事件驱动自动化 |
| **Synthetics** | 探针监控 | 主动监控端点和API |
| **CloudWatch Agent** | 系统监控 | 收集系统和应用指标 |
| **RUM** | 真实用户监控 | 监控前端性能 |

### 相关 AWS 服务

- **AWS X-Ray**：分布式追踪
- **AWS Config**：配置审计
- **AWS CloudTrail**：API 调用日志
- **AWS Trusted Advisor**：最佳实践建议
- **AWS Cost Explorer**：成本分析

### 第三方集成

- **Datadog**：企业级监控
- **New Relic**：应用性能监控
- **Splunk**：日志分析
- **PagerDuty**：告警管理

### 学习资源

**官方资源**：
- 📘 **CloudWatch 官方文档**：https://docs.aws.amazon.com/cloudwatch/
- 📘 **开发者指南**：https://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/
- 🎓 **官方教程**：https://aws.amazon.com/cloudwatch/getting-started/

**推荐课程**：
- 📖 **AWS Certified Cloud Practitioner**：AWS 基础认证
- 📖 **AWS Certified Solutions Architect**：解决方案架构师认证
- 🎬 **CloudWatch 深入解析**（AWS Skills Center）

**博客和社区**：
- 📝 **AWS Compute Blog**：https://aws.amazon.com/blogs/compute/
- 💬 **AWS Forums**：https://forums.aws.amazon.com/

---

## ⚖️ 优缺点分析

| 维度 | ✅ 优点 | ❌ 缺点/局限性 |
|------|---------|---------------|
| **集成度** | 与 AWS 服务无缝集成 | 仅限 AWS 资源 |
| **易用性** | 开箱即用，配置简单 | 高级功能复杂 |
| **成本** | 免费额度足够 | 数据存储和 API 调用收费 |
| **实时性** | 指标1分钟精度 | 高精度监控收费 |
| **日志查询** | Insights 功能强大 | 查询语法需学习 |
| **告警** | 灵活的告警规则 | 复杂告警配置困难 |
| **可视化** | 仪表板功能丰富 | 定制化能力有限 |
| **扩展性** | 全球规模 | 跨区域监控复杂 |
| **学习成本** | ⭐⭐⭐☆☆（2-4周上手） | AWS 生态需要理解 |
| **适用场景** | AWS 工作负载 | 混合云/多云需要额外工具 |

---

## 🔮 未来趋势

### 发展方向

1. **AI/ML 增强**：异常检测、预测性告警
2. **统一可观测性**：整合指标、日志、追踪
3. **自动优化**：基于监控自动调整资源
4. **实时处理**：更低的延迟和更高的精度
5. **云原生支持**：增强对容器和无服务器的支持
6. **安全监控**：集成安全事件监控

### 潜在挑战

- 💰 **成本控制**：监控数据的存储成本
- 🏛️ **厂商锁定**：AWS 专用，迁移困难
- 🔐 **安全合规**：敏感日志的合规要求
- 📊 **数据孤岛**：多服务监控数据难以整合
- 🌐 **混合云**：非 AWS 资源监控困难

---

## 👥 适合谁学？

### ✅ 强烈推荐

- **AWS 用户**：使用 AWS 的开发者和运维
- **DevOps 工程师**：负责云平台运维
- **SRE**：站点可靠性工程师
- **云架构师**：设计 AWS 解决方案
- **系统管理员**：负责基础设施

### ⚠️ 了解即可

- **应用开发者**：了解基本概念
- **数据分析师**：了解监控数据
- **项目经理**：了解监控能力

### ❌ 可能用不到

- 非 AWS 用户
- 纯本地部署

### 📊 学习曲线

**⭐⭐⭐☆☆（2-4周上手）**

| 阶段 | 时间 | 能达到的水平 |
|------|------|-------------|
| 入门 | 1周 | 理解基本概念，会创建告警 |
| 熟练 | 2-3周 | 会配置监控、分析日志 |
| 精通 | 1-2月 | 理解高级功能，优化监控策略 |
| 专家 | 3月+ | 架构设计、成本优化 |

---

## 📚 延伸阅读

### 下一步学习

1. **AWS X-Ray**（分布式追踪）- 立即
2. **AWS Lambda**（无服务器）- 1周后
3. **AWS Systems Manager**（运维管理）- 2周后
4. **AWS 认证**（SAP/SAA）- 3月后

### 相关概念/技术

- **Prometheus**：开源监控系统
- **Grafana**：可视化工具
- **ELK Stack**：日志分析
- **APM**：应用性能监控
- **SLO/SLI**：服务水平目标/指标

### 推荐资源

1. 📘 **CloudWatch 官方文档**：https://docs.aws.amazon.com/cloudwatch/
2. 📘 **AWS 白皮书**：https://aws.amazon.com/whitepapers/
3. 📘 **AWS 架构中心**：https://aws.amazon.com/architecture/
4. 📘 **CloudWatch 最佳实践**：https://docs.aws.amazon.com/AmazonCloudWatch/latest/UserGuide/best-practices.html
5. 📘 **AWS 技术博客**：https://aws.amazon.com/blogs/

---

> **生成时间**：2026-06-12

> **技能版本**：website-explainer v2.0 关键词学习模式