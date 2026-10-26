'use client';

import { useEffect, useRef, useState } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { persist } from 'zustand/middleware';

// #region store
type Cart = { quantities: Record<string, number>; add: (id: string) => void; reset: () => void };
function createCart() {
  return createStore<Cart>()((set) => ({
    quantities: { notebook: 1, pen: 2 },
    add: (id) => set((state) => ({ quantities: { ...state.quantities, [id]: state.quantities[id] + 1 } })),
    reset: () => set({ quantities: { notebook: 1, pen: 2 } }),
  }));
}
function Product({ store, id, name }: { store: StoreApi<Cart>; id: string; name: string }) {
  const quantity = useStore(store, (state) => state.quantities[id]);
  const add = useStore(store, (state) => state.add);
  const count = useRef(0);
  const output = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    count.current++;
    if (output.current) output.current.textContent = String(count.current);
  });
  return <div className="demo-actions"><button onClick={() => add(id)}>{name}：{quantity}</button><span>提交后的 Effect 次数：<output ref={output}>0</output></span></div>;
}
function Summary({ store }: { store: StoreApi<Cart> }) {
  const total = useStore(store, (state) => state.quantities.notebook * 20 + state.quantities.pen * 10);
  return <p>另一个消费者 · 购物车总价：¥{total}</p>;
}
export function StoreDemo() {
  const [store] = useState(createCart);
  const [preference] = useState(() => createStore<{ compact: boolean; toggle: () => void }>()(persist((set) => ({
    compact: false,
    toggle: () => set((s) => ({ compact: !s.compact })),
  }), { name: 'vue-react-demo-preference-v1', partialize: (s) => ({ compact: s.compact }), skipHydration: true })));
  const compact = useStore(preference, (s) => s.compact);
  useEffect(() => { void preference.persist.rehydrate(); }, [preference]);
  return <>
    <Product store={store} id="notebook" name="笔记本" /><Product store={store} id="pen" name="钢笔" /><Summary store={store} />
    <div className="demo-actions"><button onClick={() => store.getState().reset()}>重置购物车</button><button onClick={() => preference.getState().toggle()}>持久化偏好：{compact ? '紧凑' : '舒展'}</button><button onClick={() => { preference.setState({ compact: false }); preference.persist.clearStorage(); }}>清除偏好</button></div>
    <p>只订阅一个商品的数量，另一个商品变化不会触发它的订阅更新。开发 Strict Mode 可能额外执行 Effect。</p>
  </>;
}
// #endregion store
