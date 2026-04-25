### 1. 配置 yum 源并安装
---
layout: post
title: "CentOS 7 YUM源配置完全指南：国内镜像加速与软件包管理优化"
date: 2025-03-26
tags: [CentOS, Linux, YUM, 系统管理]
header-img: "img/post-bg-unix-linux.jpg"
---

```
wget http://mirrors.163.com/.help/CentOS7-Base-163.repo		#下载网络yum源
或阿里源：curl -o CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo

mv CentOS7-Base-163.repo /etc/yum.repos.d/			#移动到yum源下
yum clean all							#清空缓存
yum makecache							#建立其库
yum -y install mariadb mariadb-server httpd php php-mysql
```
