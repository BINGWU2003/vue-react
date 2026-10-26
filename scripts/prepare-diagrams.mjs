import { mkdir, writeFile } from "node:fs/promises";

// These are conceptual framework diagrams, not a map of this repository's runtime.
export const directory = ".archify/workflow-vue-react-20261026-085139";
const row = (id, label, steps) => ({ id, label, steps });
const specifications = [
  [
    "F01",
    "两端状态更新总览",
    [
      row("vue", "Vue", [
        ["修改响应值", "ref 或 Proxy"],
        ["触发依赖", "相关 effect"],
        ["安排更新", "队列与批处理"],
        ["执行渲染", "render effect"],
        ["提交更新", "patch DOM"],
      ]),
      row("react", "React", [
        ["调用 setter", "提交更新意图"],
        ["进入更新队列", "状态快照不变"],
        ["调度渲染", "批处理与优先级"],
        ["调用组件", "协调界面描述"],
        ["提交更新", "必要的 DOM 变更"],
      ]),
    ],
    "两行分别描述 Vue 与 React。箭头表示阶段先后；执行渲染不等于必然修改 DOM，Effect 在提交后另行同步。",
  ],
  [
    "F02",
    "派生数据与缓存",
    [
      row("computed", "Vue computed", [
        ["源状态变化", "触发相关依赖"],
        ["缓存失效", "标记需要重算"],
        ["读取派生值", "按需计算"],
        ["获得结果", "依赖不变则复用"],
      ]),
      row("memo", "React", [
        ["状态更新", "请求新渲染"],
        ["渲染时计算", "默认直接推导"],
        ["按需 useMemo", "显式比较依赖"],
        ["获得结果", "正确性独立于缓存"],
      ]),
    ],
    "派生值从源状态流向界面，不再复制一份总价状态。两条路径的缓存目的和依赖来源不同。",
  ],
  [
    "F03",
    "副作用建立与清理",
    [
      row("cycle", "正常同步周期", [
        ["完成提交", "观察已提交界面"],
        ["建立同步", "Effect setup"],
        ["依赖变化", "比较声明的依赖"],
        ["清理旧同步", "旧 cleanup"],
        ["重新建立", "新 setup"],
      ]),
      row("end", "资源边界", [
        ["开发检查", "额外 setup/cleanup"],
        ["验证对称", "资源可安全重建"],
        ["组件卸载", "离开当前界面"],
        ["最终清理", "移除监听和定时器"],
      ]),
    ],
    "上行表示提交后的同步周期；下行区分开发 Strict Mode 检查与最终卸载。依赖变化也会执行清理。",
  ],
  [
    "F04",
    "组件通信与所有权",
    [
      row("down", "值与内容向下", [
        ["父级所有者", "持有唯一状态"],
        ["props 传值", "只读输入约定"],
        ["子组件显示", "组合 children"],
        ["必要命令", "ref 聚焦或滚动"],
      ]),
      row("up", "通知与跨层", [
        ["用户输入", "子组件捕获事件"],
        ["通知父级", "emit 或回调"],
        ["父级更新", "维护数据约束"],
        ["跨层传值", "inject 或 Context"],
      ]),
    ],
    "下行的输入通知应回到状态所有者，再由新的 props 流向子组件。命令式 ref 用于聚焦等有限能力。",
  ],
  [
    "F05",
    "逻辑复用与状态共享",
    [
      row("a", "独立实例 A", [
        ["组件 A 调用", "复用同一逻辑"],
        ["创建状态 A", "组件内的状态"],
        ["操作 A", "只更新 A"],
      ]),
      row("b", "独立实例 B", [
        ["组件 B 调用", "复用同一逻辑"],
        ["创建状态 B", "组件内的状态"],
        ["操作 B", "只更新 B"],
      ]),
      row("shared", "显式共享", [
        ["公共容器", "父级或外部 store"],
        ["订阅同一状态", "共同的数据来源"],
        ["操作容器", "所有消费者同步"],
      ]),
    ],
    "相同逻辑函数不连接 A、B 的状态。只有明确移入公共容器的状态才会在消费者之间共享。",
  ],
  [
    "F06",
    "导航与数据加载",
    [
      row("navigation", "导航主线", [
        ["发起导航", "链接或历史记录"],
        ["匹配与检查", "参数和前置条件"],
        ["加载数据", "loader 或页面获取"],
        ["完成导航", "呈现匹配页面"],
      ]),
      row("states", "加载分支", [
        ["展示等待", "导航进行中"],
        ["错误或重定向", "检查或加载失败"],
        ["复用 Query", "预取和共享缓存"],
        ["服务端鉴权", "客户端不能替代"],
      ]),
    ],
    "加载阶段可能等待、失败或重定向。loader 决定何时需要数据，Query 负责缓存与同步；服务端独立校验权限。",
  ],
  [
    "F07",
    "状态放置决策",
    [
      row("question", "依次判断", [
        ["服务端数据？", "异步事实来源"],
        ["应进入 URL？", "可分享和后退"],
        ["仅组件使用？", "局部交互"],
        ["少量组件共享？", "存在公共父级"],
        ["广泛客户端状态", "跨页面业务状态"],
      ]),
      row("owner", "对应归属", [
        ["Query", "缓存和同步"],
        ["路由 URL", "参数和搜索条件"],
        ["组件状态", "useState 或 ref"],
        ["提升或上下文", "父级或 Context"],
        ["客户端 store", "Zustand 或 Pinia"],
      ]),
    ],
    "上行按顺序判断，满足条件时落到下方对应容器。状态归属取决于来源与生命周期，不由库的流行程度决定。",
  ],
  [
    "F08",
    "搜索请求竞态",
    [
      row("old", "旧请求 A", [
        ["发起慢请求", "关键词：笔"],
        ["请求等待", "耗时 1800ms"],
        ["晚到的响应", "已经失效"],
        ["禁止提交", "取消或版本校验"],
      ]),
      row("new", "新请求 B", [
        ["随后发起", "关键词：背包"],
        ["快速返回", "耗时 200ms"],
        ["提交新结果", "属于当前条件"],
        ["保留新结果", "旧响应不能覆盖"],
      ]),
    ],
    "从左向右表示各自请求的过程。A 更早发起但更晚返回，AbortSignal 与有效性校验共同保护当前结果。",
  ],
  [
    "F09",
    "Query 缓存与修改同步",
    [
      row("read", "查询路径", [
        ["参数进入 key", "识别缓存位置"],
        ["检查缓存", "复用可用数据"],
        ["按需重新获取", "过期或明确失效"],
        ["更新消费者", "共享同一个缓存"],
      ]),
      row("write", "乐观修改", [
        ["取消旧获取", "保存缓存快照"],
        ["临时更新", "立即反馈"],
        ["提交 mutation", "等待模拟服务"],
        ["成功或回滚", "失效后重新同步"],
      ]),
    ],
    "staleTime 描述新鲜度，gcTime 描述无观察者时的保留时间。修改失败时恢复快照，结束后使相关查询失效。",
  ],
  [
    "F10",
    "组件库样式排查",
    [
      row("inspect", "从公开入口排查", [
        ["确认目标", "全局或单实例"],
        ["公开接口", "主题 token 和 class"],
        ["选择器匹配", "scoped 与 Modules"],
        ["检查层叠", "权重和导入顺序"],
        ["实际 DOM", "Portal 和 Teleport"],
      ]),
      row("resolve", "对应处理", [
        ["限定影响范围", "避免大范围覆盖"],
        ["优先使用配置", "稳定的主题能力"],
        ["限定全局例外", "deep 不搬动 DOM"],
        ["查看最终规则", "再解释 important"],
        ["主题传播", "上下文不同于继承"],
      ]),
    ],
    "每一步先检查，再修改。deep 只影响选择器编译；弹层换了真实父节点后，必须重新检查匹配和 CSS 变量继承。",
  ],
  [
    "F11",
    "组件身份与更新边界",
    [
      row("identity", "身份判断", [
        ["类型位置与 key", "同级协调的身份"],
        ["身份相同", "保留组件状态"],
        ["身份改变", "清理并创建实例"],
        ["新状态来源", "重新运行初始化"],
      ]),
      row("update", "一次更新", [
        ["请求渲染", "状态或上层变化"],
        ["执行与协调", "可能被中断或重试"],
        ["提交结果", "必要的 DOM 修改"],
        ["同步外部系统", "Effect setup/cleanup"],
      ]),
    ],
    "身份决定状态是否保留。函数执行、提交、DOM mutation 和 Effect 是不同观察点，不能只用 console 次数衡量性能。",
  ],
];
await mkdir(directory, { recursive: true });
await mkdir("docs/diagrams", { recursive: true });
for (const [id, title, rows, caption] of specifications) {
  const nodes = rows.flatMap((lane) =>
    lane.steps.map(([label, sublabel], col) => ({
      id: `${lane.id}-${col}`,
      lane: lane.id,
      col,
      type: lane.id === "vue" ? "frontend" : "backend",
      label,
      sublabel,
      width: 172,
      height: 66,
      icon: "none",
    })),
  );
  const edges = rows.flatMap((lane) =>
    lane.steps.slice(1).map((_, index) => ({
      id: `${lane.id}-edge-${index}`,
      from: `${lane.id}-${index}`,
      to: `${lane.id}-${index + 1}`,
    })),
  );
  if (id === "F07") {
    for (let i = edges.length - 1; i >= 0; i--) {
      if (edges[i].from.startsWith("owner-")) edges.splice(i, 1);
      else edges[i].label = "否";
    }
    for (let i = 0; i < 5; i++)
      edges.push({
        id: `decision-${i}`,
        from: `question-${i}`,
        to: `owner-${i}`,
        label: i === 4 ? "归入" : "是",
        variant: "emphasis",
      });
  }
  const candidate = {
    schema_version: 2,
    diagram_type: "workflow",
    meta: {
      title,
      locale: "zh-CN",
      quality_profile: "showcase",
      output: `${directory}/${id}.html`,
    },
    lanes: rows.map(({ id, label }) => ({ id, label })),
    nodes,
    edges,
    cards: [{ dot: "emerald", title: "阅读提示", items: [caption] }],
  };
  await writeFile(`docs/diagrams/${id}.json`, `${JSON.stringify(candidate, null, 2)}\n`);
}
await writeFile(
  "docs/diagrams/README.md",
  `# 流程图源文件\n\nF01—F11 是框架概念流程图，非本站架构映射。JSON 由 scripts/prepare-diagrams.mjs 生成，使用 archify workflow v2 编译并验证。已渲染 SVG 位于 public/diagrams；网页提供独立的可访问全屏查看器。\n\n自动验证记录位于 ${directory}。复现命令：\n\n\`\`\`powershell\nnode scripts/prepare-diagrams.mjs\nnode C:/Users/LX/.agents/skills/archify/bin/archify.mjs finalize workflow docs/diagrams/F01.json ${directory}/F01.html --quality showcase --json\n\`\`\`\n\n生成后运行 scripts/extract-diagrams.mjs 提取静态 SVG，供正文预览使用。\n`,
);
