---
title: Redis 3主3从集群备份策略详解
date: 2026-06-21 11:00:00
categories: [数据库]
tags: [redis, 主从复制, 备份恢复, 集群, 高可用]
---

## 前言

Redis 在生产环境中通常采用主从架构或集群模式来保证高可用性。对于 3主3从 的 Redis Cluster 架构，如何制定合理的备份策略？本文详细解答 Redis 备份的核心问题、持久化机制选择，以及 3主3从架构的最佳备份方案。

## 一、Redis 持久化机制

### 1.1 RDB vs AOF 对比

| 对比维度 | RDB (快照) | AOF (追加日志) |
|----------|-----------|----------------|
| **备份方式** | 定时保存内存快照 | 记录每个写命令 |
| **文件大小** | 小（压缩格式） | 大（文本格式） |
| **恢复速度** | ⚡ 快 | 🐌 慢（需重放命令） |
| **数据完整性** | 可能丢失最后一次快照后的数据 | 丢失最多 1 秒数据（always 模式） |
| **性能影响** | fork 时有短暂阻塞 | 取决于 fsync 策略 |
| **文件格式** | 二进制 | 文本（可读可编辑） |
| **适用场景** | 备份、灾难恢复 | 数据完整性要求高 |

### 1.2 RDB 持久化

**什么是 RDB？**

RDB（Redis Database）是 Redis 在指定时间间隔内生成数据集的时间点快照。

**配置示例：**

```conf
# redis.conf

# RDB 配置
save 900 1      # 900秒内至少1次写操作
save 300 10     # 300秒内至少10次写操作
save 60 10000   # 60秒内至少10000次写操作

# RDB 文件名
dbfilename dump.rdb

# RDB 文件目录
dir /var/lib/redis

# 压缩 RDB 文件
rdbcompression yes

# RDB 检查校验和
rdbchecksum yes
```

**手动触发 RDB：**

```bash
# 在 redis-cli 中执行
BGSAVE    # 后台异步保存
SAVE      # 同步保存（阻塞）

# 查看 RDB 状态
INFO Persistence
# 或
LASTSAVE  # 返回最后一次成功保存的时间戳
```

### 1.3 AOF 持久化

**什么是 AOF？**

AOF（Append Only File）记录 Redis 服务器执行的所有写命令。

**配置示例：**

```conf
# redis.conf

# 开启 AOF
appendonly yes

# AOF 文件名
appendfilename "appendonly.aof"

# AOF 同步策略
appendfsync always    # 每个写命令都同步（最安全，最慢）
appendfsync everysec  # 每秒同步（推荐）
appendfsync no        # 由 OS 决定同步（最快）

# AOF 重写配置
auto-aof-rewrite-percentage 100      # AOF 文件大小是上次重写后的100%时触发
auto-aof-rewrite-min-size 64mb       # AOF 文件至少达到 64MB 才触发重写

# AOF 重写时是否继续追加
no-appendfsync-on-rewrite no

# AOF 加载时截断可能损坏的文件
aof-load-truncated yes
```

**AOF 重写：**

```bash
# 手动触发 AOF 重写
BGREWRITEAOF

# 查看 AOF 状态
INFO Persistence
```

### 1.4 RDB + AOF 混合持久化（推荐）

Redis 4.0+ 支持 RDB 和 AOF 混合持久化：

```conf
# 开启混合持久化（Redis 4.0+）
aof-use-rdb-preamble yes
```

**工作原理：**
- AOF 重写时，将 RDB 内容写入 AOF 文件开头
- RDB 后的增量数据以 AOF 格式追加
- 兼顾 RDB 的快速恢复和 AOF 的数据完整性

---

## 二、3主3从架构备份策略

### 2.1 架构理解

**Redis Cluster 3主3从架构：**

