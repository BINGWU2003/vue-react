import { after, afterEach, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
let browser, context, page, server;
let errors = [];
let serverLog = "";
const chapters = [
  "01-template-jsx",
  "02-state",
  "03-effects",
  "04-components",
  "05-hooks",
  "06-routing",
  "07-stores",
  "08-requests",
  "09-styling",
  "10-library-styles",
  "11-rendering",
];
const demo = (id) => page.locator(`[data-demo="${id}"]`);
const go = async (slug) => {
  const response = await page.goto(`${origin}/docs/${slug}`);
  assert.equal(response.status(), 200);
};
async function eventually(check, message, timeout = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}
before(async () => {
  if (!process.env.TEST_BASE_URL) {
    let occupied = false;
    try {
      occupied = (await fetch(origin)).ok;
    } catch {
      /* 没有服务监听 */
    }
    assert.equal(occupied, false, "端口 3100 已有服务；请停止它或显式设置 TEST_BASE_URL。");
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3100"], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    server.stdout.on("data", (chunk) => {
      serverLog += chunk;
    });
    server.stderr.on("data", (chunk) => {
      serverLog += chunk;
    });
  }
  await eventually(
    async () => {
      try {
        return (await fetch(origin)).ok;
      } catch {
        return false;
      }
    },
    `服务未就绪：${serverLog}`,
    30_000,
  );
  browser = await chromium.launch({
    headless: true,
    channel:
      process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === "win32" ? "chrome" : undefined),
  });
  await mkdir("test-results", { recursive: true });
});
beforeEach(async () => {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  page = await context.newPage();
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
afterEach(async () => {
  await context?.close();
  assert.deepEqual(errors, [], "页面应无运行时错误");
});
after(async () => {
  await browser?.close();
  if (server && server.exitCode === null)
    await new Promise((resolve) => {
      server.once("exit", resolve);
      server.kill();
    });
});

test("首页、全部章节、目录、搜索与 Markdown 表示", async () => {
  await page.goto(origin);
  assert.equal(await page.locator('section[aria-label="文档目录"] a').count(), 11);
  for (const slug of chapters) {
    await go(slug);
    await page.locator("h1").waitFor();
    assert.ok(await page.locator("h1").innerText());
    assert.equal(await page.getByText("示例出现错误", { exact: false }).count(), 0);
  }
  const search = await fetch(`${origin}/api/search?query=${encodeURIComponent("状态")}`);
  assert.equal(search.status, 200);
  assert.match(await search.text(), /\/docs\//);
  const markdown = await fetch(`${origin}/docs/02-state.md`);
  assert.equal(markdown.status, 200);
  const body = await markdown.text();
  assert.match(body, /SnapshotDemo/);
  assert.doesNotMatch(body, /<include/);
  assert.equal((await fetch(`${origin}/docs/topics`, { redirect: "manual" })).status, 308);
});

test("待办增删筛选，CSS 隐藏保留草稿，卸载重建草稿", async () => {
  await go("01-template-jsx");
  const box = demo("E01");
  await box.getByLabel("待办内容").fill("测试条目");
  await box.getByRole("button", { name: "新增", exact: true }).click();
  assert.ok(await box.getByText("测试条目", { exact: true }).isVisible());
  await box.getByRole("button", { name: "删除 测试条目", exact: true }).click();
  assert.equal(await box.getByText("测试条目", { exact: true }).count(), 0);
  const draft = box.getByLabel("组件内部草稿");
  await draft.fill("保留内容");
  await box.getByRole("button", { name: "隐藏草稿" }).click();
  await box.getByRole("button", { name: "显示草稿" }).click();
  assert.equal(await draft.inputValue(), "保留内容");
  await box.getByLabel("隐藏时卸载").check();
  await draft.fill("应被重置");
  await box.getByRole("button", { name: "隐藏草稿" }).click();
  await box.getByRole("button", { name: "显示草稿" }).click();
  assert.equal(await draft.inputValue(), "我会保留吗？");
});

test("状态快照、函数式队列、派生总价和 ref", async () => {
  await go("02-state");
  await demo("E02").getByRole("button", { name: "直接更新 +3？" }).click();
  assert.equal(await demo("E02").locator(".demo-number").innerText(), "1");
  await demo("E02").getByRole("button", { name: "函数式更新 +3" }).click();
  assert.equal(await demo("E02").locator(".demo-number").innerText(), "4");
  await demo("E03").locator('input[type="number"]').first().fill("3");
  assert.match(await demo("E03").innerText(), /¥80/);
  await demo("E04").getByRole("button", { name: "仅修改 ref" }).click();
  assert.match(await demo("E04").innerText(), /ref 次数：0/);
  await demo("E04").getByRole("button", { name: "读取 ref 并展示" }).click();
  assert.match(await demo("E04").innerText(), /ref 次数：1/);
});

test("订阅切换先清理，卸载释放监听；闭包与最新引用不同", async () => {
  await go("03-effects");
  await demo("E05").getByLabel("订阅目标").selectOption("商品 B");
  const logs = await demo("E05").locator(".demo-log").innerText();
  assert.ok(logs.indexOf("cleanup：退订 商品 A") < logs.indexOf("setup：订阅 商品 B"));
  await demo("E05").getByRole("button", { name: "卸载订阅" }).click();
  await demo("E05").getByRole("button", { name: "清空日志" }).click();
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  assert.equal(await demo("E05").locator(".demo-log li").count(), 0);
  await demo("E06").getByRole("button", { name: "安排延迟读取" }).click();
  await demo("E06").getByRole("button", { name: "加一", exact: true }).click();
  await eventually(
    async () => (await demo("E06").innerText()).includes("闭包快照：0；最新已提交值：1"),
    "应分别显示快照与最新值",
  );
});

test("可控搜索、聚焦和独立/共享 Hook", async () => {
  await go("04-components");
  await demo("E07").getByLabel("商品搜索").fill("笔");
  assert.match(await demo("E07").innerText(), /父组件持有的值：笔/);
  await demo("E07").getByRole("button", { name: "父组件聚焦" }).click();
  assert.equal(
    await demo("E07")
      .getByLabel("商品搜索")
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await go("05-hooks");
  await demo("E08").getByRole("button", { name: "独立 A：0" }).click();
  assert.ok(await demo("E08").getByRole("button", { name: "独立 B：0" }).isVisible());
  await demo("E08").getByRole("button", { name: "共享 A：0" }).click();
  assert.ok(await demo("E08").getByRole("button", { name: "共享 B：1" }).isVisible());
});

test("Zustand selector 不订阅无关字段，偏好持久化与清除", async () => {
  await go("07-stores");
  const box = demo("E10");
  await box.getByRole("button", { name: "笔记本：1", exact: true }).waitFor();
  const before = await box.locator("output").first().innerText();
  await box.getByRole("button", { name: "钢笔：2", exact: true }).click();
  assert.equal(await box.locator("output").first().innerText(), before);
  assert.match(await box.innerText(), /¥50/);
  await box.getByRole("button", { name: "持久化偏好：舒展" }).click();
  await page.reload();
  await box.getByRole("button", { name: "持久化偏好：紧凑" }).waitFor();
  await box.getByRole("button", { name: "清除偏好" }).click();
  assert.ok(await box.getByRole("button", { name: "持久化偏好：舒展" }).isVisible());
});

test("手动搜索保护当前结果，失败和空态可观察", async () => {
  await go("08-requests");
  const box = demo("E11");
  await box.getByRole("button", { name: "重现：先慢「笔」，后快「背包」" }).click();
  await eventually(async () => (await box.innerText()).includes("成功：背包"), "新请求应成功");
  assert.ok(await box.getByText("背包 · ¥120", { exact: true }).isVisible());
  await new Promise((resolve) => setTimeout(resolve, 1900));
  assert.ok(await box.getByText("背包 · ¥120", { exact: true }).isVisible());
  await box.getByLabel("取消与失效保护").uncheck();
  await box.getByRole("button", { name: "重现：先慢「笔」，后快「背包」" }).click();
  await eventually(
    async () => (await box.innerText()).includes("成功：笔"),
    "无保护时旧响应应重现覆盖问题",
  );
  await box.getByRole("button", { name: "重现：先慢「笔」，后快「背包」" }).click();
  await box.getByLabel("取消与失效保护").check();
  await box.getByRole("button", { name: "重现：先慢「笔」，后快「背包」" }).click();
  await eventually(
    async () => (await box.innerText()).includes("成功：背包"),
    "切换保护模式后新结果仍应有效",
  );
  await new Promise((resolve) => setTimeout(resolve, 1900));
  assert.ok(await box.getByText("背包 · ¥120", { exact: true }).isVisible());
  await box.getByRole("combobox").selectOption("error");
  await box.getByRole("button", { name: "搜索", exact: true }).click();
  await eventually(async () => (await box.innerText()).includes("HTTP 503"), "HTTP 错误应可见");
  await box.getByRole("combobox").selectOption("empty");
  await box.getByRole("button", { name: "搜索", exact: true }).click();
  await eventually(async () => (await box.innerText()).includes("没有匹配的商品"), "空态应可见");
});

test("相同 Query key 共享请求，失效重取，乐观修改回滚/保存", async () => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/examples/products?")) requests.push(request.url());
  });
  await go("08-requests");
  const cache = demo("E12");
  await eventually(
    async () => (await cache.getByText("笔记本 · ¥20", { exact: true }).count()) === 2,
    "两个消费者都应有数据",
  );
  assert.equal(requests.length, 1, "相同 key 去重");
  await cache.getByRole("button", { name: "使缓存失效并重新获取" }).click();
  await eventually(async () => requests.length === 2, "失效应重新获取");
  const favorite = demo("E13");
  await favorite.getByRole("button", { name: "☆ 收藏商品" }).click();
  await favorite.getByRole("button", { name: "★ 已收藏" }).waitFor();
  assert.ok(await favorite.getByRole("button", { name: "★ 已收藏" }).isVisible());
  await eventually(async () => (await favorite.innerText()).includes("已回滚"), "失败应提示并回滚");
  assert.ok(await favorite.getByRole("button", { name: "☆ 收藏商品" }).isVisible());
  await favorite.getByLabel("模拟失败").uncheck();
  await favorite.getByRole("button", { name: "☆ 收藏商品" }).click();
  await eventually(
    async () => (await favorite.innerText()).includes("已与模拟服务同步"),
    "成功应同步",
  );
  assert.ok(await favorite.getByRole("button", { name: "★ 已收藏" }).isVisible());
});

test("样式方案保持行为，Portal 真实挂载到 body 并明确传递变量", async () => {
  await go("09-styling");
  await demo("E14").getByLabel("方案").selectOption("tailwind");
  assert.ok(await demo("E14").getByText("同一张商品卡片").isVisible());
  await go("10-library-styles");
  await demo("E15").getByRole("button", { name: "打开默认主题弹层" }).click();
  const modal = page.getByRole("dialog", { name: "Portal 到 document.body" });
  assert.equal(await modal.evaluate((node) => node.parentElement === document.body), true);
  assert.equal(
    await modal.evaluate((node) => getComputedStyle(node).borderTopColor),
    "rgb(219, 128, 80)",
  );
  await page.keyboard.press("Escape");
  await demo("E15").getByRole("button", { name: "打开指定主题弹层" }).click();
  assert.equal(
    await modal.evaluate((node) => getComputedStyle(node).borderTopColor),
    "rgb(86, 130, 117)",
  );
  await modal.getByRole("button", { name: "关闭", exact: true }).click();
});

test("列表身份保留与重建、memo 计算结果一致", async () => {
  await go("11-rendering");
  const box = demo("E17");
  await box.getByLabel("笔记本 的草稿").fill("我的草稿");
  await box.getByRole("button", { name: "反转列表" }).click();
  assert.equal(await box.getByLabel("笔记本 的草稿").inputValue(), "我的草稿");
  await box.getByRole("button", { name: "改变容器 key，重建表单" }).click();
  assert.equal(await box.getByLabel("笔记本 的草稿").inputValue(), "笔记本");
  await box.getByLabel("使用索引 key（反例）").check();
  await box.locator('input:not([type="checkbox"])').first().fill("索引草稿");
  await box.getByRole("button", { name: "反转列表" }).click();
  assert.equal(await box.getByLabel("笔记本 的草稿").inputValue(), "索引草稿");
  await demo("E18").getByLabel("筛选").fill("12000");
  assert.match(await demo("E18").innerText(), /直接计算：1 条/);
  assert.match(await demo("E18").innerText(), /useMemo：1 条/);
});

test("流程图全屏、缩放、拖动、适应、Escape 与焦点返回", async () => {
  await go("02-state");
  const figure = page.locator('[data-diagram="F01"]');
  const trigger = figure.getByRole("button", { name: "全屏查看：两端状态更新总览" });
  await trigger.click();
  const modal = page.getByRole("dialog", { name: "两端状态更新总览" });
  await modal.waitFor();
  const initial = await modal.locator("output").innerText();
  await modal.getByRole("button", { name: "放大", exact: true }).click();
  await eventually(
    async () => (await modal.locator("output").innerText()) !== initial,
    "放大应改变比例",
  );
  await modal.getByRole("button", { name: "复位 100%" }).click();
  assert.equal(await modal.locator("output").innerText(), "100%");
  const content = modal.locator(".react-transform-component");
  const before = await content.getAttribute("style");
  const box = await content.boundingBox();
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 220, box.y + 150, { steps: 5 });
  await page.mouse.up();
  assert.notEqual(await content.getAttribute("style"), before);
  await modal.getByRole("button", { name: "适应视口" }).click();
  await eventually(async () => {
    const stage = await modal.locator(".react-transform-wrapper").boundingBox();
    const drawing = await modal.locator(".react-transform-component").boundingBox();
    return (
      drawing.x >= stage.x &&
      drawing.y >= stage.y &&
      drawing.x + drawing.width <= stage.x + stage.width + 1 &&
      drawing.y + drawing.height <= stage.y + stage.height + 1
    );
  }, "适应视口应完整呈现图形");
  await modal.screenshot({ path: "test-results/diagram-light.png" });
  await page.keyboard.press("Escape");
  assert.equal(await modal.isVisible(), false);
  await eventually(
    async () => (await page.evaluate(() => document.body.style.overflow)) !== "hidden",
    "关闭后应恢复正文滚动",
  );
  assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
});

test("所有图的 SVG 完整可用，手机与深色阅读不溢出页面", async () => {
  for (let i = 1; i <= 11; i++) {
    const id = `F${String(i).padStart(2, "0")}`;
    const svg = await readFile(`public/diagrams/${id}-light.svg`, "utf8");
    assert.match(svg, /<svg/);
    assert.match(svg, /<title/);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await context.addInitScript(() => localStorage.setItem("theme", "dark"));
  await go("02-state");
  await eventually(
    async () =>
      await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor === "rgb(18, 18, 18)",
      ),
    "应切换为真正深色主题",
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
  );
  await page.screenshot({ path: "test-results/mobile-dark.png", fullPage: false });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.screenshot({ path: "test-results/home-desktop.png", fullPage: true });
});
