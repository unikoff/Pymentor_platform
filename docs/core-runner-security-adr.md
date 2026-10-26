# ADR: legacy Runner security baseline before M3

- **Status:** Accepted for the pre-M3 release gate
- **Date:** 2026-10-27
- **Decision owner:** Core Runner

## Context and threat model

The public submit, preview (`/tasks/{task_id}/run`) and interpreter (`/interpreter/run`) endpoints accept user-authored Python. In the current implementation the source is started as a separate Python process in a temporary working directory. That is process separation, not a security sandbox: Python code runs with the service account's host permissions. The `-I` option and removal of `PYTHONPATH` do not remove the inherited environment or constrain filesystem, network, syscalls, or credentials.

| Asset / boundary | Current evidence and exposure | Decision before M3 |
| --- | --- | --- |
| Host and filesystem | Child inherits service-account permissions; temporary cwd is not a filesystem jail. Code can attempt to read or modify anything that account can access. | Do not expose execution publicly. |
| Environment and secrets | Runner copies `os.environ`; only `PYTHONPATH` is removed and `PYTHONIOENCODING` set. Other environment values remain available to the child. | No production secret-bearing environment may be considered safe for legacy execution. |
| Network | No network namespace, egress policy or network-denial mechanism is present in the Runner path. | Treat outbound and local network access as available under host policy. |
| CPU / wall time | Configurable wall timeout (default 3 seconds) and a requested CPU limit (default 3 seconds). CPU `RLIMIT` is applied only on Linux; parent timeout kills the process. | Useful failure containment, not a tenant boundary. Windows has no demonstrated CPU quota here. |
| RAM | Requested address-space limit defaults to 128 MiB and is applied only on Linux. | Windows and other platforms have no demonstrated per-run memory cap. |
| PID / descendants | One admitted run per executor and a cross-process lock serialize executions. POSIX starts a process group and kills it for cleanup; Windows kills the root process only. No cgroup/job-object PID quota is established. | Global concurrency control is not a PID limit; descendant containment is incomplete on Windows. |
| Output / result | Parent caps captured stdout/result and stderr; harness also limits user stdout and serialized results. | Bounded output reduces memory/log pressure, but does not isolate the host. |
| Abuse rate / fairness | One active execution per application process plus a file lock coordinates processes sharing that lock path. No per-user rate limit, queue fairness or distributed/global admission service is evidenced. Contending requests receive 503 with `Retry-After: 2`. | Serialization limits concurrency only; it does not stop repeated requests or guarantee a fleet-wide quota. |

### Safe local failure evidence

Existing local runner cases cover an infinite loop (wall timeout), oversized stdout/stderr/result (output caps), invalid limit configuration (fail before child start), and resource-limit setup failure on Linux. The relevant test cases use inert snippets and no production account or data. Linux-only memory/CPU tests are platform-gated. The C1.1.5 feature-flag test uses an isolated in-memory SQLite engine and verifies disabled requests fail before task lookup, executor admission, or progress writes. No network probing, host-file access, secret reads, production requests, or destructive payloads are part of this decision.

On 2026-10-27 the coordinator ran `backend.tests.test_core_baseline`, `backend.tests.test_runner_feature_flag`, and `backend.tests.test_runner_execution` with synthetic data, notifications disabled and the legacy flag explicitly enabled: 25 tests passed, 5 Linux/Unix-only tests skipped on Windows. The test was run with sandbox approval because child temporary-file creation was denied in the ordinary sandbox. The skipped OS controls and a sandbox security boundary remain unverified.

## Decision

Add one server-side gate in `backend/routers/courses/service.py`, shared by all three public execution handlers. It reads `PYMENTOR_PUBLIC_RUNNER_ENABLED` on each request and allows execution only for `1`, `true`, `yes` or `on` (case-insensitive); unset, empty, false and unrecognized values deny execution with HTTP 503. The check runs before submit/preview task lookup and before any executor call, including interpreter execution. There is no client-side bypass.

The default is **deny** because no evidence establishes isolation from host files, service environment/secrets or network, and resource caps differ by OS. This intentionally makes pre-existing deployments that do not set the new flag lose public code execution until an operator explicitly opts in. Existing deployments that deliberately set the flag to a truthy value retain the legacy endpoint behavior and response contracts. The explicit opt-in is for controlled development or internal use only; setting it does not certify the Runner as safe for public or production traffic.

Until M3 supplies and verifies an isolation boundary, public execution is a **release blocker**. Do not set the flag in a public deployment to work around that blocker. M3 acceptance must demonstrate: non-privileged isolated identity; filesystem jail and read-only host mounts; explicit environment allowlist with no secrets; network egress denial; enforced CPU, memory, PID and wall-time ceilings on every supported OS; bounded output; process-tree cleanup; and abuse-rate controls across the deployment. Verify denial and limits using safe adversarial fixtures in disposable environments before enabling public traffic.

## Emergency disable and recovery

To disable execution, set `PYMENTOR_PUBLIC_RUNNER_ENABLED=false` (or remove it) in the environment of every web worker and restart/redeploy those workers. The gate then returns HTTP 503 before execution on submit, preview and interpreter routes. Confirm all three routes reject requests and that no runner child starts. The flag is per-process environment configuration, not a live centralized kill switch; a fleet-wide emergency response requires updating and restarting every serving process. Re-enable only after the incident is resolved and the deployment owner explicitly approves the controlled mode.

## Consequences

- Existing public learners without the new explicit opt-in see execution temporarily unavailable; lesson reading and other course routes remain available.
- Operators must set the flag deliberately for controlled legacy use and must not confuse that opt-in with sandboxing.
- One centralized server check prevents a missed public route from bypassing the pre-M3 policy.
- CPU/RAM/PID/network/secret isolation, per-user fairness and a live fleet-wide kill switch remain unsolved until the relevant M3/runtime or deployment work is implemented and verified.
