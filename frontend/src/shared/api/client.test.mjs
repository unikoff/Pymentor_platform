import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

for (const [base, expected] of [["/", "/api/user/me"], ["/platform/", "/platform/api/user/me"]]) {
 test(`apiRequest uses the configured base ${base}`, async () => {
  const vite = await createServer({
    configFile: false,
    base,
    server: { middlewareMode: true },
  });
  const originalFetch = globalThis.fetch;
  let requestedUrl;

  try {
    const { apiRequest } = await vite.ssrLoadModule("/src/shared/api/client.ts");
    globalThis.fetch = async (input) => {
      requestedUrl = input;
      return new Response(JSON.stringify({ user: null }), {
        headers: { "Content-Type": "application/json" },
      });
    };

    await apiRequest("/user/me");
    assert.equal(requestedUrl, expected);
  } finally {
    globalThis.fetch = originalFetch;
    await vite.close();
  }
 });
}
