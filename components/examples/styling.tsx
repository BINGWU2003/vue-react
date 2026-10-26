'use client';

import { useId, useRef, useState, type CSSProperties } from 'react';
import styles from './styling.module.css';
import { createPortal } from 'react-dom';

// #region styling
export function StyleDemo() {
  const [selected, setSelected] = useState(true);
  const [compact, setCompact] = useState(false);
  const [dark, setDark] = useState(false);
  const [method, setMethod] = useState('module');
  const variables = {
    '--example-accent': dark ? '#9bd7bd' : '#568275',
    '--example-background': dark ? '#19372c' : '#f2f8f5',
    '--example-text': dark ? '#e2f2e9' : '#18372a',
  } as CSSProperties;
  const cardClass = method === 'module'
    ? [styles.card, selected ? styles.selected : '', compact ? styles.compact : ''].join(' ')
    : method === 'tailwind'
      ? `rounded-xl border border-[var(--example-accent)] bg-[var(--example-background)] text-[var(--example-text)] ${compact ? 'p-3' : 'p-6'} ${selected ? 'shadow-[inset_4px_0_var(--example-accent)]' : ''}`
      : `example-plain-card ${selected ? 'example-selected' : ''} ${compact ? 'example-compact' : ''}`;
  return <>
    <div className="demo-actions"><label>方案 <select value={method} onChange={(e) => setMethod(e.target.value)}><option value="module">CSS Modules</option><option value="plain">普通 CSS</option><option value="tailwind">Tailwind</option></select></label><label><input type="checkbox" checked={selected} onChange={(e) => setSelected(e.target.checked)} /> 选中</label><label><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> 紧凑</label><button onClick={() => setDark(!dark)}>局部{dark ? '浅色' : '深色'}主题</button></div>
    <article style={variables} className={cardClass}><strong>同一张商品卡片</strong><p className="mt-2">笔记本 · ¥20 · {selected ? '已选中' : '未选中'}</p></article>
    <p>Vue Scoped CSS 的等价视觉实现见代码；React 没有内置的 style scoped 标签。</p>
  </>;
}
// #endregion styling

// #region portal
export function PortalDemo() {
  const [mode, setMode] = useState<'default' | 'local' | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const heading = useId();
  return <div style={{ '--example-accent': '#568275' } as CSSProperties}>
    <p>祖先变量为绿色；第一个弹层不带变量，第二个明确传入变量。</p>
    <div className="demo-actions"><button onClick={(e) => { trigger.current = e.currentTarget; setContainer(document.body); setMode('default'); }}>打开默认主题弹层</button><button onClick={(e) => { trigger.current = e.currentTarget; setContainer(document.body); setMode('local'); }}>打开指定主题弹层</button></div>
    {mode && container ? createPortal(<dialog ref={(node) => { if (node && !node.open) node.showModal(); }} onClose={() => { setMode(null); trigger.current?.focus(); }} className={`demo ${styles.portalSurface}`} style={mode === 'local' ? { '--example-accent': '#568275' } as CSSProperties : undefined} aria-labelledby={heading}>
      <h3 id={heading}>Portal 到 document.body</h3><p>{mode === 'local' ? '显式传入绿色变量，覆盖范围只在此弹层。' : '不再继承演示容器的绿色，使用 CSS 中的橙色回退值。'}</p><form method="dialog"><button>关闭</button></form>
    </dialog>, container) : null}
    <p>这是实际 React Portal 配合原生 dialog 的演示。组件库对应写法见正文；顶层显示本身不会改变 DOM 继承关系，Portal 改变了真实挂载位置。</p>
  </div>;
}
// #endregion portal
