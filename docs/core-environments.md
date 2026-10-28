# C1.1.4 — локальные среды и измерительная база Core

**Статус:** PREPARED; локальные Core и frontend startup/latency измерены на Windows host. Kubernetes smoke в k3d и native Linux VM не выполнен. Измерения локального dev-профиля не подтверждают ёмкость кластера или production.
**Дата:** 27.10.2026. Источник контекста: текущий checkout; фактический кластер не обнаружен.
**Сверка:** [C1.1.1 inventory](core-inventory.md) и [C1.1.3 boundaries ADR](core-boundaries-adr.md). Core остаётся модульным монолитом; для M1 один Core writer с SQLite, для M2 локальный PostgreSQL и две stateless replicas, M3 обязателен для безопасного запуска недоверенного кода. Успех M1/M2 не разрешает production.

> Исторический снимок ниже фиксирует состояние при выполнении C1.1.4. Результаты последующего C1.3 зафиксированы отдельно здесь и в [runbook](core-k3s-local.md).

## C1.3 — реализованные и проверенные локальные профили K3s

**Статус на 28.10.2026: C1.3 implementation и runtime-проверки завершены.** `local-single` и `local-multinode` воспроизводимо подняты текущим bootstrap; профили использовали K3s `v1.37.1+k3s1`. Проверены Helm chart/values, single-origin ingress, маршруты/коды, PVC и SQLite persistence, probes/resources, graceful shutdown, NetworkPolicy и ingress replica recovery. Отдельный native K3s smoke выполнен для C1.4. Текущие ограничения — SQLite один Core writer и node-local `local-path`; это не HA/production, а оба сохранённых k3d профиля после проверок остановлены.

Для `local-single` подтверждены: Node Ready; Core и frontend rollout Ready; PVC `pymentor-sqlite` Bound с `ReadWriteOnce`; Core — один pod; `/` возвращает HTTP 200, `/api/user/me` без сессии — 401. Cookie login/logout прошёл same-origin smoke: локальная cookie HttpOnly/SameSite=Lax без Secure, logout очищает с теми же атрибутами. После перезапуска Core SQLite сохранила синтетического пользователя и запись прогресса (1/1). Online backup проверен через SQLite `integrity_check=ok`; backup содержал те же строки.

Ingress smoke подтвердил отклонение oversized body размером 21 MiB с HTTP 413; из 150 параллельных запросов получено 142×200 и 8×429. NetworkPolicy реально обеспечивается CNI: Frontend→Core разрешён, Frontend→внешний IP заблокирован, произвольный Pod в namespace `pymentor` не достигает Core. Четыре Helm-профиля проходили lint; production профили только рендерились/линтовались и не применялись.

Ограничения: `local-path` не реплицирует SQLite между узлами; отказ узла Core не имеет автоматического failover. k3d nodes работают на одном Windows host/WSL и не являются независимыми failure domains. Frontend audit сообщил 4 High npm advisory и 0 Critical; сборка настроена не блокировать High findings. В этом прогоне используются только синтетические данные.

Внешняя проверка из WSL host: слушали только loopback `28080` (Ingress) и `26550` (K3s API); TCP probes портов `5432`, `6379`, `8001`, `8002`, `8080`, `9090` завершились `ECONNREFUSED`. Kubernetes Services — только два `ClusterIP` (Core и Frontend); DB, broker и Runner не имеют внешних Service. Через Ingress `/api/docs` и `/api/openapi.json` вернули 404, `/api/admin/users` и `/api/admin/overview` без сессии — 401; `/docs` и `/admin` отдали SPA fallback, не admin данные. Последние 200 строк Core logs не содержали совпадений по DB URL/credential markers.

## Локальные профили

