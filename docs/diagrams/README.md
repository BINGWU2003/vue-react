# 流程图源文件

F01—F11 是框架概念流程图，非本站架构映射。JSON 由 scripts/prepare-diagrams.mjs 生成，使用 archify workflow v2 编译并验证。已渲染 SVG 位于 public/diagrams；网页提供独立的可访问全屏查看器。

自动验证记录位于 .archify/workflow-vue-react-20261026-085139。复现命令：

```powershell
node scripts/prepare-diagrams.mjs
node C:/Users/LX/.agents/skills/archify/bin/archify.mjs finalize workflow docs/diagrams/F01.json .archify/workflow-vue-react-20261026-085139/F01.html --quality showcase --json
```

生成后运行 scripts/extract-diagrams.mjs 提取静态 SVG，供正文预览使用。
