# Stage 3: профиль `pymentor_lesson_worker`

**STATUS: CONFIG_CREATED; фактическая регистрация и запуск агента НЕ ПРОВЕРЕНЫ.**

## Файлы и решение

- `.codex/agents/pymentor-lesson-worker.toml` — новый узкий project-scoped standalone-профиль. `name = "pymentor_lesson_worker"`, `model = "chatgpt-web/gpt-6-sol"`, `model_reasoning_effort = "high"`, `description` и `developer_instructions` заданы явно.
- `docs/stage-system-setup/REPORT_LESSON_AGENT.md` — этот отчёт. Глобальный `.codex/config.toml`, общие роли `materials`, `check`, skill `methodic-run`, уроки и методички не изменялись.

Профиль принимает **одно** занятие stage 3, его точную идентичность, принятый MD и паспорт только для чтения, состояние M1–M5, разрешённые пути и права на общий файл. Начинает с первого неполного прохода. M1/M2 делают полный черновик без квот; M3 редактирует и считает видимую теорию; M4 проверяет учебный ритм, интерактивы, connected-группы и доступность; M5 требует предметный чек-лист и четыре актуальных PASS: backend, frontend, реальная выдача, открытая страница/runner. Отдельно запрещены утечки решений/скрытых тестов и ложное COMPLETE при недоступном runtime. Общие файлы изменяются только после явной передачи владения; иначе возвращается точная дельта интегратору. Нет рекурсивного делегирования и запуска других стадий.

## Источники

- Четыре обязательных адресата загрузки из корня проекта: `docs/make les stage/AGENTS.md`, `docs/make les stage/BATCH_WORKFLOW.md`, `docs/make les stage/3 stage/AGENTS.md`, `docs/make les stage/3 stage/README.md`. Дополнительные проверенные источники: `docs/make les stage/RUN_TEMPLATE.md` и `docs/make les stage/2 stage/{AGENTS.md,README.md}`.
- Предметные M1–M5: `docs/make les stage/3 stage/01_THEORY_DRAFT.md` … `05_LESSON_ACCEPTANCE.md` (структура и требования M5); профиль предписывает исполнителю **полностью** прочитать текущий M-файл непосредственно перед каждым проходом.
- Сверены существующие `C:/Users/Unik/.codex/agents/specialized/materials.toml` и `C:/Users/Unik/.codex/skills/methodic-run/SKILL.md`; новые настройки их не заменяют.
- Официальная документация OpenAI: [Custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents), прочитана 25.10.2026. Подтверждены standalone TOML в `.codex/agents/`, обязательные `name`/`description`/`developer_instructions`, поддержка `model` и `model_reasoning_effort`.

## Проверка и ограничения

- **ACTUALLY_RUN:** `python` + `tomllib.loads`, проверены пять обязательных/заданных полей, точное имя/маршрут/high, присутствие M1–M5 и статусов. Результат: `TOML_PARSE_PASS`. Проверены все четыре root-relative адресата: каждый существует как файл и дословно указан в `developer_instructions` (`4/4 PASS`).
- **Итоговый SHA-256 TOML:** `19fbf13630f2ffc120ca7fdf79793385a63921bfe30f64e306fe71de655393ac`.
- **NOT_RUN:** реальные занятия, API/backend/frontend/browser/runner, запуск агента и подтверждение принятой модельной настройки: задача ограничена созданием профиля.
- Будущие eval: полное занятие; восстановление с M3; конкурирующая запись в `manual.py`; отсутствующий диапазон паспорта; недоступная API/страница при успешной сборке. **NOT_RUN**.

Риск загрузки: наличие TOML на диске не подтверждает его появление в живом каталоге делегирования и не гарантирует доступность `chatgpt-web/gpt-6-sol`/High для текущего клиента. Оркестратор проверяет фактический каталог и spawn; при отсутствии регистрации передаёт `developer_instructions` содержимым через поддерживаемый механизм, явно выставляя Web/High, и не называет это спавном зарегистрированного профиля.