```
                    Redis Cluster (3主3从)
┌────────────────────────────────────────────────────┐
│                                                    │
│  Master-1 ────┬────> Slave-1a (备份节点)          │
│               │                                     │
│               └────> Slave-1b                       │
│                                                    │
│  Master-2 ────┬────> Slave-2a                      │
│               │                                     │
│               └────> Slave-2b (备份节点)          │
│                                                    │
│  Master-3 ────┬────> Slave-3a (备份节点)          │
│               │                                     │
│               └────> Slave-3b                       │
│                                                    │
└────────────────────────────────────────────────────┘

槽分布：
• Master-1: Slots 0-5460
• Master-2: Slots 5461-10922
• Master-3: Slots 10923-16383
```

### 2.2 备份节点选择

**核心原则：备份从节点（Slave）**

| 原因 | 说明 |
|------|------|
| **不影响主节点** | 备份操作（尤其是 BGSAVE）会 fork 进程，从节点备份不影响主节点性能 |
| **减少主节点压力** | 主节点专注于处理客户端请求 |
| **分布式备份** | 多个从节点可分担备份任务 |
| **避免主从切换影响** | 主从切换后，备份仍可继续 |

**备份策略：从节点轮换备份**

```
轮换策略示例：
┌──────────┬─────────────────────────────────────┐
│ 备份时间  │ 备份节点                            │
├──────────┼─────────────────────────────────────┤
│ 周一      │ Slave-1a                            │
│ 周二      │ Slave-2a                            │
│ 周三      │ Slave-3a                            │
│ 周四      │ Slave-1a                            │
│ 周五      │ Slave-2a                            │
│ 周六      │ Slave-3a                            │
│ 周日      │ 全量备份验证                        │
└──────────┴─────────────────────────────────────┘
```

### 2.3 推荐备份方案

**方案一：RDB 定时备份（推荐）**

**适用场景：** 数据恢复速度要求高，可容忍少量数据丢失

```conf
# 从节点 redis.conf 配置
save 900 1
save 300 10
save 60 10000

# 确保主节点同步配置
repl-diskless-sync yes
```

**备份脚本：**

```bash
#!/bin/bash
# redis_cluster_backup.sh

BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION=7  # 保留7天

# 定义从节点列表
SLAVES=(
    "192.168.1.11:7001"
    "192.168.1.12:7002"
    "192.168.1.13:7003"
)

# 轮询备份从节点
SLAVE_INDEX=$(( ($(date +%u) - 1) % 3 ))
SLAVE_ADDR=${SLAVES[$SLAVE_INDEX]}

echo "开始备份从节点: $SLAVE_ADDR"

# 触发 BGSAVE
redis-cli -h ${SLAVE_ADDR%%:*} -p ${SLAVE_ADDR##*:} BGSAVE

# 等待 BGSAVE 完成
while [ $(redis-cli -h ${SLAVE_ADDR%%:*} -p ${SLAVE_ADDR##*:} LASTSAVE) -eq $LASTSAVE ]; do
    sleep 1
done

# 复制 RDB 文件
scp ${SLAVE_ADDR}:/var/lib/redis/dump.rdb ${BACKUP_DIR}/dump_${DATE}.rdb

# 压缩
gzip ${BACKUP_DIR}/dump_${DATE}.rdb

# 清理旧备份
find ${BACKUP_DIR} -name "*.rdb.gz" -mtime +${RETENTION} -delete

echo "备份完成: dump_${DATE}.rdb.gz"
```

**方案二：AOF 持久化 + 定期备份**

**适用场景：** 数据完整性要求高，可接受恢复速度稍慢

```conf
# 从节点开启 AOF
appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes  # 推荐：混合持久化
```

**备份脚本：**

