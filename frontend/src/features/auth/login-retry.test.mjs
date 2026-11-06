import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { createServer } from "vite";

let vite;
let loginUser;
let originalTestStorage;

before(async () => {
  originalTestStorage = globalThis.sessionStorage;
  const values = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  vite = await createServer({
    configFile: false,
    base: "/platform/",
    server: { middlewareMode: true },
  });
  ({ loginUser } = await vite.ssrLoadModule("/src/features/auth/api.ts"));
});

after(async () => {
  await vite?.close();
  if (originalTestStorage === undefined) delete globalThis.sessionStorage;
  else globalThis.sessionStorage = originalTestStorage;
});

async function withFetch(mockFetch, action) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    await action();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const payload = { email: "learner@example.test", password: "test-only-password" };

test("a second submission after an unknown network outcome reuses the operation", async () => {
  const attempts = [];
  const retryPayload = { email: "retry-after-outage@example.test", password: "test-only-password" };
  await withFetch(async (input, init = {}) => {
    if (String(input).endsWith("/user/login-capabilities")) return jsonResponse({ idempotent_login: true });
    attempts.push(new Headers(init.headers).get("Idempotency-Key"));
    if (attempts.length <= 2) throw new TypeError("network failure");
    return jsonResponse({ user: { id: "learner-1" } });
  }, async () => {
    await assert.rejects(loginUser(retryPayload), /network failure/);
    await loginUser(retryPayload);
  });
  assert.equal(attempts.length, 3);
  assert.equal(attempts[0], attempts[1]);
  assert.equal(attempts[1], attempts[2]);
});

test("a failed login for another account does not discard an unknown operation", async () => {
  const first = { email: "pending-a@example.test", password: "test-only-password" };
  const second = { email: "pending-b@example.test", password: "test-only-password" };
  const keys = [];
  await withFetch(async (input, init = {}) => {
    if (String(input).endsWith("/user/login-capabilities")) return jsonResponse({ idempotent_login: true });
    const body = JSON.parse(init.body);
    if (body.email === second.email) return jsonResponse({ detail: "bad credentials" }, 401);
    keys.push(new Headers(init.headers).get("Idempotency-Key"));
    if (keys.length <= 2) throw new TypeError("network failure");
    return jsonResponse({ user: { id: "learner-1" } });
  }, async () => {
    await assert.rejects(loginUser(first), /network failure/);
    await assert.rejects(loginUser(second), /bad credentials/);
    await loginUser(first);
  });
  assert.equal(keys[0], keys[2]);
});

