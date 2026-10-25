import Link from 'next/link';

const sections = [
  {
    title: '文档说明',
    description: '记录这份文档的出发点，以及还在构思中的内容。',
    href: '/docs',
  },
  {
    title: '主题草稿',
    description: '先为想讨论的问题留个位置，章节和顺序都可以慢慢调整。',
    href: '/docs/topics',
  },
  {
    title: '灵感记录',
    description: '收集零散想法、阅读线索和待确认的问题。',
    href: '/docs/notes',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="mb-6 inline-flex rounded-full border bg-fd-muted px-3 py-1 text-xs text-fd-muted-foreground">
          构思中 · 内容待定
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
          Vue 与 React
          <span className="mt-2 block text-fd-muted-foreground">从一个问题开始，慢慢整理。</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-fd-muted-foreground">
          这里将是一份关于 Vue 与 React 的对比文档。
          现在先留下一些空白，收集想法、梳理问题，等方向清晰后再逐步补充。
        </p>
        <Link
          href="/docs"
          className="mt-8 inline-flex items-center rounded-lg bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
        >
          翻开文档 <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </div>

      <section aria-label="文档目录" className="mt-16 grid gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border bg-fd-card p-6 transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-ring"
          >
            <h2 className="font-medium">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-fd-muted-foreground">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
      <p className="mt-8 text-sm leading-6 text-fd-muted-foreground">
        当前页面均为占位内容，具体主题、示例与结论将在后续整理。
      </p>
    </main>
  );
}
