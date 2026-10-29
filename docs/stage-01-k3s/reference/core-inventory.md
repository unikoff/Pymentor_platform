# C1.1.1 — инвентаризация Core и frontend

Срез: 27.10.2026, ветка `content-refactor`, HEAD `a0708faf`; описано рабочее дерево с многочисленными незакоммиченными изменениями, а не чистый HEAD или production. Пути в карточках к `backend/learning` и `backend/DataBase` устарели для этого дерева. Проверка исходников не подтверждает состояние развёрнутой системы.

## Точки входа и маршруты

- [backend/main.py](../../../backend/main.py) создаёт FastAPI, вызывает `ensure_schema` при импорте, подключает `/admin`, `/user`, `/learning`, раздаёт frontend; прямой запуск — Uvicorn на порту 8001.
- [backend/core/web.py](../../../backend/core/web.py) задаёт lifespan, локальный dispatcher уведомлений и SPA fallback. [backend/core/config.py](../../../backend/core/config.py) задаёт пути, включая `frontend/dist` и загрузку окружения. При старте возможны изменения схемы и запуск фонового процесса: не использовать боевую БД для smoke.
- [frontend/src/main.tsx](../../../frontend/src/main.tsx), [frontend/package.json](../../../frontend/package.json), [frontend/config/vite.config.ts](../../../frontend/config/vite.config.ts): React/Vite, `npm run build`, dev proxy к backend. [frontend/src/shared/api/client.ts](../../../frontend/src/shared/api/client.ts) формирует клиентские запросы. В `frontend/dist` есть незакоммиченные файлы; их соответствие текущим исходникам не проверено.
- Роутеры: [accounts](../../../backend/routers/accounts/router.py), [bookings](../../../backend/routers/bookings/router.py), [courses](../../../backend/routers/courses/router.py), [admin](../../../backend/routers/admin/router.py). Конкретные ответы и сценарии предстоит зафиксировать в C1.1.2.
- Telegram и диспетчер уведомлений: [backend/notifications/telegram.py](../../../backend/notifications/telegram.py), [backend/notifications/delivery.py](../../../backend/notifications/delivery.py). Имена переменных конфигурации видны в исходнике; значения секретов в этот документ не включаются.

## Данные и риски перехода

P0 — блокирует безопасный публичный выпуск; P1 — значимый риск корректности или доступности; P2 — неопределённость/эксплуатационный риск. Это оценка по исходникам, не результат эксплуатации.

