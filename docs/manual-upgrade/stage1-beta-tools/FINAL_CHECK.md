# Независимый FINAL_CHECK — Stage 1 beta (25.10.2026)

**VERDICT: CHANGES_REQUIRED** — один адресный дефект условия готовности новой главы; остальная статическая проверка пройдена. Это заключение по файлам и desk-сценариям, а не подтверждение работающей Web-оркестрации.

## Требования и свидетельства

| Проверка | Статус | Результат |
| --- | --- | --- |
| Изолированный Stage 1 skill, декларация и два профиля | VERIFIED | Skill и `openai.yaml` существуют; оба TOML читаются `tomllib`, `model=chatgpt-web/gpt-6-sol`, `model_reasoning_effort=high`. Stage 2/3 исключены из beta-маршрута. |
| Маршрут и владельцы | VERIFIED | C1–C4 ×1 → B1–B4 ×4 по четырём **глобальным** блокам → F1–F3 ×1; один активный писатель на файл; один RUN; общий лимит 5 Web/browser turns, включая параллельные задачи. |
| Предметная приёмка | VERIFIED | COURSE 1/1, BLOCK 4/4, пять основных дней на блок + обязательные подзанятия, N/N паспортов, семь полей, A→B, три внутренних и два внешних стыка, актуальные версии и PASS перед `STAGE_COMPLETE`. |
| Маршруты идентичности существующих уроков | VERIFIED | В `backend/content/catalog.py` используется `_stable_lesson_id(relative_path)`; `backend/content/identity.py` применяет `_lesson_identity_source()` и алиасы перед хешированием канонического source path. ID независим от позиции, но **зависит от пути**; README/AGENTS/RUN отражают это и запрещают скрытую миграцию routes/progress. |
| Новая глава **без назначенных public ID** | **MISSING** | `02_BLOCK_CONCEPT.md` допускает «ID требует назначения по действующей схеме»; `03_CHAPTER_ACCEPTANCE.md` допускает «ID требует назначения». README/AGENTS/RUN при неизвестном ID предписывают универсальный `BETA_GAP: LESSON_IDENTITY_UNVERIFIED`; RUN обещает Stage 2 вход «со ... ID». Нет однозначной гарантии, что отсутствие будущего ID у *нового* занятия не блокирует концептуальный PASS. |
| Ссылки и форматы | VERIFIED | Независимо проверены ссылки в Skill/README/AGENTS/RUN: отсутствующих локальных targets нет; оба TOML синтаксически валидны. |
| Реальная регистрация ролей, Web High, лимит слотов и полный пилот | NOT_TESTED | Наличие TOML не доказывает регистрацию runtime; native role inventory ранее не подтвердил новые роли. Полноценный запуск C/B/F и расход токенов не воспроизводились. Авторский YAML-валидатор не завершился из-за отсутствия Python `yaml`; это не доказанный дефект `openai.yaml`. |

## Независимые raw-сценарии (desk review, не исполнение)

1. Глава 2, глобальные блоки **5–8**: должен включаться Stage 1, C×1/B×4/F×1, с передачей в PLAN без автозапуска Stage 2 — **VERIFIED по документам**.
2. «Исправь README и профили, концепты не нужны»: редакторская задача без C/B/F — **VERIFIED по области триггеров**.
3. «Сделай Stage 2, паспорта готовы»: исключение beta Skill — **VERIFIED**.
4. Возобновление при активном BLOCK_6 и изменённом COURSE: тот же RUN, без двойного назначения, точечная инвалидация зависимых подтверждений — **VERIFIED по инструкции**.
5. Чистое переименование и разбиение «03» → «03.1–03.3»: прежние ID/path/прогресс сохраняются, новые ID не выдумываются; при изменении состава повторная проверка N, связей и prerequisites — **VERIFIED по методикам/документации**.
6. **Новая глава без ещё выделенных public ID и без перенумерации существующих уроков:** методики допускают концептуальное завершение при явной отложенной аллокации, README/AGENTS/RUN неоднозначны — **MISSING, возможный ложный gate**.

