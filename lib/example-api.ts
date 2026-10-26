export type Product = { id: number; name: string; price: number };
export type ProductPage = { items: Product[]; total: number; page: number };
export const products: Product[] = [
  { id: 1, name: "笔记本", price: 20 },
  { id: 2, name: "钢笔", price: 10 },
  { id: 3, name: "背包", price: 120 },
  { id: 4, name: "台灯", price: 80 },
  { id: 5, name: "笔记贴", price: 5 },
  { id: 6, name: "笔袋", price: 15 },
];
export async function getProducts({
  query = "",
  page = 1,
  mode = "success",
  delay = 400,
  signal,
}: {
  query?: string;
  page?: number;
  mode?: string;
  delay?: number;
  signal?: AbortSignal;
} = {}): Promise<ProductPage> {
  const search = new URLSearchParams({ q: query, page: String(page), mode, delay: String(delay) });
  const response = await fetch(`/api/examples/products?${search}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}：模拟服务暂时不可用`);
  return response.json();
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("已取消", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("已取消", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