| Компонент | Состояние и evidence | Риск | Дальнейшая задача |
| --- | --- | --- | --- |
| SQLite / SQLAlchemy | [db/engine.py](../../../backend/db/engine.py): синхронный engine, по умолчанию `backend/test.db`; `DATABASE_URL` может переопределить путь. Фактическая конфигурация запуска не подтверждена. | P1: потеря или расхождение данных при переносе; один writer в M1. | C1.3, C2.2–C2.3 |
| Пользователи и сессии | [db/models.py](../../../backend/db/models.py): `users`, `sessions`, хеши паролей, подписка. [db/session.py](../../../backend/db/session.py) содержит Redis API; вызовы этого модуля в проверенных backend-модулях не найдены, активное использование не подтверждено. | P1: сохранить ID, хеши и поведение сессий. | C1.1.2, C2.3 |
| Прогресс и попытки | [db/models.py](../../../backend/db/models.py) и [courses/progress.py](../../../backend/routers/courses/progress.py): отдельные записи прогресса урока/задачи. Отдельная таблица истории попыток в проверенных моделях не обнаружена; отсутствие во всей системе не доказано. | P1: уникальность, совместимость ревизий и гонки обновлений. | C1.1.2, C2.3, C2.5 |
| Контент и ID | [backend/content](../../../backend/content), [frontend/src/lessons](../../../frontend/src/lessons) и исходные материалы находятся в рабочем дереве. | P1: не менять public ID и связи при переносе. | C1.1.2, C2.5 |
| Runner | [courses/service.py](../../../backend/routers/courses/service.py), [runner/python.py](../../../backend/content/practice/runner/python.py), [runner/runtime.py](../../../backend/content/practice/runner/runtime.py): дочерний Python получает копию окружения процесса, удаляется только `PYTHONPATH`; фильтрация и `-I` не доказывают security boundary. | **P0:** доступ к окружению/хосту и сети не изолирован доказанной песочницей. | C1.1.5, C3.2 |
| Ресурсы Runner | [runtime.py](../../../backend/content/practice/runner/runtime.py) ограничивает время и вывод, на Linux применяет `RLIMIT_AS` и `RLIMIT_CPU`; на других ОС эти OS-лимиты отсутствуют. [executor.py](../../../backend/content/practice/runner/executor.py) выносит запуск в один поток и применяет файловую блокировку. | P1: ограничения не обеспечивают изоляцию; файловая блокировка не является общей квотой независимых узлов. | C1.1.5, C3.1–C3.2 |
| Блокирующие операции | SQLAlchemy engine синхронный, bcrypt выполняется синхронно в [models.py](../../../backend/db/models.py); [telegram.py](../../../backend/notifications/telegram.py) использует `urlopen`. Путь практики выносит подготовку и выполнение из event loop в [service.py](../../../backend/routers/courses/service.py). Не все вызывающие контексты проверены. | P1: возможные задержки event loop требуют трассировки и измерений, а не предположения о каждом вызове. | C2.4 |
| Локальные файлы | Runner создаёт временный каталог, использует `backend/.runner.lock`; dispatcher использует локальную блокировку. | P2: права и общие тома влияют на работу и восстановление. | C1.3, C1.4 |
| Backup | [delivery.py](../../../backend/notifications/delivery.py) содержит SQLite backup API из read-only источника с эксклюзивным созданием назначения; [worker.py](../../../backend/notifications/worker.py) предоставляет `--backup-db`. Наличие копий и успешное восстановление не проверены. | P1: механизм сам по себе не доказывает регулярный backup или restore. | C2.3, C3.4 |

## Воспроизведение и ограничения

Инвентаризация проверяется чтением файлов и `git status --short`; при большом количестве локальных изменений ограничивать вывод и не удалять файлы пользователя. Ниже приведены фактически выполненные read-only проверки этого документа и границы того, что ими подтверждено.

### Критические пути и синхронизация

- Запуск приложения проходит через импорт [main.py](../../../backend/main.py): `ensure_schema()` исполняется при импорте приложения, до обслуживания запросов. Lifespan в [web.py](../../../backend/core/web.py) по умолчанию запускает локальный dispatcher уведомлений (`PYMENTOR_LOCAL_NOTIFICATIONS=0|false|off` отключает его); остановка выполняется через `asyncio.to_thread`. Поэтому импорт приложения/ASGI smoke не считается безопасной проверкой без изолированной тестовой БД и контроля фоновых действий.
- SQLite engine задаётся в [engine.py](../../../backend/db/engine.py). По умолчанию файл `backend/test.db`; `DATABASE_URL`, кроме относительного `sqlite:///./...`, переопределяет адрес. Этот fallback специально игнорирует относительный SQLite URL, так что фактическая БД определяется окружением и запуском, а не одной лишь константой по умолчанию.
- Runner: HTTP-путь практики в [courses/service.py](../../../backend/routers/courses/service.py) вызывает RunnerExecutor. Внутри процесса — `BoundedSemaphore(1)` и один worker thread; между процессами — файловый lock `backend/.runner.lock` (Windows `msvcrt`, POSIX `flock`). Lock-файл нельзя удалять при работе: это может снять координацию между разными inode. Ожидающий/занятый runner не даёт общей квоты между хостами/томами. Дочерний процесс имеет timeout и ограничения вывода; CPU/AS limits устанавливаются только на Linux. Это ограничение ресурсов, не доказанная security sandbox.
- Уведомления: worker использует отдельный `backend/.notification-worker.lock` для исключения параллельных cron-процессов на общей файловой системе. SQLite claim использует `BEGIN IMMEDIATE`; на иных диалектах запрос блокирует строку через `FOR UPDATE SKIP LOCKED`. Есть lease/token для повторного захвата просроченной обработки и порядок незавершённых событий на один слот. Это исходный кодовый контракт; межхостовая работа конкретного тома и фактическая доставка не проверялись.

