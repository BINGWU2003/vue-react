import Link from 'next/link';
import { chapters } from '@/lib/chapters';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="mb-6 inline-flex rounded-full border bg-fd-muted px-3 py-1 text-xs text-fd-muted-foreground">
          Vue 3 → React 19 · TypeScript
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
          Vue 与 React
          <span className="mt-2 block text-fd-muted-foreground">同一个需求，两种思考方式。</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-fd-muted-foreground">
          为有 Vue 基础的开发者准备的 React 学习笔记。对照代码、亲手操作示例，
          再沿着流程图理解状态、依赖与更新，建立属于 React 的心智模型。
        </p>
        <Link
          href="/docs"
          className="mt-8 inline-flex items-center rounded-lg bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
        >
          开始阅读 <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>

      <section aria-label="文档目录" className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((section, index) => (
          <Link
            key={section.slug}
            href={`/docs/${section.slug}`}
            className="rounded-xl border bg-fd-card p-6 transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
          >
            <p className="mb-3 font-mono text-xs text-fd-muted-foreground">{String(index + 1).padStart(2, '0')} / {section.group}</p>
            <h2 className="font-medium">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
      <p className="mt-8 text-sm leading-6 text-fd-muted-foreground">
        11 章对照正文 · 可重置的 React 演示 · 可缩放流程图。Vue 展示代码；部分第三方库示例提供独立运行说明。
      </p>
    </main>
  );
}
