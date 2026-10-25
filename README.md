# Vue 与 React · 对照笔记

一份仍在构思中的 Vue 与 React 对比文档。当前仅放置中文占位内容，具体主题、对比代码和结论待后续确定。

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
