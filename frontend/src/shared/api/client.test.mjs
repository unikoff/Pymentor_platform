import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";

test("apiRequest sends API calls through the relative /api prefix", async () => {
  const vite = await createServer({
    configFile: false,
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
    assert.equal(requestedUrl, "/api/user/me");
  } finally {
    globalThis.fetch = originalFetch;
    await vite.close();
  }
});
