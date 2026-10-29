# Embedded landing: integration and release readiness

This document records the Stage 08 checks for the React landing at `/backend` in the target k3s deployment, plus the existing landing registry/Telegram integration. It is a release checklist, not evidence that a production release has happened.

## Verified locally

- The frontend command completed successfully on 2026-10-28 with `VITE_BASE=/`, TypeScript checking, and Vite build. The build output was written outside the repository to `C:\Temp\stage08-k3s-root-20261028-01`.
- The generated HTML uses `/assets/...` URLs. The Vite manifest lists `BackendLandingRoute.tsx` as a dynamic entry; the main entry dynamically imports both that route and `Workspace.tsx`, with no lesson chunks in the main static import graph.
- A temporary Vite preview returned `200` for two direct GETs to `/backend` and for the referenced JS/CSS assets. This checks the root-base frontend build; it does not exercise a k3s cluster or Ingress.
- `helm lint` and offline `helm template` passed for `values-local-single.yaml`. The rendered IngressRoute sends `/api` to `core-api` at priority 100 and other host paths to `pymentor-frontend` at priority 1.
- `backend/tests/test_web_fallback.py` exercises a direct `/backend` request, registered admin/event handlers, existing `/learning` and `/user` routes, and JSON 404 responses for unknown API/legacy paths.
- The fallback, landing, and existing booking notification regression set passed: **58 tests passed**. This includes registry, admin authorization, secret-reference redaction, event allowlisting/idempotency, Telegram adapter, outbox worker, and booking notification tests. The suite uses test fixtures; no Telegram message was sent.

## Target deployment path: k3s at the host root

The project is transitioning to k3s, so the existing Helm IngressRoute and Frontend Nginx configuration are the target for this landing. They serve the platform at the host root:

| Route | Checked-in behavior | Landing URL / asset base |
|---|---|---|
| Helm IngressRoute | `/api` and `/api/*` go to Core at higher priority; other paths go to Frontend. | `/backend` and `/assets/...` with Vite base `/`. |
| Frontend Nginx | `/assets/` serves built files; `/api/` proxies to Core; `location /` uses `try_files ... /index.html`. | Direct GET/refresh of `/backend` returns the SPA entry. |
| Legacy WSGI mount in [`DEPLOYMENT.local.md`](../DEPLOYMENT.local.md) | `DispatcherMiddleware` strips `/platform`; that topology uses `VITE_BASE=/platform/`. | Legacy path only; it is not the target k3s route. |

Vite's default `base` is `/`; the project config also defaults to `/` when `VITE_BASE` is unset ([Vite public base path](https://vite.dev/guide/build#public-base-path)). Building with `/platform/` would generate asset URLs that the current k3s Nginx config does not serve. The production Helm profiles are still documented as render/lint scaffolds in [`core-k3s-local.md`](stage-01-k3s/operations/core-k3s-local.md). In this environment the WSL Docker daemon was unreachable and the selected kubectl API endpoint refused connections, so live cluster verification could not run.

## Release smoke checklist

Run these checks against the confirmed target and record the host, build revision, and results in the normal release record.

1. Build with `VITE_BASE=/` (or leave it unset); confirm the main HTML and every JS/CSS asset URL resolve under `/assets/`.
2. Open `/backend` directly, hard-refresh it, and confirm the landing renders without asset 404s through the k3s IngressRoute and Frontend Nginx.
3. In the browser network panel, confirm the landing does not request session, course catalog, lesson material, progress, or practice endpoints. Confirm the existing root entry still follows the normal session and Workspace flow.
4. Confirm `/api/admin/landings` and the landing event endpoint reach Core through the IngressRoute. An unauthenticated admin request should remain unauthorized; an unknown `/api/*` request should return JSON 404, never the SPA HTML.
5. Check the existing `/learning`, `/user`, and `/admin` flows and the ordinary booking notification path.
6. In a controlled staging environment, configure two landing IDs with different bot secret references and chat IDs. Send one allowlisted test event to each controlled destination and confirm routing, redaction, and idempotency. Do not use a real customer destination for the test.
7. Check desktop/mobile, light/dark theme, keyboard navigation, and reduced-motion behavior using the Stage 07 checklist before opening public traffic.

The repository tests cover the API/fallback and mocked notification behavior. They do not replace the browser network check, live reverse-proxy check, or controlled Telegram delivery check above.

## Landing registry and bot secret configuration

The backend resolves bot tokens from the server-only environment variable `PYMENTOR_LANDING_BOT_CREDENTIALS`. The Helm Core Deployment references a Kubernetes Secret selected by `runtimeSecret.name` (default `pymentor-runtime`) and a key selected by `runtimeSecret.landingBotCredentialsKey` (default `PYMENTOR_LANDING_BOT_CREDENTIALS`). The value is a JSON object mapping each opaque `secret_ref` to its bot token.

An operator can register another landing and select its own `secret_ref`, `chat_id`, and verified bot username through the admin API; this does not require a frontend bundle change. Keep token values in the project’s approved secret manager/Kubernetes Secret workflow only. Never put them in source control, Vite variables, landing configuration responses, logs, TickTick, or browser code. The repository does not establish whether the corresponding production Secret exists or who owns updates to it; confirm that through the release owner without printing its value.

## Rollback

- **Frontend-only rollback:** restore the last known-good frontend release artifact/image, including the matching hashed assets and the same base path. No landing-specific frontend data migration is required. Verify `/backend`, its `/assets/...` files, and the root Workspace after rollback.
- **K3s rollback:** use the approved Helm release procedure and restore the last known-good frontend/backend revisions together when the change spans both images. Keep the landing registry, runtime Secret, database/PVC, and queued notification outbox intact. Do not uninstall the release or delete/recreate persistent storage as part of an application rollback.
- The local k3d Helm rollback rehearsal in [`core-k3s-local.md`](stage-01-k3s/operations/core-k3s-local.md) verifies local PVC preservation only; it is not production rollback evidence. No production rollback was run for this stage.

## Release gate

The k3s root-path build, local direct-route/assets preview, Helm lint/template, and backend tests pass. Release readiness remains **pending** until the approved k3s cluster is reachable and the IngressRoute, Nginx, Workspace/network, and controlled notification smoke checks pass there. No production configuration, Secret, cluster, or Telegram destination was changed during this stage.

## Follow-up local verification — 2026-10-28

- After the platform-funnel and CTA-contrast changes, `npm run build` passed: TypeScript and Vite production build completed.
- A browser opened and refreshed `/backend` directly. The platform-step and dedicated platform-section CTAs both resolve to the existing root route `/`.
- The root Workspace loaded and exposed its theme switch. Direct visits to `/learning`, `/user`, and `/admin` remained outside the landing branch.
- Responsive checks at 320, 390, 768, and 1366 CSS pixels found no horizontal overflow; the platform CTA remained visible. Both saved themes were checked and the original dark theme was restored. CTA text contrast measured 6.08:1 in light mode and 12.44:1 in dark mode.
- The in-app browser does not expose a separate text-only zoom control. A 320px viewport was used as a narrow-layout stress check; browser text zoom itself was not independently verified.
- This follow-up used the local Vite server, not k3s. It did not capture a browser network trace or test delivery to real Telegram destinations. The landing branch still returns before `PlatformEntry`/session loading, and the landing module contains no lesson API client usage; production and controlled-delivery gates above remain pending.
