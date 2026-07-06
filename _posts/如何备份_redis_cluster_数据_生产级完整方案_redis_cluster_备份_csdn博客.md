# 如何备份 Redis Cluster 数据？（生产级完整方案）_redis cluster 备份-CSDN博客

## **如何备份 Redis Cluster 数据？（生产级完整方案）**

Redis Cluster 是 Redis 的分布式集群模式，支持数据分片（16384 slots）和高可用。由于其架构复杂性，**不能像单节点 Redis 那样简单地备份一个 RDB 文件**。

本文将详细介绍 **如何正确备份 Redis Cluster 数据**，涵盖 **全量备份、增量备份、一致性保障、恢复验证、自动化脚本** 等企业级实践。

---

### 一、Redis Cluster 备份核心挑战

| 挑战 | 说明 |
|----|----|
| 🧩数据分片 | 数据分布在多个 master 节点上 |
| 🔁复制结构 | 每个 master 有 slave，但备份需从 master |
| ⏱️一致性窗口 | 多节点备份时间不一致可能导致数据不一致 |
| 📦备份粒度 | 必须备份所有 master 节点 |
| 🔄恢复复杂 | 恢复时需重建集群拓扑 |

> ✅ **目标：实现“集群级一致性备份”**---

### 二、备份策略选择

| 方法 | 适用场景 | 推荐指数 |
|----|------|------|
| ✅各节点独立 RDB 备份 | 通用，推荐 | ⭐⭐⭐⭐⭐ |
| ✅使用redis-cli --cluster工具 | 辅助管理 | ⭐⭐⭐ |
| ✅AOF + 增量备份 | 高频变更数据 | ⭐⭐⭐⭐ |
| ✅CDC 变更捕获（如 Debezium） | 核心业务 | ⭐⭐⭐⭐ |
| ❌ 只备份一个节点 | ❌ 完全错误 | ⚠️ |

> ✅ **推荐组合：RDB 全量 + AOF 增量 + 外部 CDC**---

### 三、方案一：RDB 全量备份（推荐）

#### 3.1 架构说明

Redis Cluster 通常有多个 master 节点（如 3 master + 3 slave），**必须对每个 master 节点执行备份**。

```
[Master1] → BGSAVE → RDB1
[Master2] → BGSAVE → RDB2
[Master3] → BGSAVE → RDB3
```

#### 3.2 获取 Cluster 节点信息

```bash
# 查看集群节点
redis-cli -c -h cluster-node -p 6379 CLUSTER NODES
```

输出示例：

```
abc123... 192.168.1.10:6379@16379 master - 0 1678901234567 1 connected 0-5460
def456... 192.168.1.11:6379@16379 master - 0 1678901234568 2 connected 5461-10922
ghi789... 192.168.1.12:6379@16379 master - 0 1678901234569 3 connected 10923-16383
```

提取 master 节点 IP 和端口。

---

#### 3.3 全量备份脚本（Shell）

```bash
#!/bin/bash
# backup_redis_cluster.sh

CLUSTER_SEED="192.168.1.10:6379"
BACKUP_DIR="/backup/redis-cluster"
DATE=$(date +%Y%m%d_%H%M%S)
TMP_NODES="/tmp/cluster_nodes.txt"

mkdir -p $BACKUP_DIR

echo "🔍 Discovering master nodes..."
redis-cli -c -h $CLUSTER_SEED CLUSTER NODES | grep "master" | grep -v "fail" > $TMP_NODES

if [ ! -s $TMP_NODES ]; then
  echo "❌ Failed to get cluster nodes"
  exit 1
fi

SUCCESS_COUNT=0
TOTAL_COUNT=$(grep -c "" $TMP_NODES)

for node in $(cat $TMP_NODES | awk '{print $2}'); do
  IP=$(echo $node | cut -d: -f1)
  PORT=$(echo $node | cut -d: -f2)
  
  echo "🔄 Backing up $IP:$PORT"
  
  # 触发 BGSAVE
  RESPONSE=$(redis-cli -h $IP -p $PORT BGSAVE 2>&1)
  if echo "$RESPONSE" | grep -q "Background saving started"; then
    echo "✅ BGSAVE started on $IP:$PORT"
    
    # 等待完成（可优化为轮询 INFO persistence）
    sleep 15
    
    # 复制 RDB 文件（假设 RDB 在 /data/dump.rdb）
    ssh $IP "cp /data/dump.rdb /data/dump-$DATE.rdb && gzip /data/dump-$DATE.rdb"
    scp $IP:/data/dump-$DATE.rdb.gz $BACKUP_DIR/dump-$IP-$PORT-$DATE.rdb.gz
    
    if [ $? -eq 0 ]; then
      echo "✅ Backup copied: $BACKUP_DIR/dump-$IP-$PORT-$DATE.rdb.gz"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      echo "❌ Failed to copy backup from $IP"
    fi
  else
    echo "❌ BGSAVE failed on $IP:$PORT - $RESPONSE"
  fi
done

# 清理临时文件
rm -f $TMP_NODES

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
  echo "✅ Cluster backup SUCCESS: $SUCCESS_COUNT/$TOTAL_COUNT nodes"
  exit 0
else
  echo "❌ Cluster backup FAILED: $SUCCESS_COUNT/$TOTAL_COUNT nodes"
  exit 1
fi
```

