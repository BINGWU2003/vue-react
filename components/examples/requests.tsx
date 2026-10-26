'use client';

import { useEffect, useRef, useState } from 'react';
import { getProducts, type ProductPage } from '@/lib/example-api';

// #region race
export function RaceDemo() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('success');
  const [safe, setSafe] = useState(true);
  const [status, setStatus] = useState('点击发起请求');
  const [result, setResult] = useState<ProductPage | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const generation = useRef(0);
  const alive = useRef(false);
  const [logs, setLogs] = useState<string[]>([]);
  const log = (text: string) => setLogs((old) => [...old.slice(-9), text]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  async function search(value: string, delay: number) {
    const id = ++sequence.current;
    const run = generation.current;
    if (safe) controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setStatus('loading');
    log(`#${id} 发起「${value || '全部'}」 · ${delay}ms`);
    try {
      const data = await getProducts({ query: value, mode, delay, signal: current.signal });
      if (!alive.current || run !== generation.current) return;
      if (safe && id !== sequence.current) { log(`#${id} 忽略失效结果`); return; }
      setResult(data);
      setStatus(`成功：${value || '全部'}`);
      log(`#${id} 提交结果「${value || '全部'}」`);
    } catch (error) {
      if (!alive.current || run !== generation.current) return;
      if (error instanceof Error && error.name === 'AbortError') { log(`#${id} 已取消`); return; }
      if (safe && id !== sequence.current) return;
      setStatus(error instanceof Error ? error.message : '未知错误');
    }
  }
  return <>
    <div className="demo-actions"><label>关键词 <input value={query} onChange={(e) => setQuery(e.target.value)} /></label><label>场景 <select value={mode} onChange={(e) => setMode(e.target.value)}><option value="success">成功</option><option value="error">失败</option><option value="empty">空结果</option><option value="slow">慢响应</option></select></label></div>
    <div className="demo-actions"><button onClick={() => void search(query, mode === 'slow' ? 2200 : 400)}>搜索</button><label><input type="checkbox" checked={safe} onChange={(e) => { generation.current++; sequence.current++; controller.current?.abort(); setSafe(e.target.checked); }} /> 取消与失效保护</label><button onClick={() => { void search('笔', 1800); void search('背包', 200); }}>重现：先慢「笔」，后快「背包」</button></div>
    <p role="status">{status}</p>
    {result ? <ul>{result.items.map((item) => <li key={item.id}>{item.name} · ¥{item.price}</li>)}{result.total === 0 ? <li>没有匹配的商品</li> : null}</ul> : null}
    <ol className="demo-log" aria-live="polite">{logs.map((line, i) => <li key={i}>{line}</li>)}</ol>
  </>;
}
// #endregion race
