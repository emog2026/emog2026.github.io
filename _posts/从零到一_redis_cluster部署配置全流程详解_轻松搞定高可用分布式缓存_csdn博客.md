# 从零到一：Redis Cluster部署配置全流程详解，轻松搞定高可用分布式缓存！-CSDN博客

>  Redis Cluster是Redis官方提供的分布式解决方案，它通过数据分片（Sharding）和主从复制（Replication）来实现高可用性和横向扩展。Redis Cluster能够在多个节点之间自动分配数据，并且在节点故障时自动进行故障转移，确保系统的高可用性。本文将详细介绍Redis Cluster的部署和配置全流程，帮助读者快速搭建一个高可用的Redis集群。 

## **1 Redis Cluster概述**

### **1.1 Redis Cluster特点**

> - 数据分片：Redis Cluster将数据分布在多个节点上，每个节点负责一部分数据
- 高可用性：每个分片（Shard）都有一个主节点和多个从节点，主节点故障时，从节点可以自动提升为主节点
- 自动故障转移：Redis Cluster能够自动检测节点故障，并进行故障转移
- 客户端路由：客户端可以直接连接到集群中的任意节点，节点会根据键的哈希值将请求路由到正确的节点

### **1.2 Redis Cluster架构**

>  Redis Cluster由多个节点组成，每个节点可以是一个主节点或从节点。集群中的每个主节点负责一部分数据，从节点则复制主节点的数据。  Redis Cluster使用哈希槽（Hash Slot）来分配数据，总共有16384个哈希槽，每个键通过CRC16算法计算出一个哈希值，然后映射到对应的哈希槽。 

## **2 Redis Cluster环境准备**

### **2.1 主机节点规划**

| 192.168.10.33 | Master + Slave | 6379/6380 | 节点1（双实例） |
|---------------|----------------|-----------|----------|
| 192.168.10.34 | Master + Slave | 6379/6380 | 节点2（双实例） |
| 192.168.10.35 | Master + Slave | 6379/6380 | 节点3（双实例） |

### **2.2 Redis安装**

