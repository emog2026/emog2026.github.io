---
title: Redis Cluster 备份与恢复完全指南
date: 2026-06-23
tags:
  - Redis
  - 数据库
  - 备份恢复
  - 高可用
categories:
  - 数据库
  - 运维
---

## Redis Cluster 备份恢复概述

Redis Cluster 是 Redis 的分布式集群解决方案，数据通过分片（sharding）分布在多个节点上。备份恢复需要考虑整个集群的数据一致性。

## 一、Redis 持久化机制

### 1.1 RDB (Redis Database)

RDB 是 Redis 的快照持久化方式，在指定的时间间隔内生成数据集的时间点快照。

**优点：**
- 文件紧凑，适合备份
- 恢复速度快
- 适合灾难恢复

**缺点：**
- 可能丢失最近的数据
- fork() 过程可能阻塞

### 1.2 AOF (Append Only File)

AOF 记录所有写操作命令，重启时重新执行这些命令来恢复数据。

**优点：**
- 数据安全性高，可配置 fsync 策略
- AOF 文件可读，便于手动修复

**缺点：**
- 文件体积大
- 恢复相对较慢

### 1.3 混合持久化

Redis 4.0+ 支持 RDB-AOF 混合模式：
- AOF 文件包含 RDB 基础数据
- 增量数据以 AOF 格式追加

## 二、RDB 备份实现

### 2.1 手动触发 RDB 备份

```bash
# 在 Redis 节点上执行
redis-cli -c -h <cluster_ip> -p <port> BGSAVE

# 或使用 SAVE（阻塞式，不推荐生产环境）
redis-cli -c -h <cluster_ip> -p <port> SAVE
```

### 2.2 配置自动 RDB 备份

在 `redis.conf` 中配置：

```conf
# RDB 配置
save 900 1      # 900秒内至少1个key变化
save 300 10     # 300秒内至少10个key变化
save 60 10000   # 60秒内至少10000个key变化

# RDB 文件配置
dbfilename dump.rdb
dir /var/lib/redis

# 压缩 RDB 文件
rdbcompression yes

# RDB 校验
rdbchecksum yes
```

### 2.3 RDB 备份脚本

```bash
#!/bin/bash
# redis-cluster-rdb-backup.sh

BACKUP_DIR="/backup/redis/rdb"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Redis Cluster 节点列表
NODES=(
    "192.168.1.10:7000"
    "192.168.1.10:7001"
    "192.168.1.11:7000"
    "192.168.1.11:7001"
    "192.168.1.12:7000"
    "192.168.1.12:7001"
)

mkdir -p "$BACKUP_DIR"

for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    echo "Backing up $HOST:$PORT"
    
    # 触发 BGSAVE
    redis-cli -h $HOST -p $PORT BGSAVE
    
    # 等待 BGSAVE 完成
    while redis-cli -h $HOST -p $PORT LASTSAVE | grep -q $(date +%s); do
        sleep 1
    done
    
    # 复制 RDB 文件
    ssh $HOST "cp /var/lib/redis/dump.rdb /tmp/dump-${PORT}.rdb"
    scp $HOST:/tmp/dump-${PORT}.rdb ${BACKUP_DIR}/dump-${HOST}-${PORT}-${DATE}.rdb
done

# 清理旧备份
find $BACKUP_DIR -name "dump-*.rdb" -mtime +$RETENTION_DAYS -delete

echo "RDB backup completed: $DATE"
```

## 三、AOF 备份实现

### 3.1 启用 AOF 持久化

在 `redis.conf` 中配置：

```conf
# 启用 AOF
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# fsync 策略
# always: 每次写操作都 fsync（最安全但最慢）
# everysec: 每秒 fsync（推荐，折中方案）
# no: 由操作系统决定（最快但可能丢失数据）
appendfsync everysec

# AOF 重写配置
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# AOF 文件校验
aof-load-truncated yes
```

### 3.2 AOF 重写

```bash
# 手动触发 AOF 重写
redis-cli -c -h <cluster_ip> -p <port> BGREWRITEAOF

# 查看 AOF 重写状态
redis-cli -c -h <cluster_ip> -p <port> INFO Persistence
```

### 3.3 AOF 备份脚本

```bash
#!/bin/bash
# redis-cluster-aof-backup.sh

BACKUP_DIR="/backup/redis/aof"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

NODES=(
    "192.168.1.10:7000"
    "192.168.1.10:7001"
    "192.168.1.11:7000"
    "192.168.1.11:7001"
    "192.168.1.12:7000"
    "192.168.1.12:7001"
)

mkdir -p "$BACKUP_DIR"

for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    echo "Backing up AOF from $HOST:$PORT"
    
    # 触发 AOF 重写（可选）
    # redis-cli -h $HOST -p $PORT BGREWRITEAOF
    
    # 复制 AOF 文件
    ssh $HOST "cp /var/lib/redis/appendonly.aof /tmp/appendonly-${PORT}.aof"
    scp $HOST:/tmp/appendonly-${PORT}.aof ${BACKUP_DIR}/appendonly-${HOST}-${PORT}-${DATE}.aof
done

# 清理旧备份
find $BACKUP_DIR -name "appendonly-*.aof" -mtime +$RETENTION_DAYS -delete

echo "AOF backup completed: $DATE"
```