```bash
#!/bin/bash
# redis_aof_backup.sh

BACKUP_DIR="/backup/redis/aof"
DATE=$(date +%Y%m%d)
RETENTION=7

# 定义从节点列表
SLAVES=(
    "192.168.1.11:7001"
    "192.168.1.12:7002"
    "192.168.1.13:7003"
)

# 轮询备份从节点
SLAVE_INDEX=$(( ($(date +%u) - 1) % 3 ))
SLAVE_ADDR=${SLAVES[$SLAVE_INDEX]}

# 触发 AOF 重写（减小文件）
redis-cli -h ${SLAVE_ADDR%%:*} -p ${SLAVE_ADDR##*:} BGREWRITEAOF

# 等待重写完成
sleep 10

# 复制 AOF 文件
scp ${SLAVE_ADDR}:/var/lib/redis/appendonly.aof ${BACKUP_DIR}/appendonly_${DATE}.aof

# 压缩
gzip ${BACKUP_DIR}/appendonly_${DATE}.aof

# 清理
find ${BACKUP_DIR} -name "*.aof.gz" -mtime +${RETENTION} -delete

echo "AOF 备份完成: appendonly_${DATE}.aof.gz"
```

**方案三：RDB + AOF 混合备份（最佳）**

**适用场景：** 平衡数据完整性和恢复速度

```conf
# 从节点配置
save 900 1
appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes  # 混合持久化
```

**备份策略：**
- RDB 每天备份（用于快速恢复）
- AOF 每周备份（用于数据完整性）

```bash
#!/bin/bash
# redis_hybrid_backup.sh

BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)

# 每天备份 RDB
bash /scripts/redis_rdb_backup.sh

# 每周日额外备份 AOF
if [ $DAY_OF_WEEK -eq 7 ]; then
    bash /scripts/redis_aof_backup.sh
    echo "周日额外 AOF 备份完成"
fi
```

### 2.4 自动化备份方案

**使用 Crontab 定时备份：**

```bash
# crontab -e

# 每天凌晨 2 点执行 RDB 备份
0 2 * * * /scripts/redis_rdb_backup.sh >> /var/log/redis_backup.log 2>&1

# 每周日凌晨 3 点执行 AOF 备份
0 3 * * 0 /scripts/redis_aof_backup.sh >> /var/log/redis_backup.log 2>&1

# 每月 1 号凌晨 4 点验证备份
0 4 1 * * /scripts/redis_verify_backup.sh >> /var/log/redis_backup.log 2>&1
```

---

## 三、备份恢复流程

### 3.1 RDB 恢复

**恢复步骤：**

```bash
# 1. 停止 Redis
redis-cli -h <节点IP> -p <端口> shutdown

# 2. 备份当前数据文件
mv /var/lib/redis/dump.rdb /var/lib/redis/dump.rdb.backup

# 3. 解压并复制 RDB 文件
gunzip -c /backup/redis/dump_20260621.rdb.gz > /var/lib/redis/dump.rdb

# 4. 启动 Redis
redis-server /path/to/redis.conf

# 5. 验证数据
redis-cli -h <节点IP> -p <端口> DBSIZE
```

**3主3从 恢复策略：**

```bash
#!/bin/bash
# redis_cluster_restore.sh

# 1. 恢复所有从节点
for SLAVE in "192.168.1.11:7001" "192.168.1.12:7002" "192.168.1.13:7003"; do
    echo "恢复从节点: $SLAVE"
    
    # 停止从节点
    redis-cli -h ${SLAVE%%:*} -p ${SLAVE_ADDR##*:} shutdown
    
    # 复制备份文件
    gunzip -c /backup/redis/dump_latest.rdb.gz > /tmp/dump.rdb
    scp /tmp/dump.rdb ${SLAVE%%:*}:/var/lib/redis/dump.rdb
    
    # 启动从节点
    ssh ${SLAVE%%:*} "redis-server /etc/redis/redis.conf"
done

# 2. 等待从节点同步完成
sleep 30

# 3. 验证集群状态
redis-cli --cluster check 192.168.1.10:7000
```

### 3.2 AOF 恢复

```bash
# 1. 停止 Redis
redis-cli shutdown

# 2. 备份当前 AOF
mv /var/lib/redis/appendonly.aof /var/lib/redis/appendonly.aof.backup

# 3. 解压并复制 AOF 文件
gunzip -c /backup/redis/appendonly_20260621.aof.gz > /var/lib/redis/appendonly.aof

# 4. 启动 Redis
redis-server /path/to/redis.conf

# 5. Redis 会自动加载 AOF 文件
```

