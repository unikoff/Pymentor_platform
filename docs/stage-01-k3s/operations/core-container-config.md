# Container configuration and secret rotation runbook

## Build contexts

Build the backend with `backend/` as its context and the frontend with `frontend/` as its context. Each Dockerfile copies its own context (`COPY .` in backend and `COPY . .` in frontend), so the matching `.dockerignore` is the security boundary. Keep runtime credentials out of both contexts and inject them through the deployment runtime environment or secret store. `.env.example` is the only env file intentionally included as a non-secret sample.

## Runtime configuration inventory

| Variable | Classification | Runtime behavior / default | Code use |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required runtime configuration for the container image; may contain credentials | The image sets `PYMENTOR_REQUIRE_DATABASE_URL=1` and fails startup if `DATABASE_URL` is missing or blank. Local Python development still defaults to SQLite at `backend/test.db`; a relative `sqlite:///./...` value is intentionally replaced by that default. Container smoke uses disposable SQLite at `/tmp`; production must use an external database or an explicitly mounted durable SQLite path. | `backend/db/engine.py`, `backend/core/config.py` |
| `REDIS_URL` | Optional runtime configuration (service URL; may contain credentials) | Redis-backed session helpers are dormant in the active API. The Redis client is created only when a URL is provided; calling a helper without one raises a clear runtime error. Core does not need a Redis Service to start. | `backend/db/session.py` |
| `PYMENTOR_COOKIE_SECURE` | Optional runtime configuration / security flag | Defaults to false for local HTTP. Set to `true` behind production HTTPS so the session cookie is sent only over TLS; login and logout use matching cookie attributes. | `backend/routers/accounts/service.py` |
| `PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN` | Optional Secret | Empty/unset disables Telegram delivery when credentials are incomplete. Never log it. | `backend/notifications/telegram.py` |
| `PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID` | Optional runtime configuration | Empty/unset alongside token disables Telegram delivery. | `backend/notifications/telegram.py` |
| `PYMENTOR_LANDING_BOT_CREDENTIALS` | Optional Secret | JSON object mapping opaque versioned aliases to bot tokens. The admin API stores only an alias and chat ID; do not place this value in a ConfigMap, image, or frontend variable. Helm reads the key named by `runtimeSecret.landingBotCredentialsKey` from the existing runtime Secret. | `backend/notifications/telegram.py`, `backend/routers/landings/service.py` |
| `PYMENTOR_PUBLIC_RUNNER_ENABLED` | Optional runtime configuration / feature flag | Defaults to disabled; only `1`, `true`, `yes`, or `on` enables public execution. | `backend/routers/courses/service.py` |
| `PYMENTOR_LOCAL_NOTIFICATIONS` | Optional runtime configuration | Defaults to enabled for local Python runs. The Helm chart defaults `core.notificationWorkerEnabled` to `false`; enable it only after provisioning the Telegram Secret and reviewing queued events. `0`, `false`, or `off` disables the shared booking/landing notification worker. | `backend/core/web.py`, `deploy/helm/pymentor/values.yaml` |
| `PYMENTOR_LOG_TO_STDOUT` | Optional runtime configuration | When enabled, the standalone notification worker writes logs to stdout; the container image enables it. Local runs keep the rotating log file by default. | `backend/notifications/worker.py` |
| `PYMENTOR_RUNNER_TIMEOUT_SECONDS` | Optional runtime configuration | Defaults to 3 seconds (or the caller-provided timeout default). | `backend/content/practice/runner/runtime.py` |
| `PYMENTOR_RUNNER_CPU_SECONDS` | Optional runtime configuration | Defaults to 3 seconds of CPU. | `backend/content/practice/runner/runtime.py` |
| `PYMENTOR_RUNNER_MEMORY_MB` | Optional runtime configuration | Defaults to 128 MB. | `backend/content/practice/runner/runtime.py` |
| `PYMENTOR_RUNNER_OUTPUT_BYTES` | Optional runtime configuration | Defaults to 65536 bytes. | `backend/content/practice/runner/runtime.py` |
| `PYMENTOR_RUNNER_RESULT_BYTES` | Optional runtime configuration | Defaults to 1048576 bytes. | `backend/content/practice/runner/runtime.py` |
| `PYMENTOR_RUNNER_STDERR_BYTES` | Optional runtime configuration | Defaults to 65536 bytes. | `backend/content/practice/runner/runtime.py` |
| `VITE_BASE` | Public build-time configuration; safe to embed in frontend assets | Defaults to `/`; set e.g. `/platform/` when building under a URL prefix. | `frontend/config/vite.config.ts` |
| `VITE_CACHE_DIR` | Local build-tool setting, not a runtime secret | Defaults to `C:/Temp/pymentor-platform-vite-cache`. | `frontend/config/vite.config.ts` |

Landing bot tokens are optional runtime secrets and are resolved by opaque aliases; backend responses and logs never return the token value. Redis is not an active API dependency. The Vite development proxy uses the fixed public target `http://127.0.0.1:8001`; it is not emitted into frontend application code. Do not define secrets under `VITE_*`, because Vite exposes those values to the browser bundle.

