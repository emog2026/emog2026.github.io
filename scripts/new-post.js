#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const today = new Date().toISOString().split('T')[0];

// 获取命令行参数
const title = process.argv[2];

if (!title) {
  console.log('请提供文章标题');
  console.log('使用方法: npm run new "文章标题"');
  console.log('或者: node scripts/new-post.js "文章标题"');
  process.exit(1);
}

// 生成文件名
const sanitizeTitle = title.replace(/\s+/g, '-');
const filename = `${today}-${sanitizeTitle}.md`;
const postPath = path.join('_posts', filename);

// 检查文件是否已存在
if (fs.existsSync(postPath)) {
  console.error(`错误: 文章已存在 - ${postPath}`);
  process.exit(1);
}

// 生成 front matter 内容
const content = `---
layout: post
title: "${title}"
date: ${today}
tags: []
---

# ${title}

文章内容...
`;

// 创建文件
fs.writeFileSync(postPath, content, 'utf8');
console.log(`✓ 新文章已创建: ${postPath}`);
console.log('请编辑文章内容');