### Данные, backup и приоритеты

- Критичные сохраняемые данные по проверенным моделям: учетные записи/сессии и подписка, бронирования, прогресс уроков/задач, очередь уведомлений и её delivery state. Runner временные каталоги — эфемерные. Каталог материалов и `frontend/src/lessons` — исходники контента; `frontend/dist` — генерируемый артефакт и уже содержит чужие локальные изменения.
- `--backup-db` в [worker.py](../../../backend/notifications/worker.py) вызывает SQLite Online Backup API из read-only источника, требует file-based SQLite и эксклюзивно создаёт новый destination (существующий файл не перезаписывает). Это подтверждает реализацию механизма, но не наличие расписания, внешней копии, retention, проверенной целостности конкретной копии или restore drill. Backup может содержать персональные данные; проверка здесь не создавала копий и не читала базу.
- **P0:** запуск недоверенного пользовательского кода без подтверждённой изоляции ОС/сети/окружения — препятствие безопасному публичному выпуску; исходные проверки лишь выявляют ограничения.
- **P1:** определить активный URL БД и владение миграциями; обеспечить согласованный backup и регулярно проверяемый restore; сохранить идентификаторы и связи пользователей/бронирований/прогресса; измерить влияние синхронных DB/bcrypt/network операций на event loop; подтвердить поведение файловых lock на целевом deployment storage.
- **P2:** проверить права и очистку временных файлов, ротацию локального worker log, межпроцессную работу на поддерживаемых ОС и актуальность `frontend/dist`. Приоритеты — оценка по последствиям и непроверенным границам, не инциденты и не результаты эксплуатации.

### Команды и результаты

Фактически выполнены в checkout на 27.10.2026:

| Команда/проверка | Результат | Что доказывает / чего не доказывает |
| --- | --- | --- |
| `git status --short -- docs/core-inventory.md` | `?? docs/core-inventory.md` до редактирования: файл уже был новым незакоммиченным пользовательским файлом. | Документ не принадлежал чистому HEAD; его содержимое сохранено и дополнено. |
| `Get-Content` целевых backend-файлов (`main.py`, `core/web.py`, `core/config.py`, `db/engine.py`, `notifications/delivery.py`, `notifications/worker.py`, `runner/executor.py`, `runner/runtime.py`, `routers/courses/service.py`) и `frontend/package.json` | Прочитаны; описанные выше функции и команды сопоставлены с исходниками. | Проверяет наличие реализации в checkout, не её runtime-поведение/production-конфигурацию. |
| Проверка списка AGENTS/WORKFLOW | В корне `WORKFLOW.md` отсутствует; обнаружены stage-specific AGENTS, но C1.1.1 не является stage 1/2/3 заданием. | Общий WORKFLOW-маршрут недоступен и не применялся; scope остался документальным. |

Безопасные воспроизводимые команды для будущей проверки, не запускавшиеся в этой задаче:

```powershell
git status --short -- docs/stage-01-k3s/reference/core-inventory.md
git diff --check -- docs/stage-01-k3s/reference/core-inventory.md
git diff -- docs/stage-01-k3s/reference/core-inventory.md
```

`python -m pytest backend/tests` не запускать до выяснения fixture/DB конфигурации. `npm --prefix frontend run build` запускает TypeScript и Vite, но перезаписывает `frontend/dist`, где уже есть многочисленные незакоммиченные файлы; без отдельной изоляции сборка не безопасна. Импорт `backend/main.py`, worker `--check/--stats` и любые команды backup также не запускались: они могут инициализировать схему/worker, обращаться к настроенному Redis/Telegram или читать/создавать пользовательские данные.

Доступ к отдельным временным каталогам при рекурсивном поиске возвращал access denied; полный статус репозитория также выдавал предупреждения доступа к runtime/temp каталогам. Инвентаризация ограничена доступными исходниками. Реальный путь активной БД, содержимое базы и backup, фактические переменные окружения, работа внешних сервисов, тесты и развёрнутая версия не проверены. Нельзя объявлять Runner безопасным или считать migration/restore доказанными на основании этого документа.
