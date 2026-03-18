# UniRoast Project Context

## 项目概述
UniRoast 是一个校园社交平台，核心玩法是"每日主题照片 Battle + AI 幽默吐槽"。

### 核心价值主张
- 每天一个新主题（如"最糟糕的食堂餐"）
- 用户上传照片 + 配文
- AI 生成幽默吐槽评论
- 社区投票排名（1-5星）
- 每日排行榜（前3名获得勋章）

## 已完成的工作

### Week 1-2: 需求分析
- ✅ 需求文档（docs/requirements.md）
- ✅ 用户画像定义
- ✅ 核心功能优先级排序

### Week 3: 技术架构设计
- ✅ 技术栈选型
  - Frontend: React + Vite + Tailwind
  - Backend: FastAPI + PostgreSQL
  - AI: OpenAI API
  - Deployment: Vercel + Railway
- ✅ 数据库 ER 图设计
- ✅ API 端点规划

### Week 4: 当前阶段 - 开发准备
- ✅ GitHub 仓库创建 (https://github.com/Jekyll-HBC/uniroast)
- ✅ 本地开发环境设置
- ✅ Claude Code Agents 配置
- 🔄 现在开始编码实现

## 技术栈详情

### Frontend
React 18.2+ - UI 框架
Vite 5.0+ - 构建工具
Tailwind CSS 3.4+ - 样式
React Router v6 - 路由
TanStack Query - 数据获取
Zustand - 状态管理
Axios - HTTP 客户端
### Backend
Python 3.11+
FastAPI 0.109+ - Web 框架
PostgreSQL 15+ - 数据库
SQLAlchemy 2.0 - ORM
Alembic - 数据库迁移
Pydantic v2 - 数据验证
### AI & Services
OpenAI API (待定)
Cloudinary - 图片存储
Redis - 缓存（可选）
## 项目目录结构
（见上文的详细结构）

## 开发规范

### Git 工作流
1. 所有功能在独立分支开发
2. 分支命名：`feature/功能名` 或 `fix/bug名`
3. Commit 信息格式：`类型(范围): 描述`
   - feat: 新功能
   - fix: Bug 修复
   - docs: 文档更新
   - style: 代码格式
   - refactor: 重构
   - test: 测试
   - chore: 构建/工具

### 代码审查流程
1. 本地测试通过
2. 创建 Pull Request
3. 代码审查（至少1人）
4. 合并到 main

### 质量标准
- 单元测试覆盖率 > 70%
- API 响应时间 < 500ms
- 移动端完全可用（320px+）
- 所有 API 有错误处理
- 所有用户输入有验证

## 当前开发重点
- [ ] 项目基础架构搭建
- [ ] 数据库模型实现
- [ ] 用户认证系统
- [ ] AI 吐槽服务
- [ ] 核心 UI 组件

## 下一步计划
（待与 AI Agents 讨论后更新）