---
layout: post
title: "GitLab CI/CD 实战教程：自动化构建、测试、部署全流程"
date: 2026-05-03
tags: [DevOps, CI/CD, GitLab, 自动化, 持续集成]
header-style: 'text'
subtitle: "从代码提交到自动部署，打造高效的 CI/CD 流水线"
---

## 📌 一句话总结
GitLab CI/CD 是一个内置的持续集成、持续交付工具，通过 `.gitlab-ci.yml` 配置文件实现代码的自动化构建、测试和部署。

## 🎯 它是做什么的？

GitLab CI/CD 就像是一个"自动化生产流水线"：

- **持续集成（CI）**：代码提交后自动构建和测试
- **持续交付（CD）**：通过所有测试后自动部署到生产环境
- **自动化流程**：减少手动操作，降低出错率
- **快速反馈**：几分钟内发现问题，而不是几天后

## 🔑 核心概念

**Pipeline（流水线）**
- 专业说：由多个 Stage 组成的自动化流程
- 通俗说：就像工厂的生产线，原材料（代码）经过多个工序后变成产品（应用）

**Stage（阶段）**
- 专业说：Pipeline 中的一个步骤，包含多个 Job
- 通俗说：生产线上的一道工序，如"组装"、"测试"、"包装"

**Job（任务）**
- 专业说：具体执行的命令序列
- 通俗说：工序中的一个具体动作，由 Runner 执行

**Runner（执行器）**
- 专业说：执行 CI/CD 任务的独立服务
- 通俗说：流水线上的工人，负责完成具体的工作

## 💡 实战示例

### 基础的 `.gitlab-ci.yml` 配置

```yaml
# 定义流水线的阶段
stages:
  - build
  - test
  - deploy

# 定义变量
variables:
  DOCKER_IMAGE: myapp:${CI_COMMIT_SHORT_SHA}

# 构建阶段
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $DOCKER_IMAGE
  only:
    - main
    - develop

# 测试阶段
test:
  stage: test
  image: node:14
  script:
    - npm install
    - npm run test
    - npm run lint
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# 部署到开发环境
deploy:dev:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - ssh -o StrictHostKeyChecking=no user@dev-server "docker pull $DOCKER_IMAGE && docker stop myapp && docker rm myapp && docker run -d --name myapp -p 80:80 $DOCKER_IMAGE"
  only:
    - develop
  when: manual

# 部署到生产环境
deploy:prod:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - ssh -o StrictHostKeyChecking=no user@prod-server "docker pull $DOCKER_IMAGE && docker stop myapp && docker rm myapp && docker run -d --name myapp -p 80:80 $DOCKER_IMAGE"
  only:
    - main
  when: manual
```

## 🚀 高级用法

### 使用缓存加速构建

```yaml
build:
  stage: build
  image: node:14
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
```

### 多环境部署

```yaml
deploy:staging:
  stage: deploy
  variables:
    DEPLOY_ENV: staging
    SERVER_IP: $STAGING_SERVER_IP
  script:
    - ./deploy.sh
  only:
    - develop
  environment:
    name: staging
    url: https://staging.example.com

deploy:production:
  stage: deploy
  variables:
    DEPLOY_ENV: production
    SERVER_IP: $PRODUCTION_SERVER_IP
  script:
    - ./deploy.sh
  only:
    - main
  when: manual
  environment:
    name: production
    url: https://example.com
```

### 自动化测试和代码质量检查

```yaml
test:unit:
  stage: test
  image: node:14
  script:
    - npm install
    - npm run test:unit
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

test:e2e:
  stage: test
  image: node:14
  services:
    - postgres:13
    - redis:latest
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_pass
  script:
    - npm install
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - tests/e2e/screenshots/
    expire_in: 1 week

code_quality:
  stage: test
  image: sonarsource/sonar-scanner-cli
  script:
    - sonar-scanner -Dsonar.projectKey=$SONAR_PROJECT_KEY -Dsonar.sources=src -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_TOKEN
  allow_failure: true
```

## 📊 Pipeline 可视化

GitLab CI/CD 提供了强大的可视化界面：

- **Pipeline 图表**：查看各个阶段的执行状态
- **实时日志**：查看每个 Job 的输出
- **Artifacts**：下载构建产物
- **环境管理**：管理多个部署环境

## ⚠️ 最佳实践

1. **使用 `.gitlab-ci.yml` 模板**：GitLab 提供了多种语言的模板
2. **合理使用缓存**：显著加快构建速度
3. **分离敏感信息**：使用 CI/CD 变量存储密钥
4. **并行执行**：独立的 Job 可以并行运行
5. **手动触发**：生产环境部署建议使用手动触发
6. **通知集成**：配置 Slack、邮件等通知

## 🔗 相关资源

- [GitLab CI/CD 官方文档](https://docs.gitlab.com/ee/ci/)
- [GitLab CI/CD 示例项目](https://gitlab.com/gitlab-org/project-templates)
- [`.gitlab-ci.yml` 配置参考](https://docs.gitlab.com/ee/ci/yaml/)

---

> 💡 **提示**：CI/CD 是 DevOps 的核心实践，掌握 GitLab CI/CD 能大大提升团队的开发效率！
