"use client";

import { useEffect, useRef, useState } from "react";

// #region todo
type Todo = { id: number; text: string; done: boolean };
function Draft() {
  const [value, setValue] = useState("我会保留吗？");
  return (
    <label>
      组件内部草稿 <input value={value} onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

export function TodoDemo() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "理解 JSX", done: false },
    { id: 2, text: "建立状态快照模型", done: true },
  ]);
  const nextId = useRef(3);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [visible, setVisible] = useState(true);
  const [unmount, setUnmount] = useState(false);
  const shown = todos.filter((todo) => filter === "all" || todo.done === (filter === "done"));
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setTodos([...todos, { id: nextId.current++, text: text.trim(), done: false }]);
          setText("");
        }}
      >
        <label>
          待办内容{" "}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="新增一条待办"
          />
        </label>
        <button>新增</button>
      </form>
      <div className="demo-actions">
        <label>
          筛选{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">全部</option>
            <option value="done">已完成</option>
            <option value="active">未完成</option>
          </select>
        </label>
        <button onClick={() => setTodos([...todos].reverse())}>反转顺序</button>
      </div>
      <ul>
        {shown.map((todo) => (
          <li key={todo.id} className="demo-actions py-1">
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  setTodos(
                    todos.map((item) =>
                      item.id === todo.id ? { ...item, done: !item.done } : item,
                    ),
                  )
                }
              />{" "}
              <span style={{ textDecoration: todo.done ? "line-through" : undefined }}>
                {todo.text}
              </span>
            </label>
            <button onClick={() => setTodos(todos.filter((item) => item.id !== todo.id))}>
              删除 {todo.text}
            </button>
          </li>
        ))}
      </ul>
      <div className="demo-actions">
        <button onClick={() => setVisible(!visible)}>{visible ? "隐藏" : "显示"}草稿</button>
        <label>
          <input type="checkbox" checked={unmount} onChange={(e) => setUnmount(e.target.checked)} />{" "}
          隐藏时卸载
        </label>
      </div>
      {unmount ? (
        visible ? (
          <Draft key="conditional" />
        ) : null
      ) : (
        <div style={{ display: visible ? undefined : "none" }}>
          <Draft key="css" />
        </div>
      )}
    </>
  );
}
// #endregion todo

// #region snapshot
export function SnapshotDemo() {
  const [count, setCount] = useState(0);
  const [snapshot, setSnapshot] = useState("尚未操作");
  return (
    <>
      <p className="demo-number" aria-live="polite">
        {count}
      </p>
      <div className="demo-actions">
        <button
          onClick={() => {
            setCount(count + 1);
            setCount(count + 1);
            setCount(count + 1);
            setSnapshot(`本次事件捕获的 count = ${count}`);
          }}
        >
          直接更新 +3？
        </button>
        <button
          onClick={() => {
            setCount((n) => n + 1);
            setCount((n) => n + 1);
            setCount((n) => n + 1);
            setSnapshot(`本次事件捕获的 count = ${count}`);
          }}
        >
          函数式更新 +3
        </button>
      </div>
      <p role="status">{snapshot}</p>
    </>
  );
}
// #endregion snapshot

// #region cart
export function CartDemo() {
  const [items, setItems] = useState([
    { id: 1, name: "笔记本", price: 20, quantity: 1 },
    { id: 2, name: "钢笔", price: 10, quantity: 2 },
  ]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className="demo-actions">
          <span>
            {item.name} · ¥{item.price}
          </span>
          <label>
            数量{" "}
            <input
              type="number"
              min="0"
              max="99"
              value={item.quantity}
              onChange={(e) =>
                setItems(
                  items.map((row) =>
                    row.id === item.id
                      ? { ...row, quantity: Math.max(0, Math.min(99, Number(e.target.value))) }
                      : row,
                  ),
                )
              }
            />
          </label>
          <button onClick={() => setItems(items.filter((row) => row.id !== item.id))}>
            移除{item.name}
          </button>
        </div>
      ))}
      <p aria-live="polite">
        总价：<strong>¥{total}</strong>（直接计算，没有 total 状态）
      </p>
    </>
  );
}
// #endregion cart

// #region reference
export function ReferenceDemo() {
  const [profile, setProfile] = useState({ name: "小林", tags: ["Vue"] });
  const clicks = useRef(0);
  const [observed, setObserved] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [message, setMessage] = useState("尚未安排任务");
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <>
      <p>
        {profile.name}：{profile.tags.join("、")}
      </p>
      <p>上次主动读取的 ref 次数：{observed}</p>
      <div className="demo-actions">
        <button
          onClick={() => {
            clicks.current++;
          }}
        >
          仅修改 ref
        </button>
        <button onClick={() => setObserved(clicks.current)}>读取 ref 并展示</button>
        <button
          onClick={() =>
            setProfile({ ...profile, name: profile.name === "小林" ? "小周" : "小林" })
          }
        >
          替换对象并渲染
        </button>
        <button
          onClick={() =>
            setProfile({ ...profile, tags: [...profile.tags, `React ${profile.tags.length}`] })
          }
        >
          不可变添加标签
        </button>
        <button
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setMessage("等待 1 秒");
            timer.current = setTimeout(() => setMessage("任务完成"), 1000);
          }}
        >
          安排延迟任务
        </button>
        <button
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setMessage("已取消");
          }}
        >
          取消任务
        </button>
      </div>
      <p role="status">{message}</p>
    </>
  );
}
// #endregion reference