### 3.3 混合恢复

**优先级：RDB + AOF 混合 > RDB > AOF**

```bash
# Redis 4.0+ 自动识别混合持久化文件
# appendonly.aof 开头是 RDB 格式，后面是 AOF 增量
# 恢复时直接替换 appendonly.aof 文件即可
```

---

## 四、监控与验证

### 4.1 备份监控

**监控脚本：**

```bash
#!/bin/bash
# redis_backup_monitor.sh

# 检查最近备份文件是否存在
LATEST_BACKUP=$(ls -t /backup/redis/*.rdb.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "警告：没有找到备份文件"
    # 发送告警（如钉钉、企业微信）
    exit 1
fi

# 检查备份文件时间（不超过 48 小时）
BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y "$LATEST_BACKUP") ))
MAX_AGE=48*3600

if [ $BACKUP_AGE -gt $MAX_AGE ]; then
    echo "警告：备份文件已超过 48 小时"
    exit 1
fi

# 检查备份文件大小
BACKUP_SIZE=$(stat -c %s "$LATEST_BACKUP")
MIN_SIZE=1024  # 至少 1KB

if [ $BACKUP_SIZE -lt $MIN_SIZE ]; then
    echo "警告：备份文件异常小"
    exit 1
fi

echo "备份检查通过"
```

### 4.2 备份验证

**定期验证备份可恢复性：**

```bash
#!/bin/bash
# redis_verify_backup.sh

BACKUP_FILE=$1
TEST_PORT=7999

# 1. 解压备份
gunzip -c "$BACKUP_FILE" > /tmp/verify.rdb

# 2. 启动测试实例
redis-server --port $TEST_PORT --dir /tmp --dbfilename verify.rdb --daemonize yes

# 3. 等待启动
sleep 5

# 4. 验证数据
KEY_COUNT=$(redis-cli -p $TEST_PORT DBSIZE)

if [ $KEY_COUNT -gt 0 ]; then
    echo "备份验证成功，包含 $KEY_COUNT 个键"
else
    echo "备份验证失败：没有数据"
    redis-cli -p $TEST_PORT shutdown
    exit 1
fi

# 5. 清理
redis-cli -p $TEST_PORT shutdown
rm -f /tmp/verify.rdb

echo "备份验证完成"
```

### 4.3 持久化监控

**监控 Redis 持久化状态：**

```bash
#!/bin/bash
# 检查 Redis 持久化状态

for NODE in "192.168.1.10:7000" "192.168.1.11:7001" "192.168.1.12:7002"; do
    echo "检查节点: $NODE"
    
    # 获取持久化信息
    redis-cli -h ${NODE%%:*} -p ${NODE##*:} INFO Persistence | grep -E "rdb_|aof_"
    
    # 检查最后一次保存时间
    LASTSAVE=$(redis-cli -h ${NODE%%:*} -p ${NODE##*:} LASTSAVE)
    echo "最后一次保存: $LASTSAVE"
    
    echo "---"
done
```

---

## 五、最佳实践与常见问题

### 5.1 最佳实践

**✅ 推荐做法：**

1. **优先备份从节点**
   - 减少对主节点影响
   - 充分利用从节点资源

2. **采用混合持久化**
   - RDB + AOF 混合模式
   - 平衡恢复速度和数据完整性

3. **定期验证备份**
   - 每月演练恢复流程
   - 确保备份文件可用

4. **异地备份**
   - 备份文件同步到远程存储
   - 考虑云存储（OSS、S3）

5. **监控备份任务**
   - 备份失败告警
   - 备份文件大小和时间监控

6. **备份加密**
   - 敏感数据加密存储
   - 使用 SSL 传输

### 5.2 常见问题