test("a page reload resumes the same uncertain operation without storing credentials", async () => {
  const values = new Map();
  const originalStorage = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  const reloadPayload = { email: "reload-case@example.test", password: "password-never-persisted" };
  const keys = [];
  try {
    await withFetch(async (input, init = {}) => {
      if (String(input).endsWith("/user/login-capabilities")) return jsonResponse({ idempotent_login: true });
      keys.push(new Headers(init.headers).get("Idempotency-Key"));
      if (keys.length <= 2) throw new TypeError("network failure");
      return jsonResponse({ user: { id: "learner-1" } });
    }, async () => {
      await assert.rejects(loginUser(reloadPayload), /network failure/);
      assert.ok(values.size > 0);
      assert.ok(![...values.values()].join(" ").includes(reloadPayload.password));
      assert.ok(![...values.values()].join(" ").includes(reloadPayload.email));
      vite.moduleGraph.invalidateAll();
      const reloaded = await vite.ssrLoadModule("/src/features/auth/api.ts");
      await reloaded.loginUser(reloadPayload);
    });
    assert.equal(keys[0], keys[2]);
  } finally {
    if (originalStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = originalStorage;
  }
});

test("new-mode login fails before sending credentials if session storage is unavailable", async () => {
  const originalStorage = globalThis.sessionStorage;
  let loginRequests = 0;
  globalThis.sessionStorage = {
    getItem: () => { throw new Error("storage disabled"); },
    setItem: () => { throw new Error("storage disabled"); },
    removeItem: () => { throw new Error("storage disabled"); },
  };
  try {
    await withFetch(async (input) => {
      if (String(input).endsWith("/user/login-capabilities")) return jsonResponse({ idempotent_login: true });
      loginRequests += 1;
      return jsonResponse({ user: { id: "learner-1" } });
    }, async () => {
      await assert.rejects(loginUser({ ...payload, email: "no-storage@example.test" }), /хранилищ/i);
    });
    assert.equal(loginRequests, 0);
  } finally {
    if (originalStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = originalStorage;
  }
});

test("idempotent login retries a network failure once with the same key and body", async () => {
  const requests = [];
  let loginAttempts = 0;

  await withFetch(async (input, init = {}) => {
    requests.push({ input, init });
    if (String(input).endsWith("/user/login-capabilities")) {
      return jsonResponse({ idempotent_login: true });
    }
    loginAttempts += 1;
    if (loginAttempts === 1) {
      throw new TypeError("network failure");
    }
    return jsonResponse({ user: { id: "learner-1" } });
  }, async () => {
    const result = await loginUser(payload);
    assert.deepEqual(result, { user: { id: "learner-1" } });
  });

  assert.deepEqual(requests.map(({ input }) => input), [
    "/platform/api/user/login-capabilities",
    "/platform/api/user/login",
    "/platform/api/user/login",
  ]);
  const [first, second] = requests.slice(1).map(({ init }) => init);
  const firstHeaders = new Headers(first.headers);
  const secondHeaders = new Headers(second.headers);
  const key = firstHeaders.get("Idempotency-Key");
  assert.match(key, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(secondHeaders.get("Idempotency-Key"), key);
  assert.equal(first.body, JSON.stringify(payload));
  assert.equal(second.body, first.body);
  assert.equal(first.credentials, "include");
  assert.equal(second.credentials, "include");
});

test("idempotent login retries HTTP 503 once with the same key", async () => {
  const loginRequests = [];

  await withFetch(async (input, init = {}) => {
    if (String(input).endsWith("/user/login-capabilities")) {
      return jsonResponse({ idempotent_login: true });
    }
    loginRequests.push(init);
    return jsonResponse({ detail: "temporarily unavailable" }, 503);
  }, async () => {
    await assert.rejects(loginUser(payload), /temporarily unavailable/);
  });

  assert.equal(loginRequests.length, 2);
  assert.equal(
    new Headers(loginRequests[0].headers).get("Idempotency-Key"),
    new Headers(loginRequests[1].headers).get("Idempotency-Key"),
  );
  assert.equal(loginRequests[0].body, loginRequests[1].body);
});

test("idempotent login does not retry 401", async () => {
  let loginAttempts = 0;

  await withFetch(async (input) => {
    if (String(input).endsWith("/user/login-capabilities")) {
      return jsonResponse({ idempotent_login: true });
    }
    loginAttempts += 1;
    return jsonResponse({ detail: "invalid credentials" }, 401);
  }, async () => {
    await assert.rejects(loginUser(payload), /invalid credentials/);
  });

  assert.equal(loginAttempts, 1);
});

test("capability network failure fails closed before login", async () => {
  let requests = 0;

  await withFetch(async () => {
    requests += 1;
    throw new TypeError("network failure");
  }, async () => {
    await assert.rejects(loginUser(payload), /network failure/);
  });

  assert.equal(requests, 1);
});

test("legacy false capability makes one login call without an idempotency key", async () => {
  const loginRequests = [];
  const legacyPayload = { ...payload, email: "legacy-one@example.test" };

  await withFetch(async (input, init = {}) => {
    if (String(input).endsWith("/user/login-capabilities")) {
      return jsonResponse({ idempotent_login: false });
    }
    loginRequests.push({ input, init });
    return jsonResponse({ user: { id: "legacy-learner" } });
  }, async () => {
    const result = await loginUser(legacyPayload);
    assert.deepEqual(result, { user: { id: "legacy-learner" } });
  });

  assert.equal(loginRequests.length, 1);
  assert.equal(loginRequests[0].input, "/platform/api/user/login");
  assert.equal(new Headers(loginRequests[0].init.headers).has("Idempotency-Key"), false);
});

test("missing capability endpoint falls back once and does not retry a legacy 503", async () => {
  const requests = [];
  const legacyPayload = { ...payload, email: "legacy-two@example.test" };

  await withFetch(async (input, init = {}) => {
    requests.push({ input, init });
    if (String(input).endsWith("/user/login-capabilities")) {
      return new Response(null, { status: 404 });
    }
    return jsonResponse({ detail: "legacy service unavailable" }, 503);
  }, async () => {
    await assert.rejects(loginUser(legacyPayload), /legacy service unavailable/);
  });

  assert.equal(requests.length, 2);
  assert.equal(requests[1].input, "/platform/api/user/login");
  assert.equal(new Headers(requests[1].init.headers).has("Idempotency-Key"), false);
});