>  三台主机上均需要安装redis，安装操作请参考： [Redis安装与基础配置：单节点离线部署与配置解析-CSDN博客](https://blog.csdn.net/qq_43715111/article/details/146324995?spm=1001.2014.3001.5501)

## **3 Redis Cluster配置**

### **3.1 创建Redis配置文件目录**

```
# 在各台主机上创建Redis实例目录
mkdir -p /data/redis-cluster/{6379,6380}
```

### 3.2 配置Redis实例配置文件

```
# 在每台主机的/data/redis-cluster/6379和/data/redis-cluster/6380目录下分别创建redis.conf
cat <<EOF > /data/redis-cluster/6379/redis.conf
bind 0.0.0.0
protected-mode no
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
logfile /data/redis-cluster/6379/redis.log
dir "/data/redis-cluster/6379"
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 5000
appendonly yes
appendfilename "appendonly-6379.aof"
requirepass lahmy1c@
masterauth lahmy1c@
EOF

cat <<EOF > /data/redis-cluster/6380/redis.conf
bind 0.0.0.0
protected-mode no
port 6380
daemonize yes
pidfile /var/run/redis_6380.pid
logfile /data/redis-cluster/6380/redis.log
dir "/data/redis-cluster/6380"
cluster-enabled yes
cluster-config-file nodes-6380.conf
cluster-node-timeout 5000
appendonly yes
appendfilename "appendonly-6380.aof"
requirepass lahmy1c@
masterauth lahmy1c@
EOF
```

### 3.3 启动Redis实例

```
# 在每台主机上分别启动两个Redis实例，端口6379和6380
# 在 Host1 上
/usr/local/redis/bin/redis-server /data/redis-cluster/6379/redis.conf
/usr/local/redis/bin/redis-server /data/redis-cluster/6380/redis.conf
```

### 3.4 验证节点是否启动

```
# 执行如下命令，返回返回PONG，则已启动
/usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ ping
/usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ ping

[root@node4 redis]# /usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ ping
/usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ pingWarning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node4 redis]# /usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ ping
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node4 redis]# 

[root@node5 ~]# /usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ ping
/usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ pingWarning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node5 ~]# /usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ ping
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node5 ~]# 

[root@node6 tool]# /usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ ping
/usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ pingWarning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node6 tool]# /usr/local/redis/bin/redis-cli -p 6380 -a lahmy1c@ ping
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
PONG
[root@node6 tool]#
```

## 4 创建Redis Cluster

### 4.1 使用redis-cli命令创建集群

```
# 在任意一台主机上执行如下命令
/usr/local/redis/bin/redis-cli --cluster create \
192.168.10.33:6379 \
192.168.10.33:6380 \
192.168.10.34:6379 \
192.168.10.34:6380 \
192.168.10.35:6379 \
192.168.10.35:6380 \
--cluster-replicas 1 -a lahmy1c@

参数说明：
--cluster-replicas 1：表示每个主节点有一个从节点


[root@node6 tool]# /usr/local/redis/bin/redis-cli --cluster create \
> 192.168.10.33:6379 \
> 192.168.10.33:6380 \
> 192.168.10.34:6379 \
> 192.168.10.34:6380 \
> 192.168.10.35:6379 \
> 192.168.10.35:6380 \
> --cluster-replicas 1 -a lahmy1c@
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 192.168.10.34:6380 to 192.168.10.33:6379
Adding replica 192.168.10.35:6380 to 192.168.10.34:6379
Adding replica 192.168.10.33:6380 to 192.168.10.35:6379
M: bc972a8cec9c52e5c4b5da01b7674edd8f9891a5 192.168.10.33:6379
   slots:[0-5460] (5461 slots) master
S: f4aebe01a277c7384356d10dd9f14381aadba730 192.168.10.33:6380
   replicates 72a68c3bbe6f8228640afabbd0d6100f681bfb87
M: 4297823a72a4677329764bdfbdd6fdb0f1b25182 192.168.10.34:6379
   slots:[5461-10922] (5462 slots) master
S: 034005a84845645fac6834900a11254db009ccec 192.168.10.34:6380
   replicates bc972a8cec9c52e5c4b5da01b7674edd8f9891a5
M: 72a68c3bbe6f8228640afabbd0d6100f681bfb87 192.168.10.35:6379
   slots:[10923-16383] (5461 slots) master
S: 5eb12144975cb46c0cee39d63407488f7bcc99c6 192.168.10.35:6380
   replicates 4297823a72a4677329764bdfbdd6fdb0f1b25182
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join
...
>>> Performing Cluster Check (using node 192.168.10.33:6379)
M: bc972a8cec9c52e5c4b5da01b7674edd8f9891a5 192.168.10.33:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 034005a84845645fac6834900a11254db009ccec 192.168.10.34:6380
   slots: (0 slots) slave
   replicates bc972a8cec9c52e5c4b5da01b7674edd8f9891a5
M: 4297823a72a4677329764bdfbdd6fdb0f1b25182 192.168.10.34:6379
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: f4aebe01a277c7384356d10dd9f14381aadba730 192.168.10.33:6380
   slots: (0 slots) slave
   replicates 72a68c3bbe6f8228640afabbd0d6100f681bfb87
S: 5eb12144975cb46c0cee39d63407488f7bcc99c6 192.168.10.35:6380
   slots: (0 slots) slave
   replicates 4297823a72a4677329764bdfbdd6fdb0f1b25182
M: 72a68c3bbe6f8228640afabbd0d6100f681bfb87 192.168.10.35:6379
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
[root@node6 tool]#
```

### 4.2 验证集群状态

```
# 如果集群状态正常，会显示每个节点的角色（主节点或从节点）以及哈希槽的分配情况
/usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ --cluster check 192.168.10.33:6379

[root@node6 tool]# /usr/local/redis/bin/redis-cli -p 6379 -a lahmy1c@ --cluster check 192.168.10.33:6379
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
192.168.10.33:6379 (bc972a8c...) -> 0 keys | 5461 slots | 1 slaves.
192.168.10.34:6379 (4297823a...) -> 0 keys | 5462 slots | 1 slaves.
192.168.10.35:6379 (72a68c3b...) -> 0 keys | 5461 slots | 1 slaves.
[OK] 0 keys in 3 masters.
0.00 keys per slot on average.
>>> Performing Cluster Check (using node 192.168.10.33:6379)
M: bc972a8cec9c52e5c4b5da01b7674edd8f9891a5 192.168.10.33:6379
   slots:[0-5460] (5461 slots) master
   1 additional replica(s)
S: 034005a84845645fac6834900a11254db009ccec 192.168.10.34:6380
   slots: (0 slots) slave
   replicates bc972a8cec9c52e5c4b5da01b7674edd8f9891a5
M: 4297823a72a4677329764bdfbdd6fdb0f1b25182 192.168.10.34:6379
   slots:[5461-10922] (5462 slots) master
   1 additional replica(s)
S: f4aebe01a277c7384356d10dd9f14381aadba730 192.168.10.33:6380
   slots: (0 slots) slave
   replicates 72a68c3bbe6f8228640afabbd0d6100f681bfb87
S: 5eb12144975cb46c0cee39d63407488f7bcc99c6 192.168.10.35:6380
   slots: (0 slots) slave
   replicates 4297823a72a4677329764bdfbdd6fdb0f1b25182
M: 72a68c3bbe6f8228640afabbd0d6100f681bfb87 192.168.10.35:6379
   slots:[10923-16383] (5461 slots) master
   1 additional replica(s)
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
[root@node6 tool]#
```

## 5 Redis Cluster操作

### 5.1 客户端连接

```
# 客户端可以连接到集群中的任意节点，节点会根据键的哈希值将请求路由到正确的节点
 /usr/local/redis/bin/redis-cli -c -h 192.168.10.33 -p 6379 -a lahmy1c@

[root@node6 tool]# /usr/local/redis/bin/redis-cli -c -h 192.168.10.33 -p 6379 -a lahmy1c@
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
192.168.10.33:6379>
```

### 5.2 数据操作

```
# 在集群中，数据的读写操作与单机Redis相同
192.168.10.33:6379> set keytest test01
OK
192.168.10.33:6379> get keytest
"test01"
192.168.10.33:6379>
```

### 5.3 集群管理

> Redis Cluster提供了一些管理命令，可以用于查看集群状态、添加节点、删除节点等操作。以下是一些常用的集群管理命令：

#### 5.3.1 查看集群节点信息

```
/usr/local/redis/bin/redis-cli -h 192.168.10.33 -p 6379 -a lahmy1c@ cluster nodes

[root@node6 ~]# /usr/local/redis/bin/redis-cli -h 192.168.10.33 -p 6379 -a lahmy1c@ cluster nodes
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
034005a84845645fac6834900a11254db009ccec 192.168.10.34:6380@16380 slave bc972a8cec9c52e5c4b5da01b7674edd8f9891a5 0 1742291584000 1 connected
4297823a72a4677329764bdfbdd6fdb0f1b25182 192.168.10.34:6379@16379 master - 0 1742291585524 3 connected 5461-10922
f4aebe01a277c7384356d10dd9f14381aadba730 192.168.10.33:6380@16380 slave 72a68c3bbe6f8228640afabbd0d6100f681bfb87 0 1742291584519 5 connected
5eb12144975cb46c0cee39d63407488f7bcc99c6 192.168.10.35:6380@16380 slave 4297823a72a4677329764bdfbdd6fdb0f1b25182 0 1742291585525 3 connected
72a68c3bbe6f8228640afabbd0d6100f681bfb87 192.168.10.35:6379@16379 master - 0 1742291585000 5 connected 10923-16383
bc972a8cec9c52e5c4b5da01b7674edd8f9891a5 192.168.10.33:6379@16379 myself,master - 0 1742291584000 1 connected 0-5460
[root@node6 ~]#
```

#### 5.3.2 添加新节点

```
/usr/local/redis/bin/redis-cli --cluster add-node 192.168.10.31:6379 192.168.10.31:6379
```

#### 5.3.3 删除节点

```
/usr/local/redis/bin/redis-cli --cluster del-node 192.168.10.31:6379 <node-id>
```

## **6 常见问题及解决方案**

### **6.1 集群节点故障**

> - 当集群中的某个节点故障时，Redis Cluster会自动进行故障转移
- 如果故障节点是主节点，集群会将其从节点提升为新的主节点
- 如果故障节点是从节点，集群会继续运行，直到从节点恢复

### **6.2 数据迁移**

>  在Redis Cluster中，数据迁移是通过哈希槽的重新分配实现的。可以使用redis-cli工具手动迁移哈希槽，命令如下： 

```
/usr/local/redis/bin/redis-cli --cluster reshard 192.168.10.31:6379 -a lahmy1c@
```

## **7 总结**

>  通过本文的介绍，希望可以帮助你了解Redis Cluster的部署和配置的全流程。