**Q1: 备份会影响主节点性能吗？**
- A: 备份从节点不会影响主节点。如果必须备份主节点，使用 `BGSAVE` 异步备份。

**Q2: RDB 和 AOF 如何选择？**
- A: 推荐使用混合持久化（Redis 4.0+），兼顾两者优势。

**Q3: 3主3从需要备份所有节点吗？**
- A: 不需要。每个主节点选择一个从节点备份即可，确保覆盖所有槽数据。

**Q4: 备份文件保留多久？**
- A: 一般保留 7-30 天，根据业务需求和存储容量决定。

**Q5: 集群故障如何恢复？**
- A: 优先恢复从节点数据，然后重新建立主从关系。

### 5.3 决策参考

```
┌────────────────────────────────────────────────────┐
│              Redis 备份方案决策树                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  数据完整性要求？                                  │
│     │                                             │
│     ├─ 高（不能丢失） → AOF + RDB 混合持久化       │
│     │                   + 每日备份                │
│     │                                             │
│     └─ 中等（可容忍少量丢失） → RDB 持久化         │
│                              + 每日备份            │
│                                                    │
│  备份位置选择？                                    │
│     │                                             │
│     └─ 从节点（推荐）                              │
│         - 轮换备份多个从节点                       │
│         - 减少单点压力                            │
│                                                    │
│  备份频率？                                       │
│     │                                             │
│     ├─ 核心数据 → 每日备份                        │
│     ├─ 一般数据 → 每周备份                        │
│     └─ 测试数据 → 按需备份                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 六、完整备份脚本模板

### 6.1 生产级备份脚本

```bash
#!/bin/bash
# redis_cluster_backup_prod.sh
# 生产环境 Redis Cluster 备份脚本

set -e  # 遇到错误立即退出

# ===== 配置部分 =====
BACKUP_DIR="/data/backup/redis"
RETENTION_DAYS=7
LOG_FILE="/var/log/redis_backup.log"
ALERT_WEBHOOK="https://your-alert-webhook"

# 从节点列表（每个主节点选一个从节点）
SLAVES=(
    "192.168.1.11:7001"
    "192.168.1.12:7002"
    "192.168.1.13:7003"
)

# 通知函数
notify() {
    local message="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $message" >> "$LOG_FILE"
    # 可以添加钉钉/企业微信通知
}

# 错误处理
trap 'notify "备份失败：$?" && exit 1' ERR

notify "开始 Redis Cluster 备份"

