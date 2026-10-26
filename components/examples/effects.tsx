"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// #region subscription
function Subscription({ target, log }: { target: string; log: (text: string) => void }) {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    log(`Effect setup：订阅 ${target}`);
    const timer = setInterval(() => setTicks((n) => n + 1), 1000);
    const handler = () => log(`事件：窗口 resize → ${target}`);
    window.addEventListener("resize", handler);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", handler);
      log(`Effect cleanup：退订 ${target}`);
    };
  }, [target, log]);
  return (
    <p>
      当前订阅：{target} · 已计时 {ticks} 秒
    </p>
  );
}

export function SubscriptionDemo() {
  const [target, setTarget] = useState("商品 A");
  const [mounted, setMounted] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const log = useCallback((text: string) => setLogs((old) => [...old.slice(-11), text]), []);
  useLayoutEffect(() => {
    const node = box.current;
    if (!node) return;
    const measure = () => setWidth(Math.round(node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div className="demo-actions">
        <label>
          订阅目标{" "}
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option>商品 A</option>
            <option>商品 B</option>
          </select>
        </label>
        <button onClick={() => setMounted(!mounted)}>{mounted ? "卸载订阅" : "挂载订阅"}</button>
        <button onClick={() => setLogs([])}>清空日志</button>
      </div>
      {mounted ? <Subscription target={target} log={log} /> : <p>已卸载，定时器和监听已清理。</p>}
      <div ref={box} className="rounded border p-3">
        ResizeObserver 测量：{width}px。调整窗口宽度可观察事件。
      </div>
      <ol className="demo-log" aria-live="polite">
        {logs.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ol>
    </>
  );
}
// #endregion subscription

// #region closure
export function ClosureDemo() {
  const [count, setCount] = useState(0);
  const latest = useRef(count);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [result, setResult] = useState("先安排读取，再在 1.5 秒内加一。");
  useEffect(() => {
    latest.current = count;
  }, [count]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <>
      <p>当前计数：{count}</p>
      <div className="demo-actions">
        <button onClick={() => setCount((n) => n + 1)}>加一</button>
        <button
          onClick={() => {
            setResult("等待 1.5 秒…");
            timers.current.push(
              setTimeout(
                () => setResult(`闭包快照：${count}；最新已提交值：${latest.current}`),
                1500,
              ),
            );
          }}
        >
          安排延迟读取
        </button>
      </div>
      <p role="status">{result}</p>
    </>
  );
}
// #endregion closure
