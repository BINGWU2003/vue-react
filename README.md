# Vue 与 React · 对照笔记

面向有 Vue 基础、正在学习 React 的开发者，按同一个需求整理两端写法、运行机制和常见误区。

需求来源见 [Vue 与 React 对照文档规划](docs/vue-react-comparison-plan.md)。现已提供 11 章正文、17 个可操作的 React 预览、E09 三套路由独立运行代码，以及 11 张可全屏查看的流程图。Vue 和部分第三方库展示代码；不包含在线编辑器。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 查看首页，访问 http://localhost:3000/docs 阅读文档。

## 内容入口

- `content/docs`：阅读指南和 01—11 章 MDX，meta.json 定义侧栏顺序。
- `components/examples`：React 演示源码。正文通过 Fumadocs remarkInclude 引用真实源码或 region。
- `content/examples/routing`：可复制到独立项目的三套路由代码（文本扩展名用于避免参与本站类型检查）。
- `components/learning`：演示错误边界、重置容器和流程图查看器。
- `public/diagrams`：明暗主题 SVG；`docs/diagrams` 保存概念图源文件和验证摘要。
- `lib/example-api.ts`、`app/api/examples/products`：受控商品数据与同源模拟接口。

正文代码使用标签切换。演示可独立重置，QueryClient 与购物车 store 按实例隔离。请求示例可切换成功、失败、空结果与慢响应；收藏是独立内存模拟服务，不访问私人接口。Zustand 偏好键为 `vue-react-demo-preference-v1`，演示提供清除入口。

图形预览点击后进入全屏，支持拖动、滚轮/双指缩放、适应视口、复位和 Escape；关闭后恢复触发元素焦点。SVG 直接随页面提供，不需要客户端 Mermaid 渲染。

## 项目校验

```bash
pnpm lint
pnpm types:check
pnpm build
pnpm test:e2e
```

浏览器测试在 build 后运行，会临时启动端口 3100 并在结束后关闭。Windows 默认使用已安装的 Chrome；其他环境先运行 `pnpm exec playwright install chromium`。可用 TEST_BASE_URL 指定已有服务，用 PLAYWRIGHT_CHANNEL 指定浏览器通道。截图保存在被 Git 忽略的 test-results 目录。

测试覆盖章节、搜索/Markdown 输出、受控输入、状态队列、资源清理、selector、请求竞态、缓存共享与失效、乐观回滚、Portal、key、流程图查看器与移动端溢出。

项目基于 Next.js 16、React 19、Fumadocs 和 Tailwind CSS 4，保留原有搜索、主题切换及 AI 对话入口。阅读和所有演示均无需 AI 配置；AI 对话仍使用已有 OPENROUTER_API_KEY 配置，不属于本次内容实现。