# 轮询备份从节点
SLAVE_INDEX=$(( ($(date +%u) - 1) % 3 ))
SLAVE_ADDR=${SLAVES[$SLAVE_INDEX]}
SLAVE_HOST=${SLAVE_ADDR%%:*}
SLAVE_PORT=${SLAVE_ADDR##*:}

notify "备份从节点: $SLAVE_ADDR"

# 获取 LASTSAVE 作为对比基准
LASTSAVE_BEFORE=$(redis-cli -h "$SLAVE_HOST" -p "$SLAVE_PORT" LASTSAVE | tr -d '\r')

# 触发 BGSAVE
notify "触发 BGSAVE..."
redis-cli -h "$SLAVE_HOST" -p "$SLAVE_PORT" BGSAVE > /dev/null

# 等待 BGSAVE 完成（最多等待 10 分钟）
TIMEOUT=600
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    LASTSAVE_AFTER=$(redis-cli -h "$SLAVE_HOST" -p "$SLAVE_PORT" LASTSAVE | tr -d '\r')
    if [ "$LASTSAVE_AFTER" != "$LASTSAVE_BEFORE" ]; then
        notify "BGSAVE 完成"
        break
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    notify "错误：BGSAVE 超时"
    exit 1
fi

# 创建备份目录
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# 从远程节点复制 RDB 文件
notify "复制 RDB 文件..."
scp "$SLAVE_HOST:/var/lib/redis/dump.rdb" "$BACKUP_DIR/dump_${DATE}.rdb"

# 压缩
notify "压缩备份文件..."
gzip "$BACKUP_DIR/dump_${DATE}.rdb"

# 计算校验和
CHECKSUM=$(md5sum "${BACKUP_DIR}/dump_${DATE}.rdb.gz" | awk '{print $1}')
notify "备份文件 MD5: $CHECKSUM"

# 清理旧备份
notify "清理 $RETENTION_DAYS 天前的备份..."
find "$BACKUP_DIR" -name "dump_*.rdb.gz" -mtime +$RETENTION_DAYS -delete

# 汇总
BACKUP_SIZE=$(du -h "${BACKUP_DIR}/dump_${DATE}.rdb.gz" | cut -f1)
notify "备份完成: dump_${DATE}.rdb.gz ($BACKUP_SIZE)"

# 可选：同步到远程存储
# rsync -avz "$BACKUP_DIR/" user@remote-server:/backup/redis/

notify "Redis Cluster 备份成功"
exit 0
```

### 6.2 恢复脚本

```bash
#!/bin/bash
# redis_cluster_restore.sh
# Redis Cluster 恢复脚本

set -e

BACKUP_FILE=$1  # 备份文件路径
TARGET_SLAVE=$2 # 目标从节点地址

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_SLAVE" ]; then
    echo "用法: $0 <备份文件> <目标从节点>"
    echo "示例: $0 /backup/redis/dump_20260621_020000.rdb.gz 192.168.1.11:7001"
    exit 1
fi

BACKUP_FILE=$(realpath "$BACKUP_FILE")
SLAVE_HOST=${TARGET_SLAVE%%:*}
SLAVE_PORT=${TARGET_SLAVE##*:}

echo "恢复备份到: $TARGET_SLAVE"
echo "备份文件: $BACKUP_FILE"

# 1. 验证备份文件
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误：备份文件不存在"
    exit 1
fi

# 2. 停止目标从节点
echo "停止从节点..."
redis-cli -h "$SLAVE_HOST" -p "$SLAVE_PORT" SHUTDOWN NOSAVE || true
sleep 5

# 3. 备份当前数据
echo "备份当前数据..."
ssh "$SLAVE_HOST" "mv /var/lib/redis/dump.rdb /var/lib/redis/dump.rdb.backup_$(date +%Y%m%d)"

# 4. 解压并传输备份文件
echo "传输备份文件..."
gunzip -c "$BACKUP_FILE" | ssh "$SLAVE_HOST" "cat > /var/lib/redis/dump.rdb"

# 5. 启动从节点
echo "启动从节点..."
ssh "$SLAVE_HOST" "redis-server /etc/redis/redis.conf"

# 6. 等待同步
echo "等待主从同步..."
sleep 10

# 7. 验证
KEY_COUNT=$(redis-cli -h "$SLAVE_HOST" -p "$SLAVE_PORT" DBSIZE)
echo "恢复完成，当前键数量: $KEY_COUNT"

# 8. 检查集群状态
echo "检查集群状态..."
redis-cli --cluster check "$SLAVE_HOST:$SLAVE_PORT"

echo "恢复成功！"
```

---

## 总结

**3主3从架构备份策略总结：**

| 要点 | 推荐 |
|------|------|
| **备份位置** | ✅ 从节点（轮换备份） |
| **持久化方式** | ✅ RDB + AOF 混合持久化 |
| **备份频率** | ✅ 每日备份 |
| **备份保留** | ✅ 7-30 天 |
| **异地备份** | ✅ 同步到远程存储 |

**核心要点：**
1. **备份从节点，不备份主节点** - 减少对生产环境影响
2. **采用混合持久化** - 平衡恢复速度和数据完整性
3. **定期验证备份** - 确保备份文件可用
4. **监控备份任务** - 及时发现备份失败

---

**相关阅读：**
- [Redis 集群原理与配置](/redis-cluster/)
- [Redis 持久化机制详解](/redis-persistence/)
- [Redis 主从复制配置](/redis-replication/)
