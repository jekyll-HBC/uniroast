# WeRoast UI 重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 UniRoast 前端 UI 改造为高保真复刻 WeMust 风格的 WeRoast。

**Architecture:** 改造现有 Login/Home/Profile/Navbar 页面，新增 ProfileInfo、MoodleThemes、Friends、Feedback、VIP 占位页，所有现有功能组件保持不变仅入口变化。

**Tech Stack:** React 18, React Router v7, Tailwind CSS v4, Zustand, Axios

---

### Task 1: 登录页文案更新

**Files:**
- Modify: `Frontend/src/pages/Login.jsx`

- [ ] 将副标题 `'欢迎来烤人 ～'` 改为 `'烤肉人，歡迎您～'`
- [ ] 将注册副标题 `'加入 UniRoast'` 改为 `'加入 WeRoast'`
- [ ] 删除 `'请绘制求饶图案'` 那行 `<p>` 标签
- [ ] `git commit -m "feat(frontend): 登录页文案改为 WeRoast 风格"`

---

### Task 2: Navbar Logo 改名

**Files:**
- Modify: `Frontend/src/components/Navbar.jsx`

- [ ] 将 Logo 文字 `UniRoast` 改为 `WeRoast`
- [ ] `git commit -m "feat(frontend): navbar logo 改为 WeRoast"`

---

### Task 3: 首页重构

**Files:**
- Modify: `Frontend/src/pages/Home.jsx`
- Modify: `Frontend/src/components/Navbar.jsx`

- [ ] 删除 `Navbar.jsx` 中首页 Tab 栏区块（`{isHome && (...)}` 整段）
- [ ] 删除 `Navbar.jsx` 中 `useHomeTab` import 和相关逻辑
- [ ] 重写 `Home.jsx` 为单页滚动布局，删除三 tab 分支逻辑
- [ ] 新增顶部绿色 Header（居中 WeRoast 大字 + 推荐/WeRoast 两个快捷按钮）
- [ ] 新增 8 个六边形应用图标网格（Moodle/我的帖子/今日最熱/隨機Roast/發帖/意見反饋/好友/會員）
- [ ] 新增 `handleRandomRoast`（随机取帖跳转）
- [ ] 新增今日主題/每日主題 tab 列表区域，删除原"今天日程"卡片
- [ ] `Home` 接收 `onOpenCreate` prop
- [ ] `git commit -m "feat(frontend): 首页重构为 WeRoast 风格单页布局"`

---

### Task 4: 新增路由和占位页

**Files:**
- Modify: `Frontend/src/App.jsx`
- Create: `Frontend/src/pages/MoodleThemes.jsx`
- Create: `Frontend/src/pages/RecommendPage.jsx`
- Create: `Frontend/src/pages/WeroastPage.jsx`
- Create: `Frontend/src/pages/FriendsPlaceholder.jsx`
- Create: `Frontend/src/pages/FeedbackPlaceholder.jsx`
- Create: `Frontend/src/pages/VipPlaceholder.jsx`

- [ ] 创建 `RecommendPage.jsx`（直接渲染 `RecommendFeed`）
- [ ] 创建 `WeroastPage.jsx`（今日主题列表，复用现有 API `/themes/?today=true`）
- [ ] 创建 `MoodleThemes.jsx`（Moodle 蓝色风格，展示所有主题，热度进度条）
- [ ] 创建三个占位页（Friends/Feedback/Vip，统一结构：大 emoji + 文字）
- [ ] 在 `App.jsx` 注册所有新路由
- [ ] `Home` 路由改为 `<Home onOpenCreate={handleOpenCreate} />`
- [ ] `git commit -m "feat(frontend): 新增 Moodle主题库、推荐、WeRoast、占位页及路由"`

---

### Task 5: 我的页重构

**Files:**
- Modify: `Frontend/src/pages/Profile.jsx`

- [ ] 替换顶部卡片为 Instagram 风格 header（头像+用户名+学院+5项统计：帖子/获票/连战天/关注/粉丝）
- [ ] 替换页面主体：个人信息绿色按钮 + 意见反馈/会员双列 + 我的帖子/收藏/好友/设置菜单
- [ ] 保留底部"我的战绩"帖子列表不变
- [ ] `git commit -m "feat(frontend): 我的页改为 Instagram+WeMust 混合风格"`

---

### Task 6: 新增个人信息页

**Files:**
- Create: `Frontend/src/pages/ProfileInfo.jsx`
- Modify: `Frontend/src/App.jsx`

- [ ] 创建 `ProfileInfo.jsx`：顶部返回/保存导航栏、头像区、基本信息组（用户名只读、简介可编辑、性别/学院只读）、联系方式组（大学邮箱只读、私人邮箱/手机可编辑）、账号安全组（修改密码入口）
- [ ] 保存调用 `PATCH /auth/me`，成功后 `fetchMe()` 刷新并返回
- [ ] 在 `App.jsx` 添加 `<Route path="/profile-info" element={<PrivateRoute><ProfileInfo /></PrivateRoute>} />`
- [ ] `git commit -m "feat(frontend): 新增个人信息页 ProfileInfo"`