| Профиль | Состав и назначение | Границы доказательства |
| --- | --- | --- |
| `local-single` | Один локальный k3d cluster с одним server node. Core — один pod/endpoint и один SQLite writer; данные SQLite на выделенном persistent volume. Frontend — отдельный локальный deployment за ingress. Для проверки маршрутизации и базового lifecycle. | Не HA. Local-path volume привязан к узлу и не является backup. SQLite нельзя подключать ко второму writer. |
| `local-multinode` | Локальный k3d cluster: **1 server + 2 agents**. Те же Core/SQLite ограничения; frontend может быть разнесён по узлам только если это подтверждено scheduling. Использовать для проверки размещения, rescheduling и сетевого доступа между узлами. | Один server не даёт control-plane HA. Три k3d nodes на одном host не моделируют независимые машины, отказ домена, диска или сети. Не считать результат HA/production evidence. |
| `native-linux-m1` | Ubuntu 24.04 под WSL2, standalone K3s `v1.37.1+k3s1`, один server, отдельная synthetic SQLite DB; ServiceLB выключен. Проверены ingress через loopback port-forward, PVC, Core/frontend restart и `PRAGMA integrity_check` до/после. | Пройдено 28.10.2026; подробности в [M1 verification record](core-k3s-local.md#m1-verification-record-2026-10-28). WSL2 работает на том же developer host и не является независимым failure domain. Runner остаётся закрыт для публичного недоверенного кода до M3. |

### Измеренный host-профиль (не профиль кластера)

Снято 27.10.2026 на Windows 10 Pro, локально, без обращения к Kubernetes и без чтения env-файлов:

- CPU: 16 logical CPU; Node сообщает модель `AMD Ryzen 7 7700 8-Core Processor`.
- RAM: 16,212,979,712 bytes total (около 15.1 GiB); на момент запроса Node сообщил 1,978,093,568 bytes свободно (около 1.84 GiB). Свободная память моментальна и не является allocatable для workload.
- Том C:: 511,987,150,848 bytes (около 476.9 GiB), свободно 93,348,880,384 bytes (около 86.9 GiB). Это размер/свободное место тома, не размер SSD. Тип, модель и IOPS устройства неизвестны.
- Версии локальных инструментов: Node v24.18.0, npm 11.16.0, Vite 8.1.3. `.venv` и `frontend/node_modules` присутствуют. Команды `docker`, `k3d`, `kubectl` не найдены в PATH.
- `Get-CimInstance Win32_OperatingSystem`, `Get-PhysicalDisk` и `Get-Volume` заблокированы отказом в доступе; поэтому сведения об устройстве/томах неполны. Metrics-server, context/namespace и версии K3s/Kubernetes неприменимы/не установлены для этого замера; наличие другого удалённого кластера не проверялось.

Снятие host-метрик: Node `os.cpus().length`, `os.totalmem()`, `os.freemem()` и `fs.statfsSync('C:/')`; прямой результат — соответственно 16, 16,212,979,712, 1,978,093,568, 511,987,150,848 и 93,348,880,384 bytes. Это моментальный снимок процесса/ОС, не нагрузочный профиль.

## Startup, latency и профиль нагрузки

| Объект | Профиль/метод | Результат |
| --- | --- | --- |
| Core startup и HTTP latency | Два fresh-process запуска на Windows, один uvicorn worker, новая абсолютная SQLite DB, dispatcher off; локальные sequential HTTP requests из PowerShell. | Startup process→first HTTP 200: **1.696 с** и **1.756 с** (внутренний script→ASGI ready: 1.450 и 1.428 с). 30 samples: `/openapi.json` **200×30**, p50/p95 **1.24/6.47 мс**; `/user/me` без cookie **401×30**, p50/p95 **1.32/4.28 мс**. В отдельном повторе `/user/me`: p50/p95 **1.72/4.72 мс**. |
| Frontend startup/latency | Vite 8.1.3 programmatic `createServer`, `configFile:false`, пустой `envDir`, React plugin 6.0.3, cache внутри temp output; только loopback. | Process→first HTTP 200: **2.212 с**; 30 samples: `/` **200×30**, p50/p95 **2.98/70.31 мс**; `/src/main.tsx` **200×30**, p50/p95 **0.91/2.16 мс**. Node RSS при ready: **75,722,752 bytes**. |
| Реалистичная нагрузка | Профиль и измерения отсутствуют. Цель ADR для M3 — realistic 1000 active VUs на текущем курсе с зафиксированными сценарием, длительностью, latency/error/saturation, ресурсами и целостностью данных. | Это цель будущего измерения, не заявленная ёмкость и не порог текущего локального профиля. |

Метод и ограничения этого замера: Core startup — от `Start-Process` до первого локального HTTP 200, отдельно записано время внутри Python до `uvicorn.Server.started`; схема новой SQLite создаётся через импортный `ensure_schema()`. Guard заменил `dotenv.load_dotenv` до импорта приложения функцией, которая только записывает аргументы и возвращает `False`; оригинальный загрузчик не вызывался. В дочернем процессе дополнительно установлены `PYTHON_DOTENV_DISABLED=1`, абсолютный `DATABASE_URL` под уникальным `output` и `PYMENTOR_LOCAL_NOTIFICATIONS=0`. Из guard log подтверждён перехват вызова для `backend/.env`. Обе DB после smoke имели 10 таблиц и 0 строк. `/user/me` — без cookie, ожидаемый 401; запрос не создавал пользователя или сессию. Vite startup — запуск Node до первого HTTP 200; сервер поднят API `createServer`, `configFile:false`, `root=frontend`, новый пустой `envDir`, `@vitejs/plugin-react`, отдельный temp cache. Все HTTP вызовы loopback, concurrency 1, 30 измерений на маршрут. `Invoke-WebRequest` включает overhead Windows PowerShell; `/` имел единичные outliers до 117.76 мс, поэтому p95 не трактовать как браузерную производительность. Это один host, без кластера/нагрузки и без сравнимого production build; замеры описательные, без порогов SLA. На host в момент Vite замера: 16 logical CPU, RAM total 16,212,979,712 bytes, free 1,762,508,800 bytes; Core process RSS/CPU надёжно снять не удалось. SSD type/IOPS и allocatable Kubernetes неизвестны.

## Предварительный бюджет ресурсов

Численные requests/limits и capacity не назначены: startup/latency доступны для описанного локального профиля, но нет корректных per-process Core CPU/RAM, работающего целевого кластера или конкурентного load-профиля. Таблица — перечень того, что нужно учитывать и измерить; она не резервирует CPU/RAM и не является sizing.

| Нагрузка | Предварительное размещение/учёт | Числовой бюджет |
| --- | --- | --- |
| Core | M1 один endpoint/writer; учитывать рабочий процесс, синхронный DB access, bcrypt и пики запросов. | TBD после startup и workload измерений. |
| Frontend | Отдельный статический frontend; для dev-server показатели не переносятся на production build/serving. | TBD. |
| PostgreSQL | Только M2; локальная единственная DB, учесть shared buffers/cache, connections, WAL и диск. Не включать одновременно с M1 SQLite как две активные базы. | TBD после M2 профиля и проверки восстановления. |
| Redis | Не вводить как обязательную нагрузку: inventory не подтверждает активную зависимость Core от Redis. Если отдельная проверка подтвердит необходимость — измерить и добавить в бюджет отдельным изменением. | Не выделен; TBD только при подтверждённой роли. |
| Runner | До M3 не считать безопасным для публичного запуска недоверенного кода. В M1/M2 локально учитывать ресурсы временного legacy Runner и один допущенный запуск; в M3 учитывать отдельные ограниченные workers и конкурентность. | TBD после измерений и определения лимитов. |
| Резерв узла | Оставлять незанятый резерв под системные/K3s компоненты, пики и восстановление; вычислить как разницу измеренной allocatable capacity и суммы фактических нагрузок после baseline. | Неизвестен до allocatable/metrics и измерений. |

Не суммировать лимиты/requests как подтверждённое потребление и не считать свободную RAM host-снимка доступной ёмкостью кластера. В доступном окружении cluster allocatable, pod requests/limits и metrics-server не проверялись.

## Конфигурация, overlays и порты

Рекомендуемая раскладка источников для следующей задачи реализации (манифесты здесь не создавались):

```text
deploy/k8s/
  base/                    # общие workload/service/probes; версии image задаются digest
  overlays/local-single/   # k3d, одна server node
  overlays/local-multinode/# k3d: server 1 + agents 2
  overlays/native-linux-m1/# отдельный native Linux VM K3s smoke
  overlays/production-single-vps/ # будущий один VPS; только после C3.6.6 GO
  overlays/future-multi-vps/      # будущее расширение, не доказательство HA
```

Overlays задают только параметры среды и ссылки на immutable image digest `repository@sha256:…`; mutable tags (`latest`, `dev`, `stable`) не являются релизной идентичностью. Rendered diff и выбранный overlay проверять до применения. GitOps/Helm/Kustomize owner пока не установлен; перед deployment выбрать один канонический desired-state источник.

Предварительная локальная схема портов, подлежащая сверке с реальными manifest/host bindings: ingress HTTP `80`, HTTPS `443`; frontend Vite dev `5173` и Core direct/dev `8001` — только loopback и только при локальной отладке, не публиковать как ingress; PostgreSQL `5432` и Redis `6379` — только внутри cluster network, если M2/подтверждённая интеграция включены. Из host наружу не публиковать DB/cache/Runner. Фактические занятые порты и конфликты не проверялись.

## Backup, gates и ограничения выпуска

- M1: определить volume path/permissions для одного SQLite writer, сделать backup только новой синтетической БД и пройти restore drill на отдельной непроизводственной копии. Исходники подтверждают SQLite backup API, но существование актуального backup/restore процесса — нет.
- **Offsite backup target — неподтверждённое требование.** Провайдер, credentials, retention, шифрование, RPO/RTO, доступ и успешный restore не установлены. Не отправлять данные/backup наружу до отдельного утверждения target и проверки защиты.
- M2 требует backup/restore проверки PostgreSQL и migration/cutover recovery по ADR. Local-path и копия на том же host не являются offsite копией.
- **Production запрещён до прохождения M3 и отдельного production gate/разрешения.** M3 включает проверенную sandbox isolation/лимиты, durable run state и реалистичный 1000 active VUs профиль с проверкой данных согласно ADR. Ни локальный k3d, ни native VM сами по себе не дают разрешения production.

## Команды и результаты этого задания

Выполнено:

```powershell
node -e "const os=require('os'); const fs=require('fs'); const c=os.cpus(); console.log(JSON.stringify({logicalCpu:c.length,totalRamBytes:os.totalmem(),freeRamBytes:os.freemem(),rootStat:fs.statfsSync('C:/').bsize*fs.statfsSync('C:/').blocks,rootFreeBytes:fs.statfsSync('C:/').bsize*fs.statfsSync('C:/').bfree}))"
node --version
npm --version
Get-Command docker,k3d,kubectl -ErrorAction SilentlyContinue
```

Результат: host-факты выше; node `v24.18.0`, npm `11.16.0`; Kubernetes/k3d/Container runtime commands не найдены.

Core запускался временным скриптом из каталога `output` с Python isolated mode (`-I`), до импорта патчил dotenv, создавал новую пустую SQLite схему и поднимал Uvicorn на случайном `127.0.0.1` порту. Вызовы: `GET /openapi.json` и `GET /user/me` без cookie; по 30 sequential samples. Прямой CLI вызов Vite с `--envDir` завершился ошибкой `Unknown option`; успешный повтор выполнен программно: `createServer({configFile:false, root: frontend, envDir: <new-empty-dir>, cacheDir: <output-temp>, plugins:[react()], server:{host:"127.0.0.1", port:<free-loopback-port>, strictPort:true}})`. Измерялись `GET /` и `GET /src/main.tsx`, 30 samples каждый.

Результаты: 2 Core startups 1.696/1.756 с; Core API p50/p95 для `/openapi.json` 1.24/6.47 мс и `/user/me` 1.32/4.28 мс (отдельный повтор `/user/me` 1.72/4.72 мс). Vite process→HTTP 200 2.212 с; `/` 2.98/70.31 мс и `/src/main.tsx` 0.91/2.16 мс. Temp базы, скрипты, логи и Vite cache удалены после записи этих результатов.

Кластерные команды не выполнялись. Не читались backend/frontend `.env`, credentials, настроенные или пользовательские БД, Redis и Telegram; Core dispatcher был выключен. `frontend/dist` не использовался и не редактировался. Vite получил пустой `envDir`, config file был отключён, inherited `VITE_*` переменные удалены только в дочернем измерительном процессе. Нет внешних адресов в измерении.

