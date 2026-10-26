import { products } from '@/lib/example-api';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawDelay = Number(params.get('delay') ?? 400);
  const delay = Number.isFinite(rawDelay) ? Math.max(0, Math.min(rawDelay, 3000)) : 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const headers = { 'Cache-Control': 'no-store' };
  if (params.get('mode') === 'error') return Response.json({ message: '模拟 HTTP 错误' }, { status: 503, headers });
  const filtered = params.get('mode') === 'empty' ? [] : products.filter((p) => p.name.includes(params.get('q') ?? ''));
  const rawPage = Number(params.get('page') ?? 1);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
  return Response.json({ items: filtered.slice((page - 1) * 2, page * 2), total: filtered.length, page }, { headers });
}
