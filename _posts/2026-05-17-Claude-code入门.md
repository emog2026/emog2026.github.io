### 参考：https://www.cnblogs.com/knqiufan/p/19449849

1. Claude code使用国内镜像源加速安装

`npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com`

2. 界面配置，适用于智谱

`npx @z_ai/coding-helper`

### fix权限问题，claude.json

"hasCompletedOnboarding": true

3. 命令配置
```
setx ANTHROPIC_BASE_URL "https://open.bigmodel.cn/api/anthropic"
setx ANTHROPIC_AUTH_TOKEN "你的API密钥"
setx ANTHROPIC_MODEL "GLM-4.7"
```
