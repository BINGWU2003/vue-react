"use client";

import dynamic from "next/dynamic";
import { Component, Suspense, useState, type ReactNode } from "react";

const demos = {
  E01: dynamic(() => import("../examples/basics").then((m) => m.TodoDemo), { ssr: false }),
  E02: dynamic(() => import("../examples/basics").then((m) => m.SnapshotDemo), { ssr: false }),
  E03: dynamic(() => import("../examples/basics").then((m) => m.CartDemo), { ssr: false }),
  E04: dynamic(() => import("../examples/basics").then((m) => m.ReferenceDemo), { ssr: false }),
  E05: dynamic(() => import("../examples/effects").then((m) => m.SubscriptionDemo), { ssr: false }),
  E06: dynamic(() => import("../examples/effects").then((m) => m.ClosureDemo), { ssr: false }),
  E07: dynamic(() => import("../examples/communication").then((m) => m.CommunicationDemo), {
    ssr: false,
  }),
  E08: dynamic(() => import("../examples/communication").then((m) => m.ReuseDemo), { ssr: false }),
  E10: dynamic(() => import("../examples/store").then((m) => m.StoreDemo), { ssr: false }),
  E11: dynamic(() => import("../examples/requests").then((m) => m.RaceDemo), { ssr: false }),
  E12: dynamic(() => import("../examples/query").then((m) => m.CacheDemo), { ssr: false }),
  E13: dynamic(() => import("../examples/query").then((m) => m.OptimisticDemo), { ssr: false }),
  E14: dynamic(() => import("../examples/styling").then((m) => m.StyleDemo), { ssr: false }),
  E15: dynamic(() => import("../examples/styling").then((m) => m.PortalDemo), { ssr: false }),
  E16: dynamic(() => import("../examples/rendering").then((m) => m.RenderDemo), { ssr: false }),
  E17: dynamic(() => import("../examples/rendering").then((m) => m.IdentityDemo), { ssr: false }),
  E18: dynamic(() => import("../examples/rendering").then((m) => m.MemoDemo), { ssr: false }),
};

class DemoBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <p role="alert">示例出现错误，请点“重置演示”重新开始。</p>
    ) : (
      this.props.children
    );
  }
}

export function Demo({
  id,
  title,
  children,
}: {
  id: keyof typeof demos;
  title: string;
  children?: ReactNode;
}) {
  const [revision, setRevision] = useState(0);
  const Preview = demos[id];
  return (
    <section
      className="demo not-prose my-6 overflow-hidden rounded-xl border"
      aria-label={`${id} ${title}`}
      data-demo={id}
    >
      <header className="flex items-center justify-between gap-3 border-b bg-fd-muted/40 px-4 py-3">
        <span className="text-sm font-medium">
          <span className="mr-2 font-mono text-xs text-fd-muted-foreground">{id}</span>
          {title}
        </span>
        <button
          type="button"
          className="text-xs text-fd-muted-foreground hover:text-fd-foreground"
          onClick={() => setRevision((v) => v + 1)}
        >
          重置演示
        </button>
      </header>
      <div className="demo-stage space-y-4 p-4 sm:p-6">
        <DemoBoundary key={revision}>
          <Suspense fallback={<p role="status">正在加载演示…</p>}>
            <Preview />
          </Suspense>
        </DemoBoundary>
      </div>
      {children ? (
        <div className="border-t bg-fd-muted/20 px-4 py-3 text-sm leading-7 text-fd-muted-foreground">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function CodeOnly({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose my-5 rounded-lg border border-dashed bg-fd-muted/30 p-4 text-sm leading-7">
      <strong className="block">代码示例 · 独立运行</strong>
      {children}
    </aside>
  );
}
