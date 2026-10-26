# 实现与验收记录

验收日期：2026-10-26。需求来源为 `vue-react-comparison-plan.md`；按补充约定，部分第三方库展示可复制代码与独立运行说明。

## 交付内容

- 11 章中文 MDX 正文与阅读指南；首页、侧栏和概念速查同步更新。
- Vue / React 代码标签切换；React 代码尽量引用实际源码 region，进入搜索与 Markdown 输出。
- 17 个 React 交互预览（E01—E08、E10—E18），支持错误隔离和重置。E09 为三套路由独立入口代码。
- 请求使用受控本地数据，支持成功、HTTP 失败、空结果、慢响应、取消与竞态。Query 缓存、Zustand selector 和乐观回滚使用真实库。
- Element Plus / Ant Design 提供样式代码；E15 用实际 React Portal 与原生 dialog 验证挂载位置和 CSS 变量继承。
- F01—F11 为已渲染 SVG，提供明暗主题、全屏、拖动、缩放、适应视口、100% 复位、Escape、焦点和滚动恢复。

## 自动检查

| 检查                | 结果                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| pnpm lint           | 退出码 0；保留原项目 4 条警告，新增代码无 lint 警告                                                     |
| pnpm types:check    | 通过                                                                                                    |
| pnpm build          | 通过，生成 44 个静态页面/内容端点                                                                       |
| pnpm test:e2e       | 12/12 通过，无页面运行时错误                                                                            |
| git diff --check    | 通过                                                                                                    |
| 独立代码 TypeScript | Vue Router、React Router、TanStack Router 入口，以及 Ant Design 组件与 CSS Modules 声明通过严格类型检查 |
| Vue 编译器语法检查  | 26 段 SFC / 组件使用片段通过；单独的模板使用片段在 template 容器中检查                                  |

独立 TypeScript 检查在临时目录中安装 Vue 3.5.44、Vue Router 4.6.4、React Router 7.18.1、TanStack Router 1.170.46、Ant Design 6.6.7、React 19.3.1、TypeScript 7.0.2，不为本站增加这些展示用运行时。此项不等于三方应用全部完成浏览器端到端验证；运行与观察步骤见路由章。

现存构建提醒为 Fumadocs 搜索 highlight 伪元素优化提示及未配置公开站点 metadataBase；本地构建与交互不受阻。原有 AI 对话需要其既有 OpenRouter 配置，本次未调用或验证外部模型。

## 浏览器验证

使用本机 Chrome，验证全部章节、搜索、Markdown 展开、旧草稿 URL 重定向，以及状态队列、派生总价、ref、订阅清理、闭包、聚焦、共享状态、selector、偏好持久化、竞态反例和修正、缓存去重与失效、乐观保存/回滚、Portal、列表 key 与计算结果。

查看器额外验证图形完整适配、拖动和比例变化、关闭后焦点/滚动恢复。移动视口 390×844 的实际深色主题没有页面横向溢出。人工查看了首页、桌面流程图全屏、移动深色阅读和 F07 深色决策图截图；截图位于被忽略的 `test-results`，不参与构建。

## 流程图证据

图形类型为 workflow，使用 Archify showcase 自动校验。11 份原始独立 HTML 均通过 validate、deliver、check、browser-check，零诊断；路径、规格和产物 SHA-256、浏览器状态见 [validation.json](diagrams/validation.json)。原始 HTML 保存在该报告列出的本地绝对路径，生成目录被 Git 忽略。

嵌入 SVG 版调整了主题、字号和图例，其 SHA-256 另行记录；本站查看器由上述浏览器测试验证。原始独立 HTML 的可选人工视觉评审未执行，不将嵌入版截图复查混同于原始产物的视觉验收。

## 本地复现

```powershell
pnpm install
pnpm lint
pnpm types:check
pnpm build
pnpm test:e2e
pnpm dev
```

测试会启动并关闭端口 3100 的临时服务；已有服务时显式设置 TEST_BASE_URL，避免误测旧构建。Windows 默认使用 Chrome；其他环境可先 `pnpm exec playwright install chromium`。开发阅读入口为 http://localhost:3000/docs。
