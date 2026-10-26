'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import diagrams from './diagram-index.json';
import Image from 'next/image';

export function Diagram({ id }: { id: keyof typeof diagrams }) {
  const diagram = diagrams[id];
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const transform = useRef<ReactZoomPanPinchRef>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const heading = useId();
  const fit = useCallback(() => {
    const box = viewport.current;
    if (!box) return;
    const next = Math.min((box.clientWidth - 32) / diagram.width, (box.clientHeight - 32) / diagram.height, 2);
    void transform.current?.centerView(next, 0);
  }, [diagram.width, diagram.height]);
  useEffect(() => {
    if (!open || !viewport.current) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const observer = new ResizeObserver(fit);
    observer.observe(viewport.current);
    return () => { observer.disconnect(); document.body.style.overflow = previousOverflow; };
  }, [open, fit]);
  const graphic = <><Image unoptimized className="block h-auto w-full dark:hidden" src={`/diagrams/${id}-light.svg`} alt={diagram.title} width={diagram.width} height={diagram.height} draggable={false} /><Image unoptimized className="hidden h-auto w-full dark:block" src={`/diagrams/${id}-dark.svg`} alt={diagram.title} width={diagram.width} height={diagram.height} draggable={false} /></>;
  return <figure className="not-prose my-7 rounded-xl border bg-fd-card" data-diagram={id}>
    <button ref={trigger} type="button" className="block w-full overflow-x-auto rounded-t-xl text-left focus-visible:outline-2 focus-visible:outline-fd-ring" aria-label={`全屏查看：${diagram.title}`} onClick={() => { setOpen(true); dialog.current?.showModal(); }}>
      <span className="block min-w-[760px]">{graphic}</span>
      <span className="flex items-center justify-between border-t px-4 py-3 text-sm"><strong>{id} · {diagram.title}</strong><span className="text-fd-muted-foreground">全屏查看 ↗</span></span>
    </button>
    <figcaption className="border-t px-4 py-3 text-sm leading-7 text-fd-muted-foreground">{diagram.caption}</figcaption>
    <dialog ref={dialog} className="diagram-dialog fixed inset-0 m-auto h-[100dvh] max-h-none w-screen max-w-none bg-fd-background text-fd-foreground" aria-labelledby={heading} onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}>
      {open ? <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <h2 id={heading} className="font-medium">{diagram.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" aria-label="缩小" onClick={() => void transform.current?.zoomOut()}>−</button><output className="w-12 text-center" aria-live="polite">{Math.round(scale * 100)}%</output><button type="button" aria-label="放大" onClick={() => void transform.current?.zoomIn()}>＋</button>
            <button type="button" onClick={fit}>适应视口</button><button type="button" onClick={() => void transform.current?.centerView(1, 0)}>复位 100%</button><button type="button" onClick={() => dialog.current?.close()}>关闭</button>
          </div>
        </div>
        <div ref={viewport} className="min-h-0 flex-1 overflow-hidden" aria-label="可拖动、缩放的流程图画布">
          <TransformWrapper ref={transform} minScale={0.1} maxScale={4} limitToBounds={false} onInit={fit} onTransform={(_ref, state) => setScale(state.scale)} doubleClick={{ disabled: true }} velocityAnimation={{ disabled: true }}>
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: diagram.width, height: diagram.height }}>
              <div style={{ width: diagram.width, height: diagram.height }}>{graphic}</div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        <p className="shrink-0 border-t px-4 py-3 text-xs text-fd-muted-foreground">拖动画布 · 滚轮或双指缩放 · Escape 退出。{diagram.caption}</p>
      </div> : null}
    </dialog>
  </figure>;
}
