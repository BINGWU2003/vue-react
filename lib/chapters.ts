export const chapters = [
  {
    slug: "01-template-jsx",
    title: "模板与 JSX",
    description: "从条件、列表、事件和表单开始，写出同一个界面。",
    group: "基础用法",
  },
  {
    slug: "02-state",
    title: "状态与派生数据",
    description: "建立状态快照、更新队列与派生计算的心智模型。",
    group: "基础用法",
  },
  {
    slug: "03-effects",
    title: "副作用与生命周期",
    description: "理解外部同步、依赖、闭包和资源清理。",
    group: "基础用法",
  },
  {
    slug: "04-components",
    title: "组件设计与通信",
    description: "用清晰的所有权组织值、通知、内容和命令。",
    group: "基础用法",
  },
  {
    slug: "05-hooks",
    title: "Composables 与自定义 Hooks",
    description: "复用逻辑，同时明确每份状态属于谁。",
    group: "基础用法",
  },
  {
    slug: "06-routing",
    title: "路由",
    description: "比较 Vue Router、React Router 与 TanStack Router。",
    group: "日常项目",
  },
  {
    slug: "07-stores",
    title: "状态管理",
    description: "判断状态归属，比较 Pinia 与 Zustand 的订阅。",
    group: "日常项目",
  },
  {
    slug: "08-requests",
    title: "React 请求管理",
    description: "从 fetch、Axios 走向缓存、失效与乐观更新。",
    group: "日常项目",
  },
  {
    slug: "09-styling",
    title: "CSS 与样式组织",
    description: "从样式作用域到动态状态、响应式布局和主题。",
    group: "日常项目",
  },
  {
    slug: "10-library-styles",
    title: "修改组件库样式",
    description: "通过公开接口、局部覆盖和 DOM 位置排查样式。",
    group: "日常项目",
  },
  {
    slug: "11-rendering",
    title: "更新机制、性能与正确性",
    description: "分清函数执行、提交、真实 DOM 变化和优化边界。",
    group: "更新原理",
  },
] as const;
