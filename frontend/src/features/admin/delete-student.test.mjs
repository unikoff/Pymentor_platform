import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { createServer } from "vite";

let vite;
let deleteStudent;

before(async () => {
  vite = await createServer({ configFile: false, base: "/platform/", server: { middlewareMode: true } });
  ({ deleteStudent } = await vite.ssrLoadModule("/src/features/admin/api.ts"));
});
after(async () => { await vite?.close(); });

test("delete sends the displayed account generation and never retries a conflict", async () => {
  const oldFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ detail: "Account changed" }), {
      status: 409, headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const ref = "00112233-4455-4677-8899-aabbccddeeff";
    await assert.rejects(deleteStudent(123, ref), /Account changed/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/platform/api/admin/users/123");
    assert.equal(new Headers(calls[0].options.headers).get("X-Account-Ref"), ref);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test("an older backend remains callable when the profile has no account reference", async () => {
  const oldFetch = globalThis.fetch;
  let headers;
  globalThis.fetch = async (_url, options) => {
    headers = new Headers(options.headers);
    return new Response(JSON.stringify({ deleted: 123 }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  };
  try {
    await deleteStudent(123);
    assert.equal(headers.has("X-Account-Ref"), false);
  } finally {
    globalThis.fetch = oldFetch;
  }
});
