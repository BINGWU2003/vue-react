"use client";

import {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";

// #region communication
type SearchHandle = { focus: () => void };
function SearchInput({
  value,
  onChange,
  ref,
}: {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<SearchHandle>;
}) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }), []);
  return (
    <label>
      商品搜索 <input ref={input} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function ContentList({
  items,
  renderItem,
}: {
  items: string[];
  renderItem: (item: string) => ReactNode;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
const ThemeContext = createContext("浅色");
function ThemeBadge() {
  return <p>跨层消费者：{useContext(ThemeContext)}主题</p>;
}

export function CommunicationDemo() {
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("浅色");
  const input = useRef<SearchHandle>(null);
  return (
    <ThemeContext value={theme}>
      <div className="demo-actions">
        <SearchInput ref={input} value={search} onChange={setSearch} />
        <button onClick={() => input.current?.focus()}>父组件聚焦</button>
        <button onClick={() => setTheme(theme === "浅色" ? "深色" : "浅色")}>切换局部主题</button>
      </div>
      <p>父组件持有的值：{search || "（空）"}</p>
      <ContentList
        items={["笔记本", "钢笔", "背包"].filter((item) => item.includes(search))}
        renderItem={(item) => <strong>→ {item}</strong>}
      />
      <section>
        <ThemeBadge />
      </section>
    </ThemeContext>
  );
}
// #endregion communication

// #region reuse
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((n) => n + 1) };
}
function IndependentCounter({ name }: { name: string }) {
  const { count, increment } = useCounter();
  return (
    <button onClick={increment}>
      {name}：{count}
    </button>
  );
}
function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}
export function ReuseDemo() {
  const shared = useCounter();
  const width = useWindowWidth();
  return (
    <>
      <p>两次调用 useCounter：各自拥有状态。</p>
      <div className="demo-actions">
        <IndependentCounter name="独立 A" />
        <IndependentCounter name="独立 B" />
      </div>
      <p>父组件调用一次，再把同一份值与操作传下去：</p>
      <div className="demo-actions">
        <button onClick={shared.increment}>共享 A：{shared.count}</button>
        <button onClick={shared.increment}>共享 B：{shared.count}</button>
      </div>
      <p>可清理的窗口订阅：{width ?? "正在测量"}px</p>
    </>
  );
}
// #endregion reuse