## 四、Redis Cluster 完整备份策略

### 4.1 集群节点信息备份

```bash
#!/bin/bash
# redis-cluster-config-backup.sh

BACKUP_DIR="/backup/redis/config"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# 备份集群节点配置
redis-cli -c -h <cluster_ip> -p <port> CLUSTER NODES > \
    ${BACKUP_DIR}/cluster-nodes-${DATE}.txt

# 备份各个节点的 redis.conf
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    scp $HOST:/etc/redis/redis-${PORT}.conf \
        ${BACKUP_DIR}/redis-${HOST}-${PORT}-${DATE}.conf
done

echo "Cluster config backup completed: $DATE"
```

### 4.2 使用 redis-rdb-tools 工具

```bash
# 安装 redis-rdb-tools
pip install rdbtools

# 分析 RDB 文件
rdb --command json dump.rdb > dump.json

# 查看 RDB 内存使用
rdb -c memory dump.rdb --bytes 1024 > memory_report.csv
```

### 4.3 使用 redis-dump 工具

```bash
# 安装 redis-dump
gem install redis-dump

# 导出数据
redis-dump -u redis://:<password>@<host>:<port> > dump.json

# 导入数据
redis-load -u redis://:<password>@<host>:<port> < dump.json
```

## 五、Redis Cluster 恢复流程

### 5.1 RDB 恢复步骤

```bash
#!/bin/bash
# redis-cluster-rdb-restore.sh

SOURCE_DIR="/backup/redis/rdb"
SOURCE_DATE="20260623_120000"

# 停止 Redis Cluster
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "systemctl stop redis@${PORT}"
done

# 恢复 RDB 文件
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    SOURCE_FILE="${SOURCE_DIR}/dump-${HOST}-${PORT}-${SOURCE_DATE}.rdb"
    
    if [ -f "$SOURCE_FILE" ]; then
        scp $SOURCE_FILE $HOST:/var/lib/redis/dump.rdb
        ssh $HOST "chown redis:redis /var/lib/redis/dump.rdb"
    fi
done

# 启动 Redis Cluster
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "systemctl start redis@${PORT}"
done

echo "RDB restore completed"
```

### 5.2 AOF 恢复步骤

```bash
#!/bin/bash
# redis-cluster-aof-restore.sh

SOURCE_DIR="/backup/redis/aof"
SOURCE_DATE="20260623_120000"

# 停止 Redis Cluster
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "systemctl stop redis@${PORT}"
done

# 恢复 AOF 文件
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    SOURCE_FILE="${SOURCE_DIR}/appendonly-${HOST}-${PORT}-${SOURCE_DATE}.aof"
    
    if [ -f "$SOURCE_FILE" ]; then
        scp $SOURCE_FILE $HOST:/var/lib/redis/appendonly.aof
        ssh $HOST "chown redis:redis /var/lib/redis/appendonly.aof"
    fi
done

# 临时禁用 AOF 以启动服务（避免数据损坏）
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "sed -i 's/^appendonly yes/appendonly no/' /etc/redis/redis-${PORT}.conf"
done

# 启动服务
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "systemctl start redis@${PORT}"
done

# 恢复 AOF 配置
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "sed -i 's/^appendonly no/appendonly yes/' /etc/redis/redis-${PORT}.conf"
    ssh $HOST "redis-cli -p ${PORT} CONFIG SET appendonly yes"
    ssh $HOST "redis-cli -p ${PORT} CONFIG REWRITE"
done

echo "AOF restore completed"
```

### 5.3 完整集群恢复

```bash
#!/bin/bash
# redis-cluster-full-restore.sh

# 1. 恢复配置文件
# 2. 启动所有节点
# 3. 重建集群（如需要）
# 4. 验证集群状态

# 启动节点
for node in "${NODES[@]}"; do
    HOST=$(echo $node | cut -d: -f1)
    PORT=$(echo $node | cut -d: -f2)
    
    ssh $HOST "systemctl start redis@${PORT}"
done

# 等待节点启动
sleep 10

# 检查集群状态
redis-cli -c -h <cluster_ip> -p <port> CLUSTER INFO

# 如需要，重建集群
# redis-cli --cluster create <node1>:<port1> <node2>:<port2> ... \
#     --cluster-replicas <replica_count> -a <password>

# 验证数据
redis-cli -c -h <cluster_ip> -p <port> DBSIZE
```

