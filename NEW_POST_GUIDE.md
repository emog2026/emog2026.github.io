# 创建新文章的多种方法

## 方法1：使用 npm 脚本（推荐）
```bash
npm run new "文章标题"
```

## 方法2：使用 Node.js 脚本
```bash
node scripts/new-post.js "文章标题"
```

## 方法3：使用 Windows 批处理脚本
```cmd
new_post.bat "文章标题"
```

## 方法4：使用 Bash 脚本
```bash
chmod +x new_post.sh
./new_post.sh "文章标题"
```

## 方法5：手动复制模板
直接复制 `_posts/TEMPLATE.md` 文件，重命名为 `YYYY-MM-DD-文章标题.md`

## 方法6：VS Code Snippet
在 VS Code 中新建 `.md` 文件，输入 `jekyll` 然后按 Tab 键，会自动生成完整的 front matter 模板。

## 自动配置
现在所有文章都会自动应用 `layout: post`，无需手动指定。

## 示例
```bash
npm run new "Hello World"
```
会创建文件：`_posts/2025-04-25-Hello-World.md`