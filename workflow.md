@git-workflow-master

# UniRoast Git 工作流配置

## 项目背景
我们需要为 UniRoast 项目建立一个严格的 Git 工作流，确保代码质量和团队协作效率。

## 分支策略

### 主要分支
- `main` - 生产环境代码（受保护，仅通过 PR 合并）
- `develop` - 开发集成分支（受保护）
- `staging` - 预发布测试分支

### 功能分支命名规范
请为以下场景制定分支命名规则：

1. 新功能开发：`feature/功能模块-简短描述`
   - 例如：`feature/auth-jwt-login`
   - 例如：`feature/ai-roast-service`

2. Bug 修复：`fix/问题描述`
   - 例如：`fix/upload-image-error`

3. 文档更新：`docs/文档主题`
   - 例如：`docs/api-documentation`

4. 重构：`refactor/模块名`
   - 例如：`refactor/database-models`

5. 测试：`test/测试范围`
   - 例如：`test/auth-endpoints`

### Commit Message 规范

请生成一个 `.gitmessage` 模板文件和 `CONTRIBUTING.md` 文档，包含：

**Commit 格式：**
<type>(<scope>): <subject>

<body>

<footer>

```

Type 类型：

feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构（既不是新功能也不是 Bug 修复）
test: 测试相关
chore: 构建/工具链配置
Pull Request 流程
请创建 PR 模板（.github/PULL_REQUEST_TEMPLATE.md），包含：

变更类型（多选）

 新功能
 Bug 修复
 文档更新
 重构
 性能优化
变更描述

做了什么改动？
为什么需要这个改动？
如何验证？
测试清单

 单元测试已通过
 手动测试已完成
 无新增 ESLint/Flake8 警告
相关 Issue

Closes #XX
GitHub Actions 配置
请创建 .github/workflows/ci.yml，实现：

代码质量检查（每次 PR）

Backend: flake8 + black 格式检查
Frontend: eslint + prettier 检查
自动化测试（每次 PR）

Backend: pytest
Frontend: vitest
分支保护规则建议

main 和 develop 需要 PR 审查
CI 检查必须通过
至少1人批准（如果是团队项目）
首次分支创建指令
请提供我现在应该执行的 Git 命令，来初始化这个工作流：

打开 develop 分支
创建第一个功能分支 feature/project-setup
设置上游跟踪
当前状态：

本地仓库：D:\Uniroast
远程仓库：https://github.com/jekyll-HBC/uniroast
当前分支：main
请提供完整的命令序列。
---

## 📋 推荐的执行顺序

基于你的需求，我建议这样的流程：

### **（日期）**

1. ✅ **创建 PROJECT_CONTEXT.md**
   - 把我上面提供的模板保存到项目根目录
   
2. 🎨 **UI/UX 设计讨论**
   - 把设计讨论指令发给 Claude Code
   - 仔细阅读每个 Agent 的回复
   - 形成最终设计决策文档
   
3. 🌳 **设置 Git 工作流**
   - 把 Git 配置指令发给 Claude Code
   - 执行生成的 Git 命令
   - 创建第一个功能分支 `feature/project-setup`

4. 📝 **文档整理**
   - 把设计决策和 Git 规范添加到 `PROJECT_CONTEXT.md`
   - Commit 并推送到 GitHub

### **（日期）**

5. 🏗️ **项目初始化**（在 `feature/backend-init` 分支）
   - 后端骨架搭建
   - 创建 PR，审查，合并到 `develop`

6. 🎨 **前端初始化**（在 `feature/frontend-init` 分支）
   - React + Tailwind 配置
   - 创建 PR，合并

### **（日期）**

按照功能模块，每个分支完成一个独立功能，PR → 审查 → 合并。

---