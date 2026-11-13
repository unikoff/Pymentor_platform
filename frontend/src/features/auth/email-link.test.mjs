import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { createServer } from "vite";

let vite;
let readEmailLink;
before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true } });
  ({ readEmailLink } = await vite.ssrLoadModule("/src/features/auth/email-link.ts"));
});

test("recognizes an email-change confirmation link", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const link = readEmailLink(new URL("https://example.test/backend?email_action=change_email#token=synthetic"), storage);
  assert.deepEqual(link, { action: "change_email", token: "synthetic" });
});
after(async () => { if (vite) await vite.close(); });

test("reads secret from fragment and restores the same action after reload", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const first = readEmailLink(new URL("https://example.test/backend?email_action=reset_password#token=abc"), storage);
  assert.deepEqual(first, { action: "reset_password", token: "abc" });
  const reload = readEmailLink(new URL("https://example.test/backend?email_action=reset_password"), storage);
  assert.deepEqual(reload, first);
  assert.equal(readEmailLink(new URL("https://example.test/backend?email_action=verify_email"), storage), null);
});