## Container ingress contract

The frontend Nginx container serves port `8080` and proxies `/api/` to Core. A K3s ingress or other trusted TLS terminator must overwrite `X-Forwarded-Proto` with the scheme used by the client; Nginx preserves that value and falls back to its own request scheme when the header is absent. Nginx forwards the original Host including a non-default port so the Core Origin guard can compare same-origin writes correctly. `PYMENTOR_COOKIE_SECURE` is false for local HTTP and true for HTTPS production profiles. Keep Core port `8001` private behind the frontend proxy.

## Public route contract

`/` and browser deep links stay on the frontend; `/api/` remains the current Core API, including its existing auth and learning paths. Admin-managed landing configuration is available at `/api/admin/landings/`. The only enabled landing event is the admin-only, non-personal `telegram_connection_test.v1`; public lead and CTA event routes are not enabled. Reserve `/api/analytics/` and `/api/mentor/` for future Analytics and AI Mentor services.

## Rotate optional Telegram token

1. Create/rotate the bot token with Telegram's bot management interface and store it in the deployment secret store as `PYMENTOR_PLATFORM_TELEGRAM_BOT_TOKEN`; keep the chat ID in runtime configuration as `PYMENTOR_PLATFORM_TELEGRAM_CHAT_ID`.
2. Update the secret reference for the backend workload and restart/roll out that workload so the process receives the new environment.
3. Verify delivery with a controlled booking notification, checking only success/failure status. Do not print the token, include it in a command line, or paste it into logs.
4. Revoke the old token after the new deployment is confirmed. If delivery is not needed, remove both values; incomplete credentials disable Telegram delivery.

## Configure a landing bot

1. Store bot tokens in the external Kubernetes Secret key selected by `runtimeSecret.landingBotCredentialsKey`. Its JSON value maps versioned aliases such as `backend-bot-v1` to token values. Keep tokens out of Helm values, ConfigMaps, source files, command lines, and logs.
2. The existing `/backend` landing is registered at bootstrap with stable ID `pymentor-backend`; new pages can be added through `POST /api/admin/landings`. Set a destination with `PUT /api/admin/landings/{landing_id}/telegram` using the alias and chat ID. The API checks `getMe` and `getChat`, and returns only the bot name, chat ID, status, and config version.
3. To send a controlled test message, enqueue `telegram_connection_test.v1` through the admin event endpoint with a UUID `Idempotency-Key`, then inspect event status. The fixed event contains no visitor data; it is rate-limited to three tests per landing per hour.
4. For rotation, add a new alias such as `backend-bot-v2`, update the landing to that alias, and keep the old alias in the Secret until all events referencing its config version are sent or deliberately failed. Disable the landing's Telegram configuration to stop new events; queued events continue to target their original config version. For immediate revocation, revoke the bot token with Telegram and remove the alias; queued events using it fail safely. Replacing the current bot does not redirect those old events, so replay them under a new event ID only when an administrator decides that a duplicate notification is appropriate.
5. The worker is disabled by default in Helm. After reviewing the current queue and provisioning the secret, enable it with `core.notificationWorkerEnabled=true` for the single Core replica. It drains both booking and landing queues through the same worker. Delivery is at-least-once: if Telegram accepted a message but its response timed out, a retry may send a duplicate.

Landing outbox tables are added by the repeatable `create_all` bootstrap and are not destructive to existing booking data. Sent event payloads are pruned after 30 days; failed events remain inspectable until manually retried or removed by a future retention policy. Old application versions ignore these additive tables, so rollback does not require dropping them.

## Change M2 `DATABASE_URL` credentials

1. Provision/rotate the database user's credential in the database service, preferably allowing a short overlap or a second credential during rollout.
2. Update the runtime secret for `DATABASE_URL` in the backend deployment. Do not put it in a Docker build argument, image, frontend variable, shell history, or log.
3. Roll out/restart backend instances and check readiness plus a database-backed health operation without printing the connection string. Confirm migrations are applied using the deployment's normal migration procedure.
4. After all instances use the new credential and checks pass, revoke the previous credential. If checks fail, restore the previous secret reference and restart before revoking it.
5. Treat SQLite development defaults separately: rotating production credentials does not alter local SQLite data.

## Build-time frontend configuration

Set only public values such as `VITE_BASE` when running the frontend build. Frontend build context excludes local `.env` files other than `.env.example`, SQLite files, test directories and key/certificate files. The frontend image receives no backend runtime secrets; inject backend settings only into the backend container at runtime.

## Container image provenance

`.github/workflows/container-images.yml` builds both images from the checked-out commit and tags them with `github.sha`. It records each local Docker image ID and any digest exposed by the local engine; these values do not imply a registry push. The workflow uploads SPDX JSON SBOMs as run artifacts and blocks on Critical vulnerability findings. The frontend build also runs `npm audit --audit-level=critical`; high findings are reported but do not block. Rebuild from the same commit to reproduce the build inputs. When a later release job publishes images, it must keep registry credentials in GitHub Secrets, record the registry manifest digest, and deploy by digest; do not use `latest` or pass credentials as build args.
