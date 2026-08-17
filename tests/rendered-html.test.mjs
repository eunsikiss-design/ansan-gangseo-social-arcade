import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("통합사회 탐구 아케이드 홈을 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>통합사회 탐구 아케이드 \| 안산강서고<\/title>/);
  assert.match(html, /안산강서고/);
  assert.match(html, /탐구 아케이드/);
  assert.match(html, /학급 아이디/);
  assert.doesNotMatch(html, /codex-preview|Building your site|SkeletonPreview/);
});




