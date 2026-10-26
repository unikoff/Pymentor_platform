# CORE — infrastructure stage 2/3, 2026-10-26

**STATUS: COMPLETE** — выделенный scope инфраструктуры обновлён. Это подготовка контрактов/диспетчеризации; реальных занятий, native spawn и M5-прогонов данный worker не запускал.

## EXECUTION_TABLE

| T-ID | Owner | Dependencies | State | Artifact | Evidence |
| --- | --- | --- | --- | --- | --- |
| C1 | CORE | AUDIT IMPACT (6), effective policy от root | VERIFIED | `.agents/skills/pymentor-stage-batch/SKILL.md`, `docs/make les stage/AGENTS.md`, `BATCH_WORKFLOW.md` | Один W1 preflight с N/stable ID, точными revision/redirect, A/B, диапазонами, write leases; native Web-only очереди, idempotent recovery, исключительная root API/catalog repair. |
| C2 | CORE | C1 | VERIFIED | `docs/make les stage/RUN_TEMPLATE.md` | Запись lesson→worker→phase→status→last artifact/revision; W1-R, native terminal, REWORK/KEEP, M5 матрица из пяти наблюдений и env repro. |
| C3 | CORE | C1 | VERIFIED | `.codex/agents/pymentor-plan-worker.toml`, `pymentor-lesson-worker.toml` | Автономные P1–P4/M1–M5; содержательные before/after и KEEP; нет жёсткого лимита 150 слов; stage 3: backend/frontend/API/page+adaptive/manual+runner. |
| C4 | CORE | C1, зарегистрированные native roles | VERIFIED | `scripts/build_dispatch.py` | Компиляция Python и генерация native `{agent_type,message}` для обоих stage с локальным full/Web-only snapshot policy; optional skill и source/revision/recovery-инструкции. |

## INTEGRATION / TESTS

- `scripts/build_dispatch.py`: Python `compile` **PASS**; in-memory `build_payload` для stage 2 и 3 с `docs/stage-system-setup/upgrade-20261026/policy-override.json` **PASS**; optional worker skill **PASS**.
- Оба worker TOML: `tomllib` **PASS**, модель `chatgpt-web/gpt-6-sol`, effort `high`, native role names и W1/revision-контракт подтверждены содержимым файлов.
- Skill frontmatter, отсутствие конечных пробелов и **15** относительных Markdown-ссылок: адресные проверки **PASS**.
- Перед изменением helper Serena и `skill-creator/SKILL.md` были прочитаны в предыдущем контексте. Штатный `quick_validate.py` skill-creator не исполнился из-за отсутствия `yaml` (PyYAML); выполнены независимые проверки frontmatter и ссылок.
- Все изменения ограничены файлами CORE; чужие изменения, stage 2/3 methodics и глобальные policies не редактировались. Общая dirty worktree сохранена, коммит не создавался.

## OPEN_ISSUES / Coordinator next action

- **Root Coordinator:** проверить конечное состояние native очередей/actual models/slots при реальном запуске, однократно принять N/N и вернуть подтверждённый session override к `{}` по завершении всей задачи. Этот worker не менял override и не подтверждает live state только по содержимому snapshot.
- **Root/владелец среды при реальном M5:** собрать команды, исходную revision, результаты и exact repro для browser/runner. Если недоступны, оставить `STAGE_INCOMPLETE`; повторный идентичный bootstrap запрещён. Инфраструктурный этап не может дать runtime PASS без запуска занятий.
- **Инструментальный validator (опционально):** для повторного запуска штатного `quick_validate.py` требуется доступный PyYAML; это не блокирует проверенные CORE-контракты.

## Итог адресной интеграционной доработки

Предыдущие проверки с `policy-override.json` относятся к первой версии helper. Финальная версия принимает именно разрешённую effective policy (`pool` и optional `effective` envelope), а не неразрешённый session override `models[]`. Оба формата нельзя смешивать.

После возврата конкретных дефектов автор сохранил исправления helper, терминов CREATE/REWORK/RESUME, observed identity и четырёх PASS M5. Последующий вызов завершился `Selected model is at capacity`; завершение второй попытки не заявляется успешным. Root проверил сохранённые артефакты без подмены модели: `python docs/stage-system-setup/upgrade-20261026/test_core_dispatch.py` — 3 теста PASS, включая позитивные/негативные subcases и CLI file-to-file для stage 2/3. Пять подробных наблюдений — детализация четырёх уровней M5, обе части уровня 4 обязательны. Spawn ID/nickname не объявляются телеметрией модели.
