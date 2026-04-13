❯ 这是我们软件工程与项目管理这门课做的项目，老师现在发了一项作业：@Instruction.docx，然后这个是提交报告的  
模版：@progress_report_template.docx，请你告诉我要怎么写，我们项目有哪些缺少的                             

⏺ Agent(Read instruction and template documents)
  ⎿  Done (4 tool uses · 18.2k tokens · 43s)
  (ctrl+o to expand)                                                               
             
⏺ 现在我来看一下你们项目的当前状态，帮你对照每个章节分析缺什么。
                                                                                          
⏺ Explore(Explore project structure and status)
  ⎿  Done (18 tool uses · 27.6k tokens · 52s)                                                              
  (ctrl+o to expand)                                                                                     
                                                                                                           
⏺ 好，现在我对你们项目有完整了解了。以下是逐章节分析：                                                   
                                                                                                           
  ---                                                                                                      
  报告结构 & 你们项目的现状                                                                                
                                                                                                           
  Section 1 — Project Summary and Requirements (20分)                                                      
                                                                                                           
  你们有的：                                                                                               
  - Docs/requirements.md 里已有 14 条 FR + 14 条 NFR，直接用                                               
                                                                                                           
  要写的：                                                                                                 
  - 5–8 句话的项目摘要（UniRoast 是什么、解决什么问题、目标用户、核心能力）                                
  - 从 requirements.md 里挑最核心的 FR/NFR 列出来（不用全列，选 5–8 条最重要的）                           
                                                                                                           
  ---                                                                                                      
  Section 2 — System Design with UML Models (20分)                                                         
                                                                                                           
  你们有的：                                                                                               
  - Docs/architecture.md 里有 Mermaid 图（系统架构图、ER 图、序列图、CI/CD 流程图）                        
                                                                                                           
  缺的（最大缺口）：                                                                                       
  - Context Model：系统边界图，标出外部 actor（User、Admin、DeepSeek API、Cloudinary、GitHub               
  Actions）——Mermaid 里的系统架构图可以改造成这个                                                          
  - Interaction Model：Use Case 图目前没有，序列图有一个（Post 提交流程），但 Use Case 图需要补            
  - Structural Model：Class diagram / Component diagram 目前没有，ER 图不等于 class                        
  diagram，需要补一个展示类关系的图                                                                        
  - Behavioral Model：State machine 图没有（比如 Post 的状态：submitted → voted → ranked）                 
                                                                                                           
  ▎ 注意：老师明确说不能用手绘或 AI 生成图，必须用正规工具（draw.io、PlantUML、Lucidchart 等）             
                                                                                                           
  ---                                                                                                      
  Section 3 — Progress Tracking (15分)                                                                     
                                                                                                           
  你们有的：
  - GitHub 上有 issues、PR、commits、milestones                                                            
                                                                                                           
  要写的：                                                                                                 
  - "Planned vs Completed" 表格：从 GitHub milestones/issues 里拉数据，对照最初 proposal 的计划            
  - "Feature Status" 表格：每个功能标 Done / In Progress / Blocked                                         
  - "Updated Schedule" 表格：原计划时间线 vs 实际进度                                                      
  - Scope Changes：有没有砍掉或新增功能                                                                    
                                                                                                           
  ---                                                                                                      
  Section 4 — Testing and CI Status (10分)                                                                 
                                                                                                           
  你们有的：                                                                                             
  - Backend/tests/test_api.py 集成测试（注册→登录→发帖→投票→排行榜）                                       
  - Frontend/src/__tests__/tier.test.js 单元测试                                                           
  - .github/workflows/ci.yml CI 流水线                                                                     
                                                                                                           
  缺的：                                                                                                   
  - 测试覆盖率报告：Backend/.coverage 和 Backend/coverage.xml 文件存在，说明跑过                           
  coverage，但报告里需要截图或数字（当前覆盖率是多少%）                                                    
  - CI badge：README 里有没有 CI 状态徽章？如果没有建议加上，报告里可以截图                                
  - 前端测试覆盖率数字                                                                                     
                                                                                                           
  ---                                                                                                      
  Section 5 — Risks, Issues, and Next Steps (10分 + 10分)                                                  
                                                                                                           
  Risks/Issues 要写的（从你们实际遇到的问题里选）：                                                      
  - DeepSeek API 不稳定 → 加了 fallback 机制                                                               
  - SQLite（测试）vs PostgreSQL（生产）差异 → 用 DATABASE_URL 环境变量切换                                 
  - 部署配置（Railway + Vercel）——当前分支 feature/deploy-railway-vercel 说明还在进行中，这是一个          
  in-progress risk                                                                                         
                                                                                                           
  Next Milestones 表格要写的：                                                                             
  - 完成 Railway/Vercel 部署                                                                               
  - 补充 UML 图                                                                                            
  - 提高测试覆盖率（如果还不够）                                                                           
  - 任何剩余功能                                                                                           
                                                                                                           
  ---                                                                                                      
  总结：最需要补的东西                                                                                     
                                                                                                           
  ┌────────┬────────────────────────────────────────────────────────────────────────┬─────────┐          
  │ 优先级 │                                 缺什么                                 │ 工作量  │            
  ├────────┼────────────────────────────────────────────────────────────────────────┼─────────┤            
  │ 🔴 高  │ Use Case 图、Class Diagram、State Machine 图（用 draw.io/PlantUML 画） │ 2–3小时 │            
  ├────────┼────────────────────────────────────────────────────────────────────────┼─────────┤            
  │ 🔴 高  │ Progress 表格（从 GitHub issues/milestones 整理数据）                  │ 1小时   │            
  ├────────┼────────────────────────────────────────────────────────────────────────┼─────────┤            
  │ 🟡 中  │ 测试覆盖率截图/数字                                                    │ 30分钟  │            
  ├────────┼────────────────────────────────────────────────────────────────────────┼─────────┤            
  │ 🟡 中  │ CI badge 截图                                                          │ 15分钟  │          
  ├────────┼────────────────────────────────────────────────────────────────────────┼─────────┤            
  │ 🟢 低  │ 项目摘要文字（直接写，素材都有）                                       │ 30分钟  │          
  └────────┴────────────────────────────────────────────────────────────────────────┴─────────┘            
                                                                                                         
  最花时间的是 UML 图，建议优先搞定。你们 Docs/architecture.md 里的 Mermaid                                
  图可以作为参考，但需要转成正规工具输出的图片格式提交。                                                 
                                                                                                           