## Точное исправление для владельцев (источники рецензент не менял)

В `docs/make les stage/1 stage/{README.md,AGENTS.md,RUN_TEMPLATE.md}` разграничить: **(а)** опубликованное/существующее занятие — неизвестный `lesson_id` или identity source, нарушенные прежние ссылки либо угроза прогрессу являются блокирующим `BETA_GAP`; **(б)** новое проектируемое занятие, для которого public ID ещё не выдан, — записывать `ID требует назначения по действующей схеме`, назначенного владельца и этап реализации, но **не** ставить `FAIL/BLOCKED/LESSON_IDENTITY_UNVERIFIED` и **не** блокировать `STAGE_COMPLETE`, если N/N, семь полей, граф зависимостей и остальные критерии приняты. Поля карты для нового урока должны поддерживать `пока не назначен`, без фиктивного ID/source path. Уточнить Stage 2 handoff в RUN: существующие ID передаются, новые — с пометкой о последующем назначении. Синхронизировать формулировки в Skill/профилях только при обнаруженном конфликте. Изменение backend identity, маршрутов, алиасов или миграций **вне scope**.

## SHA256 проверенных кандидатов

| Файл | SHA256 |
| --- | --- |
| `.agents/skills/pymentor-stage1-beta/SKILL.md` | `D538008809D569ADF26679DAB95D1B469FEC2036F690A1B768C2E8D457C6FDF6` |
| `.agents/skills/pymentor-stage1-beta/agents/openai.yaml` | `0FCC56F4139208EA44A591204FBDC822BC86F59D2BA059448DC8302FDE56508B` |
| `.codex/agents/pymentor-chapter-worker.toml` | `776283728AA193673408ED9568C050E1A01E05D9883A6DAD92CC5D7D4EE50E3B` |
| `.codex/agents/pymentor-block-worker.toml` | `1B35D6ED51271D9D6823531A8D4F313C4725966094DAD70CACEFE937E34EC48C` |
| `docs/make les stage/1 stage/README.md` | `463CB6112063690DD0E31026BF9FD7CB0B3648DAD3CEF7BED849BBB93699BDD2` |
| `docs/make les stage/1 stage/AGENTS.md` | `DD1406887C5E2C3B265F5AB673D6DF44C913D4F5D04838B68B2D9C9607929C80` |
| `docs/make les stage/1 stage/RUN_TEMPLATE.md` | `B18BD1B61EAA70EAD1E403B24C37C2E0B5DF15D794970647CC3B2D3752402B56` |
| `docs/make les stage/1 stage/01_CHAPTER_CONCEPT.md` | `E387A949725CF39A9FF3C129923B967038F595AC3817E953A7D0FFE161F59773` |
| `docs/make les stage/1 stage/02_BLOCK_CONCEPT.md` | `0BF7230366672E2BDE486334F0B12FAB83EE7C04E3269DB9B356E2A9C7DE2E18` |
| `docs/make les stage/1 stage/03_CHAPTER_ACCEPTANCE.md` | `46F65A3537472F4A9D9FA126D3EB8DDEDB621337107F98C7D57A6A29079A11AB` |
| `docs/manual-upgrade/stage1-beta-tools/TOOLS_REPORT.md` | `BB40A42512E0EC2DCF82B1F16C269D2E251E6A8F3F76C354D129C43EB745F82C` |
| `docs/manual-upgrade/stage1-beta-tools/DOCS_REPORT.md` | `DF1ED0FFF3DF1C23C091C114BB51BDA1E95901CE764016C1CCD8205A3E1CC764` |

**Границы проверки:** исходники beta/методик и материалы COURSE/BLOCK не изменялись; реальная Stage 1 генерация, регистрация native ролей и Web High не подтверждены.
