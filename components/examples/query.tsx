"use client";

import { useState } from "react";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getProducts, wait } from "@/lib/example-api";

// #region cache
function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, staleTime: 10_000, gcTime: 60_000 },
      mutations: { retry: false },
    },
  });
}
function CacheConsumer({ page, mode, name }: { page: number; mode: string; name: string }) {
  const query = useQuery({
    queryKey: ["products", { page, mode }],
    queryFn: ({ signal }) =>
      getProducts({ page, mode, signal, delay: mode === "slow" ? 2200 : 600 }),
    placeholderData: keepPreviousData,
  });
  return (
    <div className="rounded border p-3">
      <strong>{name}</strong>
      <p role="status">
        {query.isPending ? "首次加载" : query.isFetching ? "后台获取中，保留当前数据" : "缓存可用"}
        {query.isPlaceholderData ? " · 上一页占位数据" : ""}
      </p>
      {query.error ? (
        <p role="alert">
          {query.error.message} <button onClick={() => void query.refetch()}>重试</button>
        </p>
      ) : null}
      {query.data ? (
        <>
          <ul>
            {query.data.items.map((item) => (
              <li key={item.id}>
                {item.name} · ¥{item.price}
              </li>
            ))}
          </ul>
          {query.data.total === 0 ? <p>空结果</p> : null}
          <p>
            数据所属页：{query.data.page} · 最近成功获取：
            {new Date(query.dataUpdatedAt).toLocaleTimeString("zh-CN")}
          </p>
        </>
      ) : null}
    </div>
  );
}
function CacheControls() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState("success");
  const [second, setSecond] = useState(true);
  return (
    <>
      <div className="demo-actions">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          上一页
        </button>
        <span>第 {page} 页</span>
        <button disabled={page === 3} onClick={() => setPage(page + 1)}>
          下一页
        </button>
        <label>
          场景{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="success">成功</option>
            <option value="empty">空结果</option>
            <option value="error">失败</option>
            <option value="slow">慢响应</option>
          </select>
        </label>
      </div>
      <div className="demo-actions">
        <button onClick={() => setSecond(!second)}>{second ? "卸载" : "挂载"}消费者 B</button>
        <button onClick={() => void client.invalidateQueries({ queryKey: ["products"] })}>
          使缓存失效并重新获取
        </button>
      </div>
      <CacheConsumer page={page} mode={mode} name="消费者 A" />
      {second ? <CacheConsumer page={page} mode={mode} name="消费者 B（相同 key）" /> : null}
      <p>
        本例：staleTime = 10 秒，gcTime = 60 秒，retry = false，窗口聚焦不重取。相同 key
        共享缓存与进行中的请求。
      </p>
    </>
  );
}
export function CacheDemo() {
  const [client] = useState(createClient);
  return (
    <QueryClientProvider client={client}>
      <CacheControls />
    </QueryClientProvider>
  );
}
// #endregion cache

// #region optimistic
function createFavoriteApi() {
  let saved = false;
  return {
    async read(signal?: AbortSignal) {
      await wait(300, signal);
      return saved;
    },
    async write(value: boolean, fail: boolean) {
      await wait(1000);
      if (fail) throw new Error("模拟保存失败，已回滚");
      saved = value;
      return saved;
    },
  };
}
function Favorite({ api }: { api: ReturnType<typeof createFavoriteApi> }) {
  const client = useQueryClient();
  const [fail, setFail] = useState(true);
  const queryKey = ["favorite", 1] as const;
  const query = useQuery({ queryKey, queryFn: ({ signal }) => api.read(signal) });
  const mutation = useMutation({
    mutationFn: (next: boolean) => api.write(next, fail),
    onMutate: async (next) => {
      await client.cancelQueries({ queryKey });
      const previous = client.getQueryData<boolean>(queryKey);
      client.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      client.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey }),
  });
  return (
    <>
      <div className="demo-actions">
        <button
          disabled={query.isPending || mutation.isPending}
          onClick={() => mutation.mutate(!query.data)}
        >
          {query.data ? "★ 已收藏" : "☆ 收藏商品"}
        </button>
        <label>
          <input
            type="checkbox"
            checked={fail}
            disabled={mutation.isPending}
            onChange={(e) => setFail(e.target.checked)}
          />{" "}
          模拟失败
        </label>
      </div>
      <p role="status">
        {mutation.isPending
          ? "先更新缓存，再等待保存…"
          : mutation.isError
            ? mutation.error.message
            : mutation.isSuccess
              ? "已与模拟服务同步"
              : "首次读取后可操作"}
      </p>
      <p>
        本地内存模拟服务，每次重置恢复未收藏。为避免旧快照覆盖新操作，同一商品保存期间禁用再次提交。
      </p>
    </>
  );
}
export function OptimisticDemo() {
  const [client] = useState(createClient);
  const [api] = useState(createFavoriteApi);
  return (
    <QueryClientProvider client={client}>
      <Favorite api={api} />
    </QueryClientProvider>
  );
}
// #endregion optimistic
