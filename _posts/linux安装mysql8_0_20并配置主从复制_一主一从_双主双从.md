# Linux安装Mysql8.0.20并配置主从复制（一主一从，双主双从）

#### 1. 主从复制解释

 将主数据库的增删改查等操作记录到二进制日志文件中，从库接收主库日志文件，根据最后一次更新的起始位置，同步复制到从数据库中，使得主从数据库保持一致。

#### 2. 主从复制的作用

- 高可用性：主数据库异常可切换到从数据库
- 负载均衡：实现读写分离
- 备份：进行日常备份

#### 3. Mysql主从复制过程

![](https://img2020.cnblogs.com/blog/1119097/202009/1119097-20200902174031628-2031812945.png)

**Binary log：主数据库的二进制日志；Relay log：从服务器的中继日志。**

复制过程：

 （1）主数据库在每次事务完成前，将该操作记录到binlog日志文件中；

 （2）从数据库中有一个I/O线程，负责连接主数据库服务，并读取binlog日志变化，如果发现有新的变动，则将变动写入到relay-log，否则进入休眠状态；

 （3）从数据库中的SQL Thread读取中继日志，并串行执行SQL事件，使得从数据库与主数据库始终保持一致。

注意事项：

 （1）涉及时间函数时，会出现数据不一致。原因是，复制过程的两次IO操作和网络、磁盘效率等问题势必导致时间戳不一致；

 （2）涉及系统函数时，会出现不一致。如：@@hostname，获取主机名称，主从数据库服务器名称不一致导致数据不一致；

 （3）......

#### 4. 一主一从配置

![](https://img2020.cnblogs.com/blog/1119097/202009/1119097-20200909163133602-399025888.png)

- 服务器划分

| 服务器IP | 角色 |
|-------|----|
| 192.168.133.129 | Master1 |
| 192.168.133.130 | Slave1 |

- 主数据库安装

```
# 进入目录
cd /opt

# 下载安装包
wget https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.20-linux-glibc2.12-x86_64.tar.xz

# 解压
tar -xvf mysql-8.0.20-linux-glibc2.12-x86_64.tar.xz

# 拷贝到/usr/local
mv /opt/mysql-8.0.20-linux-glibc2.12-x86_64 /usr/local

# 进入/usr/local
cd /usr/local

# 修改名称为mysql-8.0.20
mv mysql-8.0.20-linux-glibc2.12-x86_64 mysql-8.0.20

# 创建存放数据文件夹
mkdir /usr/local/mysql-8.0.20/data

# 创建用户及用户组
groupadd mysql
useradd -g mysql mysql

# 授权
chown -R mysql.mysql /usr/local/mysql-8.0.20

# 初始化数据库(记录临时密码)
cd /usr/local/mysql-8.0.20/

./bin/mysqld --user=mysql --lower-case-table-names=1 --basedir=/usr/local/mysql-8.0.20/ --datadir=/usr/local/mysql-8.0.20/data/ --initialize ;

# 配置my.cnf
vi /etc/my.cnf

# 清空，使用下面内容
// 文件内容开始

[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-主机配置
# 主服务器唯一ID
server-id=1
# 启用二进制日志
log-bin=mysql-bin
# 设置不要复制的数据库(可设置多个)
binlog-ignore-db=sys
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
binlog-ignore-db=performance_schema
# 设置需要复制的数据库(可设置多个)
binlog-do-db=test
# 设置logbin格式
binlog_format=STATEMENT

// 文件内容结束

# 建立Mysql服务
cp -a ./support-files/mysql.server /etc/init.d/mysql
chmod +x /etc/init.d/mysql
chkconfig --add mysql

# 检查服务是否生效
chkconfig --list mysql

# 启动、停止、重启
service mysql start
service mysql stop
service mysql restart

# 创建软连接
ln -s /usr/local/mysql-8.0.20/bin/mysql /usr/bin 

# 登录（使用临时密码）
mysql -uroot -p

# 修改密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new password';

# 退出，使用新密码登录
quit
mysql -uroot -p

# 修改root权限，增加远程连接
use mysql
update user set host ='%' where user='root';
alter user 'root'@'%' identified with mysql_native_password by 'new password';
flush privileges;

# 退出
quit
```

- 从数据库安装
 和主数据库安装一致，但配置文件内容不同。

```
# 配置my.cnf
vi /etc/my.cnf

# 清空，使用下面内容
// 文件内容开始

[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-从机配置
# 从服务器唯一ID
server-id=2
# 启用中继日志
relay-log=mysql-relay

// 文件内容结束
```

- 关闭主从数据库服务器防火墙或开放3306端口

```
# 查看防火墙状态
systemctl status firewalld

# 关闭防火墙
systemctl stop firewalld
```

- 主从数据库测试是否已经可以远程访问

```
# 主数据库服务器测试从数据库
mysql -uroot -p -h192.168.133.130 -P3306

# 从数据库服务器测试主数据库
mysql -uroot -p -h192.168.133.129 -P3306
```

- 主数据库创建用户slave并授权

```
# 登录
mysql -uroot -p

# 创建用户
create user 'slave'@'%' identified with mysql_native_password by 'password';

# 授权
grant replication slave on *.* to 'slave'@'%';

# 刷新权限
flush privileges;
```

- 从数据库验证slave用户是否可用

```
mysql -uslave -p -h192.168.133.129 -P3306
```

- 主数据库查询服务ID及Master状态

```
# 登录
mysql -uroot -p

# 查询server_id是否可配置文件中一致
show variables like 'server_id';

# 若不一致，可设置临时ID（重启失效）
set global server_id = 1;

# 查询Master状态，并记录 File 和 Position 的值
show master status;

# 注意：执行完此步骤后退出主数据库，防止再次操作导致 File 和 Position 的值发生变化
```

- 从数据库中设置主数据库

```
# 登录
mysql -uroot -p

# 查询server_id是否可配置文件中一致
show variables like 'server_id';

# 若不一致，可设置临时ID（重启失效）
set global server_id = 2;

# 设置主数据库参数
change master to master_host='192.168.133.129',master_port=3306,master_user='slave',master_password='password',master_log_file='mysql-bin.000002',master_log_pos=156;

# 开始同步
start slave;

# 若出现错误，则停止同步，重置后再次启动
stop slave;
reset slave;
start slave;

# 查询Slave状态
show slave status\G

# 查看是否配置成功
# 查看参数 Slave_IO_Running 和 Slave_SQL_Running 是否都为yes，则证明配置成功。若为no，则需要查看对应的 Last_IO_Error 或 Last_SQL_Error 的异常值。
```

- 测试
 通过工具连接主从数据库或者在服务器连接。
注意：主数据库的配置文件中配置了需要同步的数据库，因此只会同步配置的数据库，不配置则同步全部。

```
# 在主数据库创建数据库test
create database test;

# 从数据库查看
show databases;

# 在主数据库创建表
use test;
create table t_user(id int, name varchar(20));

# 插入数据
insert into t_user values(1, 'C3Stones');

# 在从数据库查看
use test;
select * from t_user;

# 其他删改查操作请自行测试
```

#### 5. 双主双从配置

 双主双从即两台主机分别存在两台从机，每台从机只复制对应的主机，两台主机互为主备。

![](https://img2020.cnblogs.com/blog/1119097/202009/1119097-20200902174012201-1219501048.png)

- 服务器划分

| 服务器IP | 角色 |
|-------|----|
| 192.168.133.129 | Master1 |
| 192.168.133.130 | Slave1 |
| 192.168.133.131 | Master2 |
| 192.168.133.132 | Slave2 |

- 安装数据库请参考上述安装主数据库
 四个配置文件替换如下：
 （1）Mater1

```
[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-主机1配置
# 主服务器唯一ID
server-id=1
# 启用二进制日志
log-bin=mysql-bin
# 设置不要复制的数据库(可设置多个)
binlog-ignore-db=sys
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
binlog-ignore-db=performance_schema
# 设置需要复制的数据库(可设置多个)
binlog-do-db=test
# 设置logbin格式
binlog_format=STATEMENT
# 写入操作更新二进制日志文件
log-slave-updates
# 自增长字段起始值，默认值为1，取值范围：1 ~ 65535
auto-increment-increment=2
# 自增长字段递增量，取值范围：1 ~ 65535
auto-increment-offset=1
```

（2）Mater2

```
[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-主机2配置
# 主服务器唯一ID
server-id=3
# 启用二进制日志
log-bin=mysql-bin
# 设置不要复制的数据库(可设置多个)
binlog-ignore-db=sys
binlog-ignore-db=mysql
binlog-ignore-db=information_schema
binlog-ignore-db=performance_schema
# 设置需要复制的数据库(可设置多个)
binlog-do-db=test
# 设置logbin格式
binlog_format=STATEMENT
# 写入操作更新二进制日志文件
log-slave-updates
# 自增长字段起始值，默认值为1，取值范围：1 ~ 65535
auto-increment-increment=2
# 自增长字段递增量，取值范围：1 ~ 65535
auto-increment-offset=2
```

（3）Slave1

```
[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-从机1配置
# 从服务器唯一ID
server-id=2
# 启用中继日志
relay-log=mysql-relay
```

（4）Slave2

```
[mysqld]
basedir=/usr/local/mysql-8.0.20
datadir=/usr/local/mysql-8.0.20/data
character-set-server=utf8
lower-case-table-names=1
default_authentication_plugin=mysql_native_password

# 主从复制-从机2配置
# 从服务器唯一ID
server-id=4
# 启用中继日志
relay-log=mysql-relay
```

- 双主双从数据库均重启

```
service restart mysql
```

- 四台服务器均关闭防火墙

```
systemctl stop firewalld
```

- 两台主数据库分别创建用户slave并授权

```
# 登录
mysql -uroot -p

# 创建用户
create user 'slave'@'%' identified with mysql_native_password by 'password';

# 授权
grant replication slave on *.* to 'slave'@'%';

# 刷新权限
flush privileges;
```

- 主从数据库验证slave用户是否可用

```
# 主数据库1服务器测试
mysql -uslave -p -h192.168.133.130 -P3306
mysql -uslave -p -h192.168.133.131 -P3306

# 从数据库1服务器测试主数据库1
mysql -uroot -p -h192.168.133.129 -P3306

# 主数据库2服务器测试
mysql -uslave -p -h192.168.133.129 -P3306
mysql -uslave -p -h192.168.133.132 -P3306

# 从数据库1服务器测试主数据库1
mysql -uroot -p -h192.168.133.131 -P3306
```

- 两台主数据库查询服务ID及Master状态

```
# 登录
mysql -uroot -p

# 查询server_id是否可配置文件中一致
show variables like 'server_id';

# 若不一致，可设置临时ID（重启失效）
# 主数据库1
set global server_id = 1;
# 主数据库2
set global server_id = 3;

# 查询Master状态，并记录 File 和 Position 的值
show master status;

# 注意：执行完此步骤后退出主数据库，防止再次操作导致 File 和 Position 的值发生变化
```

- 从数据库1中设置主数据库1

```
# 登录
mysql -uroot -p

# 查询server_id是否可配置文件中一致
show variables like 'server_id';

# 若不一致，可设置临时ID（重启失效）
set global server_id = 2;

# 设置主数据库参数
change master to master_host='192.168.133.129',master_port=3306,master_user='slave',master_password='password',master_log_file='mysql-bin.000003',master_log_pos=156;

# 开始同步
start slave;

# 若出现错误，则停止同步，重置后再次启动
stop slave;
reset slave;
start slave;

# 查询Slave状态
show slave status\G

# 查看是否配置成功
# 查看参数 Slave_IO_Running 和 Slave_SQL_Running 是否都为yes，则证明配置成功。若为no，则需要查看对应的 Last_IO_Error 或 Last_SQL_Error 的异常值。
```

- 从数据库2中设置主数据库2

```
# 登录
mysql -uroot -p

# 查询server_id是否可配置文件中一致
show variables like 'server_id';

# 若不一致，可设置临时ID（重启失效）
set global server_id = 4;

# 设置主数据参数
change master to master_host='192.168.133.131',master_port=3306,master_user='slave',master_password='password',master_log_file='mysql-bin.000001',master_log_pos=156;

# 开始同步
start slave;

# 若出现错误，则停止同步，重置后再次启动
stop slave;
reset slave;
start slave;

# 查询Slave状态
show slave status\G

# 查看是否配置成功
# 查看参数 Slave_IO_Running 和 Slave_SQL_Running 是否都为yes，则证明配置成功。若为no，则需要查看对应的 Last_IO_Error 或 Last_SQL_Error 的异常值。
```

- 主数据库1中设置主数据库2

```
# 登录
mysql -uroot -p

# 设置主数据库参数
change master to master_host='192.168.133.131',master_port=3306,master_user='slave',master_password='password',master_log_file='mysql-bin.000001',master_log_pos=156;

# 开始同步
start slave;

# 若出现错误，则停止同步，重置后再次启动
stop slave;
reset slave;
start slave;

# 查询Slave状态
show slave status\G

# 查看是否配置成功
# 查看参数 Slave_IO_Running 和 Slave_SQL_Running 是否都为yes，则证明配置成功。若为no，则需要查看对应的 Last_IO_Error 或 Last_SQL_Error 的异常值。
```

- 主数据库2中设置主数据库1

```
# 登录
mysql -uroot -p

# 设置主数据库参数
change master to master_host='192.168.133.129',master_port=3306,master_user='slave',master_password='password',master_log_file='mysql-bin.000003',master_log_pos=156;

# 开始同步
start slave;

# 若出现错误，则停止同步，重置后再次启动
stop slave;
reset slave;
start slave;

# 查询Slave状态
show slave status\G

# 查看是否配置成功
# 查看参数 Slave_IO_Running 和 Slave_SQL_Running 是否都为yes，则证明配置成功。若为no，则需要查看对应的 Last_IO_Error 或 Last_SQL_Error 的异常值。
```

- 测试
 通过工具连接双主双从数据库或者在服务器连接。
注意：主数据库的配置文件中配置了需要同步的数据库，因此只会同步配置的数据库，不配置则同步全部。

```
# 在主数据库1创建数据库test
create database test;

# 其他三个数据库查看
show databases;

# 在主数据库1创建表
use test;
create table t_user(id int, name varchar(20));

# 插入数据
insert into t_user values(1, 'C3Stones');

# 其他三个数据库查看
use test;
select * from t_user;

# 其他删改查操作请自行测试
```