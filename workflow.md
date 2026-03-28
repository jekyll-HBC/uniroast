# UniRoast 工作流规范

> 本文件供 AI 助手（Kiro/Claude）读取，确保每次协作都符合软件工程课程要求。

---

## 课程核心原则

**过程比功能更重要。** 一个功能不完整但工程实践扎实的项目，可能比功能丰富但过程混乱的项目得分更高。

---

## 六项硬性要求（缺一不可）

| # | 要求 | 当前状态 |
|---|------|---------|
| 1 | 需求文档（功能+非功能需求） | ✅ `Docs/requirements.md` |
| 2 | 架构图及技术选型理由 | ✅ `Docs/architecture.md` |
| 3 | 版本控制工作流（分支策略+代码审查） | ✅ 见下方规范 |
| 4 | CI 流水线（每次 push 自动构建和测试） | ✅ `.github/workflows/ci.yml` |
| 5 | 测试（单元测试+集成测试，附覆盖率） | ⚠️ 集成测试待补充（issue #24） |
| 6 | 项目管理痕迹（issue、里程碑、任务看板） | ✅ GitHub Issues + Milestones + Project Board |

---

## Git 工作流规范

### 分支策略
- `main` — 生产分支，只接受来自 `develop` 的 PR
- `develop` — 集成分支，所有功能分支合并到这里
- `feature/<模块>-<描述>` — 新功能，例如 `feature/auth-jwt-login`
- `fix/<描述>` — Bug 修复，例如 `fix/upload-size-validation`
- `docs/<主题>` — 文档，例如 `docs/api-reference`
- `test/<范围>` — 测试，例如 `test/post-integration`

### 每次开发任务的标准流程

1. **先开 issue**，描述要做什么，关联到对应 Milestone
2. **从 `develop` 创建功能分支**
3. **写代码 + 写测试**（测试随代码一起写，不要最后补）
4. **push 分支，开 PR**，PR 描述里写 `Closes #<issue号>`
5. **等 CI 通过**后 merge 到 `develop`
6. **关闭对应 issue**，在 Project Board 移到 Done

### Commit Message 格式
```
<type>(<scope>): <简短描述>

type: feat | fix | docs | test | refactor | chore | ci
```
示例：
- `feat(backend): 添加帖子投票 API`
- `fix(ci): 修复覆盖率配置`
- `docs(arch): 添加系统架构图`

---

## AI 助手行为规范

每次我（AI）帮你做任何开发任务时，必须遵守：

### 开始任务前
- 检查是否有对应的 GitHub Issue，没有则先创建
- 确认在正确的分支上（功能开发在 `feature/*` 分支）

### 写代码时
- 只写完成当前任务所需的最少代码
- 测试随代码一起写（如果任务涉及新功能或 bug fix）
- 不添加未被要求的功能、注释、错误处理

### 完成任务后
- commit message 遵循上方格式
- push 到功能分支
- 如果任务完成，关闭对应 issue

### 禁止行为
- 不直接 push 到 `main` 或 `develop`
- 不在没有 issue 的情况下做大改动
- 不跳过 CI（不使用 `--no-verify`）

---

## GitHub 项目管理

- **Repo**: https://github.com/BSAI301/course-project-ex1-team-13
- **Milestones**:
  - Milestone 1: Deliverable 1 — Project Proposal
  - Milestone 2: Deliverable 2 — Progress Report
  - Milestone 3: Deliverable 3 & 4 — Demo & Final Report
- **Project Board**: 所有 issue 必须在看板上，Done 列 = closed issues

---

## 当前待办（按优先级）

1. **#24** — 集成测试（注册→登录→发帖完整流程）⚠️ 硬性要求
2. **#25** — 在 README 中补充分支策略说明
3. **#26** — 完善 Leaderboard 页面

---

## 学术诚信红线

- 不能复用以前课程、实习或比赛的项目
- 不能照搬网上教程或开源项目
- 用了外部代码必须在报告和 README 中明确标注引用