✻ Sautéed for 2m 2s                                                                                      
                                                                                          
❯ 有哪些信息或要求是我们没有，需要我们添加的，还是说我们都有，只需要按照我们有的来写就好                   
                                                                                               
⏺ 有几个东西是真的缺的，不是"整理一下就有"：                                                               
                                                                                                           
  真正缺的（需要新建）：                                                                                   
   
  1. Use Case 图 — 你们没有，需要画                                                                        
  2. Class Diagram — ER 图不等于 class diagram，需要补一个展示类/方法关系的图                            
  3. State Machine 图 — 比如 Post 的状态流转，完全没有                                                     
  4. 测试覆盖率数字 — coverage.xml 文件在本地，但需要跑一下 pytest --cov 看实际百分比                      
                                                                                                           
  有但需要转格式的：                                                                                       
                                                                                                           
  - architecture.md 里的 Mermaid 图不能直接用，老师要求用正规工具（draw.io、PlantUML 等）输出的图，不能是  
  AI 生成或手绘                                                                                          
                                                                                                           
  其余都有，整理就行：                                                                                   

  - 项目摘要 → README + requirements.md 里有素材                                                           
  - FR/NFR → Docs/requirements.md 直接用
  - Progress 表格 → 从 GitHub issues/PR/milestones 整理                                                    
  - Feature status → 对照现有功能列表填                                                                    
  - CI 状态 → .github/workflows/ci.yml + 截图                                                              
  - Risks → 从实际遇到的问题写（DeepSeek fallback、部署配置等）                                            
  - Next milestones → 当前 feature/deploy-railway-vercel 分支就是一个                                      
                                                                                                           
  所以核心工作量在 3 张 UML 图 上，其他都是整理和填表。  