---

#### 3.4 加入定时任务

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup_redis_cluster.sh >> /var/log/redis-cluster-backup.log 2>&1
```

---

### 四、方案二：AOF 增量备份

#### 4.1 配置所有 master 节点

```conf
# redis.conf
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

#### 4.2 增量备份脚本

```bash
#!/bin/bash
# incremental_backup_cluster.sh

for node in $(cat /tmp/master_nodes.txt); do
  IP=$(echo $node | cut -d: -f1)
  PORT=$(echo $node | cut -d: -f2)
  LAST_POS="/backup/redis-cluster/last_pos_$IP:$PORT.txt"
  
  CURRENT_SIZE=$(ssh $IP "stat -c%s /data/appendonly.aof")
  LAST_SIZE=$(cat $LAST_POS 2>/dev/null || echo 0)
  
  if [ $CURRENT_SIZE -gt $LAST_SIZE ]; then
    # 提取新增部分
    ssh $IP "dd if=/data/appendonly.aof of=/tmp/incr.aof.gz skip=$LAST_SIZE count=$((CURRENT_SIZE-LAST_SIZE)) | gzip"
    scp $IP:/tmp/incr.aof.gz $BACKUP_DIR/incr-$IP-$PORT-$(date +%Y%m%d_%H%M%S).aof.gz
    echo $CURRENT_SIZE > $LAST_POS
  fi
done
```

---

### 五、方案三：使用外部 CDC（推荐核心业务）

#### 架构

```
[MySQL] → [Debezium] → [Kafka] → [Logstash] → [Redis Cluster]
                             ↓
                       [备份变更事件]
```

或：

```
[Redis Cluster] → [KeySpace Notifications] → [Kafka] → [备份]
```

##### 启用 KeySpace 通知：

```conf
notify-keyspace-events "ExgK"
```

##### Logstash 配置：

```ruby
input {
  redis {
    host => "redis-cluster-seed"
    key => "__keyevent@*:set"
    data_type => "pattern_channel"
    cluster_enabled => true
  }
}

output {
  file {
    path => "/backup/redis-events/%{+YYYY-MM-dd}.log"
    codec => json_lines
  }
}
```

> 实现逻辑层备份，可审计、可重放。---

### 六、恢复流程

#### 6.1 恢复前提

- 所有 master 节点的 RDB 文件
- 集群拓扑信息（`cluster nodes` 输出）

#### 6.2 恢复脚本

```bash
#!/bin/bash
# restore_redis_cluster.sh

# 1. 停止所有 Redis 实例
for node in $MASTERS; do
  ssh $node "systemctl stop redis"
done

# 2. 替换 RDB 文件
for node in $MASTERS; do
  IP=$(echo $node | cut -d: -f1)
  PORT=$(echo $node | cut -d: -f2)
  scp /backup/redis-cluster/dump-$IP-$PORT-*.rdb.gz $IP:/data/dump.rdb.gz
  ssh $IP "gunzip -f /data/dump.rdb.gz && chown redis:redis /data/dump.rdb"
done

# 3. 启动所有节点
for node in $MASTERS; do
  ssh $node "systemctl start redis"
done

# 4. 重新创建集群（如果元数据丢失）
# redis-cli --cluster create ...
```

---

### 七、一致性与验证

#### 7.1 备份一致性检查

```bash
# 检查所有节点备份时间是否接近
ls -lt /backup/redis-cluster/dump-* | head -10
```

> 时间差应 &lt; 1 分钟。

#### 7.2 使用 `redis-check-rdb`

```bash
for file in /backup/redis-cluster/*.rdb.gz; do
  gunzip -c "$file" > /tmp/temp.rdb
  if /usr/local/bin/redis-check-rdb /tmp/temp.rdb > /dev/null; then
    echo "✅ $file is valid"
  else
    echo "❌ $file is corrupted"
  fi
  rm -f /tmp/temp.rdb
done
```

---

### 八、最佳实践总结

| 项目 | 推荐做法 |
|----|------|
| 备份频率 | 每日 1 次全量 + 每 15 分钟增量 |
| 存储位置 | 异地（S3、NFS）+ 加密 |
| 一致性 | 尽量缩短各节点备份时间差 |
| 监控 | 监控每个节点的备份状态 |
| 演练 | 每月执行恢复测试 |
| 权限 | 备份账户仅限读取和BGSAVE |

---

### 九、参考资源

- Redis Cluster 文档：[https://redis.io/topics/cluster-tutorial](https://redis.io/topics/cluster-tutorial)
- Redis RDB 工具：[https://github.com/sripathikrishnan/redis-rdb-tools](https://github.com/sripathikrishnan/redis-rdb-tools)
- Debezium Redis Connector：[https://debezium.io](https://debezium.io)

---

### 十、结语

备份 Redis Cluster 数据的关键是：

> 🔑 **对所有 master 节点执行一致性备份，并验证可恢复性**

通过自动化脚本 + 定期演练，可构建一个可靠的集群备份体系。