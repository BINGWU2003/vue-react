"use client";

import { memo, Profiler, useEffect, useMemo, useRef, useState } from "react";

// #region rendering
const Child = memo(function Child({ name }: { name: string }) {
  console.log("[E16 render] memo Child");
  useEffect(() => {
    console.log("[E16 Effect setup] Child");
    return () => console.log("[E16 Effect cleanup] Child");
  }, []);
  return <p>memo 子组件：{name}</p>;
});
export function RenderDemo() {
  console.log("[E16 render] Parent");
  const [count, setCount] = useState(0);
  const [unused, setUnused] = useState(0);
  const target = useRef<HTMLDivElement>(null);
  const mutations = useRef<HTMLOutputElement>(null);
  const commits = useRef<HTMLOutputElement>(null);
  const commitCount = useRef(0);
  useEffect(() => {
    console.log("[E16 commit 后观察] Parent");
  });
  useEffect(() => {
    if (!target.current) return;
    let total = 0;
    const observer = new MutationObserver((records) => {
      total += records.length;
      if (mutations.current) mutations.current.textContent = String(total);
    });
    observer.observe(target.current, {
      subtree: true,
      characterData: true,
      childList: true,
      attributes: true,
    });
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => setCount(count + 1)}>修改显示字段</button>
        <button onClick={() => setUnused(unused + 1)}>修改未显示字段</button>
        <button onClick={() => setCount(count)}>重复设置相同值</button>
      </div>
      <Profiler
        id="observed-tree"
        onRender={() => {
          commitCount.current++;
          if (commits.current) commits.current.textContent = String(commitCount.current);
        }}
      >
        <div ref={target}>
          <p>计数：{count}</p>
          <Child name="稳定的字符串 prop" />
        </div>
      </Profiler>
      <p>
        Profiler 提交回调：<output ref={commits}>0</output> · 被观察区域的 DOM mutation 记录：
        <output ref={mutations}>0</output>
      </p>
      <p>
        开发环境可观察提交；标准生产构建默认禁用 Profiler 计时。两个指标都不等于组件函数执行次数。
      </p>
    </>
  );
}
// #endregion rendering

// #region identity
function Row({ name }: { name: string }) {
  const [value, setValue] = useState(name);
  return (
    <label className="block">
      {name} 的草稿 <input value={value} onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}
export function IdentityDemo() {
  const [items, setItems] = useState([
    { id: 1, name: "笔记本" },
    { id: 2, name: "钢笔" },
  ]);
  const [indexKey, setIndexKey] = useState(false);
  const [revision, setRevision] = useState(0);
  return (
    <>
      <div className="demo-actions">
        <button onClick={() => setItems([...items].reverse())}>反转列表</button>
        <label>
          <input
            type="checkbox"
            checked={indexKey}
            onChange={(e) => {
              setIndexKey(e.target.checked);
              setRevision(revision + 1);
            }}
          />{" "}
          使用索引 key（反例）
        </label>
        <button onClick={() => setRevision(revision + 1)}>改变容器 key，重建表单</button>
      </div>
      <div key={revision}>
        {items.map((item, index) => (
          <Row key={indexKey ? index : item.id} name={item.name} />
        ))}
      </div>
      <p>先编辑第一行，再反转。稳定 id 让草稿跟着商品；索引让草稿留在位置上。</p>
    </>
  );
}
// #endregion identity

// #region memo
const dataset = Array.from({ length: 12_000 }, (_, i) => `商品 ${i + 1}`);
function expensiveFilter(query: string) {
  const start = performance.now();
  const result = dataset.filter((name) => name.includes(query));
  let checksum = 0;
  for (let i = 0; i < 400_000; i++) checksum += Math.sqrt(i);
  return { count: result.length, duration: performance.now() - start, checksum };
}
function PlainCalculation({ query }: { query: string }) {
  const result = expensiveFilter(query);
  return (
    <p>
      直接计算：{result.count} 条 · 本次计算 {result.duration.toFixed(2)}ms
    </p>
  );
}
function MemoCalculation({ query }: { query: string }) {
  const result = useMemo(() => expensiveFilter(query), [query]);
  return (
    <p>
      useMemo：{result.count} 条 · 最近计算 {result.duration.toFixed(2)}ms（无关更新时保留此值）
    </p>
  );
}
export function MemoDemo() {
  const [query, setQuery] = useState("1");
  const [count, setCount] = useState(0);
  return (
    <>
      <div className="demo-actions">
        <label>
          筛选 <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button onClick={() => setCount(count + 1)}>无关状态：{count}</button>
      </div>
      <PlainCalculation query={query} />
      <MemoCalculation query={query} />
      <p>本例加入有上限的计算负载。计时受设备、JIT 和开发检查影响，不能作为框架性能排名。</p>
    </>
  );
}
// #endregion memo