## 六、最佳实践

### 6.1 备份策略建议

1. **生产环境推荐策略：**
   - 主持久化：AOF (everysec) - 确保数据安全
   - 辅助持久化：RDB - 用于快速备份
   - 混合模式：Redis 4.0+ 推荐使用

2. **备份频率：**
   - 全量备份：每日一次（低峰时段）
   - 增量备份：每小时一次（基于 AOF）
   - 实时复制：主从复制（同步/异步）

3. **备份保留：**
   - 本地备份：保留 7-30 天
   - 异地备份：保留 90 天以上
   - 关键数据：永久归档

### 6.2 监控与告警

```bash
# 监控持久化状态
redis-cli -c -h <cluster_ip> -p <port> INFO Persistence

# 监控备份状态
# 在 Prometheus + Grafana 中监控以下指标：
# - rdb_last_save_time
# - aof_last_rewrite_time_sec
# - aof_current_size
# - aof_base_size

# 告警规则示例
# - BGSAVE 超过 1 小时未完成
# - AOF 文件大小异常
# - 主从延迟超过阈值
```

### 6.3 灾难恢复流程

1. **评估损失：**
   - 确定故障范围
   - 评估数据丢失情况

2. **选择恢复点：**
   - 根据备份时间点选择
   - 权衡数据丢失 vs 业务影响

3. **执行恢复：**
   - 按照恢复流程操作
   - 验证数据完整性

4. **验证测试：**
   - 数据一致性检查
   - 业务功能测试

### 6.4 安全考虑

1. **备份文件加密：**
   ```bash
   # 加密备份文件
   openssl enc -aes-256-cbc -salt -in dump.rdb -out dump.rdb.enc
   
   # 解密备份文件
   openssl enc -aes-256-cbc -d -in dump.rdb.enc -out dump.rdb
   ```

2. **访问权限控制：**
   ```bash
   chmod 600 /backup/redis/*.rdb
   chmod 600 /backup/redis/*.aof
   ```

3. **网络安全：**
   - 使用 SSL/TLS 传输
   - 网络隔离备份存储

## 七、故障排查

### 7.1 常见问题

**问题 1：BGSAVE 失败**
```bash
# 检查磁盘空间
df -h

# 检查内存
free -h

# 查看 Redis 日志
tail -f /var/log/redis/redis.log
```

**问题 2：AOF 文件损坏**
```bash
# Redis 启动时会自动尝试修复
# 或手动修复
redis-cli --pipe < appendonly.aof

# 使用 redis-check-aof 工具
redis-check-aof --fix appendonly.aof
```

**问题 3：集群无法启动**
```bash
# 检查集群配置
redis-cli -c -h <cluster_ip> -p <port> CLUSTER NODES

# 重置集群
redis-cli -c -h <cluster_ip> -p <port> CLUSTER RESET HARD

# 重建集群
redis-cli --cluster create <nodes> --cluster-replicas 1
```

### 7.2 性能优化

```conf
# RDB 性能优化
rdbcompression yes
save ""  # 禁用自动保存，手动触发
stop-writes-on-bgsave-error yes

# AOF 性能优化
no-appendfsync-on-rewrite yes
aof-rewrite-incremental-fsync yes
aof-use-rdb-preamble yes  # 启用混合持久化
```

## 八、自动化方案

### 8.1 使用 Cron 定时备份

```bash
# crontab -e

# 每天凌晨 2 点执行 RDB 备份
0 2 * * * /opt/scripts/redis-cluster-rdb-backup.sh

# 每小时执行 AOF 备份
0 * * * * /opt/scripts/redis-cluster-aof-backup.sh

# 每周执行配置备份
0 3 * * 0 /opt/scripts/redis-cluster-config-backup.sh
```

### 8.2 使用 Kubernetes Operator

对于部署在 Kubernetes 上的 Redis Cluster，可以使用 Redis Operator：

```yaml
apiVersion: redis.redis.op/v1beta1
kind: RedisCluster
metadata:
  name: redis-cluster
spec:
  size: 6
  persistence:
    enabled: true
    storageClass: "fast-ssd"
    volumeSize: "10Gi"
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retention: "7d"
    s3:
      bucket: "redis-backups"
      region: "us-east-1"
```

## 总结

Redis Cluster 的备份恢复需要考虑：
1. 选择合适的持久化策略（RDB/AOF/混合）
2. 制定完善的备份计划（全量+增量）
3. 确保备份的安全性和可用性
4. 定期测试恢复流程
5. 建立完善的监控告警机制

通过合理的备份策略和完善的恢复流程，可以最大程度地保障 Redis Cluster 数据安全和业务连续性。
