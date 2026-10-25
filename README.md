# Vue 与 React · 对照笔记

面向有 Vue 基础、正在学习 React 的开发者，按同一个需求整理两端写法、运行机制和常见误区。

已确定的章节范围、比较要点、后续示例与交互流程图要求，见 [Vue 与 React 对照文档规划](docs/vue-react-comparison-plan.md)。当前先整理 Markdown 规划，站点正文与运行示例仍待逐章完善。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 查看首页，访问 http://localhost:3000/docs 阅读文档。

## 内容入口

- `content/docs/index.mdx`：文档说明。
- `content/docs/topics.mdx`：主题草稿。
- `content/docs/notes.mdx`：灵感记录。
- `content/docs/meta.json`：侧栏名称与页面顺序。
- `app/(home)/page.tsx`：首页占位内容。
- `lib/shared.ts`：站点名称与公共路径。
- `lib/translations.ts`：中文界面提示。

新增文档时，在 `content/docs` 中创建 MDX 文件，并将文件名加入 `meta.json` 的 `pages` 列表。现有章节均可随时调整。

## 项目校验

```bash
pnpm lint
pnpm types:check
pnpm build
```

项目基于 Next.js 与 Fumadocs，沿用初始化时的搜索、主题切换及 AI 对话能力。
