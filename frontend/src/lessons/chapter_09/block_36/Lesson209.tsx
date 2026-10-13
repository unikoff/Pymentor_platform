import { CheckCircle2, GitBranch } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson209({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Финальный test suite и quality gate"}
        intro={"Соберём финальную тестовую стратегию вокруг рисков релиза: auth, permissions, transactions, migrations, cache, Redis failure, external mocks и end-to-end LMS flow. Coverage останется диагностическим сигналом, а release будет блокироваться нарушением ключевого контракта."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "risk-based test matrix" },
          { icon: <GitBranch size={14} />, label: "clean DB · Redis · CI" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"Аудит назвал критичные границы. Теперь самые важные findings и пользовательские сценарии должны превратиться в автоматический quality gate."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Цель не 100% coverage и не тестирование каждой внутренней строки. Тест защищает наблюдаемое правило, риск или интеграционную границу."}
      </Callout>

      <Section number="01" title={"От множества тестов к доказательству рисков"}>
        <Lead>
          {"Соберём финальную тестовую стратегию вокруг рисков релиза: auth, permissions, transactions, migrations, cache, Redis failure, external mocks и end-to-end LMS flow. Coverage останется диагностическим сигналом, а release будет блокироваться нарушением ключевого контракта."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Построить матрицу"}:</strong> {"связать risk, scenario, уровень теста и ожидаемый сигнал failure."}
            </li>
            <li>
              <strong>{"Изолировать зависимости"}:</strong> {"создать clean PostgreSQL, test Redis, deterministic clock и external mocks."}
            </li>
            <li>
              <strong>{"Закрыть пробелы"}:</strong> {"добавить tests для permissions, rollback, migrations, cache fallback и полного LMS flow."}
            </li>
            <li>
              <strong>{"Сделать gate"}:</strong> {"запускать один повторяемый pipeline и блокировать release при красном обязательном check."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"unit"} title={"Одно правило"}>
            {"Быстро проверяет pure function, validator, policy или mapper без реальной инфраструктуры."}
          </TypeCard>
          <TypeCard badge={"integration"} badgeTone="float" title={"Граница компонентов"}>
            {"Проверяет API + service + PostgreSQL, Redis adapter или migration на реальном контракте."}
          </TypeCard>
          <TypeCard badge={"end-to-end"} badgeTone="str" title={"Пользовательский flow"}>
            {"Доказывает teacher → publish → enrollment → completion → progress через внешний API."}
          </TypeCard>
          <TypeCard badge={"gate"} title={"Условие release"}>
            {"Обязательный набор checks с ясными командами, артефактами и fail-fast поведением."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Test matrix по критическим сценариям"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"permission bypass"}</>, "negative API integration tests для student/foreign teacher/admin"],
            [<>{"partial transaction"}</>, "forced second-step failure и проверка rollback"],
            [<>{"broken migration"}</>, "upgrade clean database → current head → smoke query"],
            [<>{"stale cache"}</>, "publish/update → invalidate → next miss → fresh response"],
            [<>{"dependency outage"}</>, "Redis/external API unavailable → documented fallback"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "permission bypass", right: "negative API integration tests для student/foreign teacher/admin" },
            { left: "partial transaction", right: "forced second-step failure и проверка rollback" },
            { left: "broken migration", right: "upgrade clean database → current head → smoke query" },
            { left: "stale cache", right: "publish/update → invalidate → next miss → fresh response" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Высокий coverage автоматически доказывает, что permissions, migrations и rollback защищены."}</>}
          isTrue={false}
          explanation={"Coverage показывает исполненные строки, но не качество assertions, выбранные риски и реалистичность environment."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Строим устойчивую тестовую границу"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"risk-based test matrix как данные"}

          code={
            "from dataclasses import dataclass\n" +
            "from enum import StrEnum\n" +
            "\n" +
            "\n" +
            "class TestLevel(StrEnum):\n" +
            "    UNIT = \"unit\"\n" +
            "    INTEGRATION = \"integration\"\n" +
            "    E2E = \"e2e\"\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class RiskCase:\n" +
            "    risk: str\n" +
            "    level: TestLevel\n" +
            "    scenario: str\n" +
            "    expected: str\n" +
            "\n" +
            "\n" +
            "MATRIX = [\n" +
            "    RiskCase(\n" +
            "        risk=\"foreign teacher edits course\",\n" +
            "        level=TestLevel.INTEGRATION,\n" +
            "        scenario=\"PATCH /api/v1/courses/{id} as another teacher\",\n" +
            "        expected=\"403 and unchanged database row\",\n" +
            "    ),\n" +
            "    RiskCase(\n" +
            "        risk=\"duplicate completion\",\n" +
            "        level=TestLevel.INTEGRATION,\n" +
            "        scenario=\"repeat completion request\",\n" +
            "        expected=\"idempotent response and one database row\",\n" +
            "    ),\n" +
            "]"
          }
        />


        <StepThrough
          code={
            "from dataclasses import dataclass\n" +
            "from enum import StrEnum\n" +
            "\n" +
            "\n" +
            "class TestLevel(StrEnum):\n" +
            "    UNIT = \"unit\"\n" +
            "    INTEGRATION = \"integration\"\n" +
            "    E2E = \"e2e\"\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class RiskCase:\n" +
            "    risk: str\n" +
            "    level: TestLevel\n" +
            "    scenario: str\n" +
            "    expected: str\n" +
            "\n" +
            "\n" +
            "MATRIX = [\n" +
            "    RiskCase(\n" +
            "        risk=\"foreign teacher edits course\",\n" +
            "        level=TestLevel.INTEGRATION,\n" +
            "        scenario=\"PATCH /api/v1/courses/{id} as another teacher\",\n" +
            "        expected=\"403 and unchanged database row\",\n" +
            "    ),\n" +
            "    RiskCase(\n" +
            "        risk=\"duplicate completion\",\n" +
            "        level=TestLevel.INTEGRATION,\n" +
            "        scenario=\"repeat completion request\",\n" +
            "        expected=\"idempotent response and one database row\",\n" +
            "    ),\n" +
            "]"
          }
          steps={[
            { line: 10, note: "RiskCase связывает риск с уровнем и наблюдаемым результатом.", vars: { "единица": "risk case" } },
            { line: 20, note: "Permission bypass требует реального HTTP и database state.", vars: { "level": "integration" } },
            { line: 22, note: "Assertion проверяет не только status, но и неизменность строки.", vars: { "proof": "403 + unchanged" } },
            { line: 25, note: "Повтор completion проверяет идемпотентность и constraint.", vars: { "rows": "1" } },
          ]}
        />

        <FillBlank
          prompt={"Какое слово должно завершить проверку отсутствия лишней строки?"}
          before={"assert completion_count "}
          after={" 1"}
          options={["==", "=", "is not"]}
          answer={"=="}
          explanation={"В тестовом выражении сравнение выполняется оператором ==, а присваивание = недопустимо."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Coverage или критические гарантии"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой набор ближе к risk-based release gate?"}
          left={{
            title: "Много мелких unit tests",
            code: "347 passed\ncoverage: 98%\nPostgreSQL: mocked\nRedis: mocked\nmigrations: skipped",
            note: "Большое число не доказывает интеграционные границы релиза.",
          }}
          right={{
            title: "Сбалансированная матрица",
            code: "unit: policies and mappers\nintegration: auth, DB, Redis\ne2e: teacher/student flow\nmigrations: clean DB\nquality gate: required",
            note: "Каждый уровень закрывает риск, который не виден на другом уровне.",
          }}
          preferred="right"
          explanation={"Качество определяется защищёнными контрактами и воспроизводимой средой, а не только количеством tests."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Сначала назовите критерий"}</h3>
          <p>{"До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность."}</p>
          <h3>{"Затем найдите evidence"}</h3>
          <p>{"Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием."}</p>
          <h3>{"После этого зафиксируйте границу"}</h3>
          <p>{"Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным."}</p>
        </div>

        <RecallCard
          question={"Почему более сложный вариант не считается автоматически более профессиональным?"}
          answer={<p>{"Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы."}</p>}
        />
      </Section>

      <Section number="05" title={"Устраняем хрупкий test setup"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "@pytest.fixture\n" +
            "async def session():\n" +
            "    return AsyncSession(engine)\n" +
            "\n" +
            "\n" +
            "async def test_duplicate_enrollment(session, client):\n" +
            "    await client.post(\"/api/v1/courses/1/enrollments\")\n" +
            "    await client.post(\"/api/v1/courses/1/enrollments\")\n" +
            "\n" +
            "    count = await count_enrollments(session)\n" +
            "    assert count == 1"
          }
          question={"Почему fixture может сделать suite нестабильным?"}
          options={[
            "Session не закрывается и database state не очищается",
            "Pytest запрещает async fixtures",
            "POST нельзя вызывать дважды",
          ]}
          correctIndex={0}
          explanation={"Без controlled transaction/cleanup tests делят соединения и строки, а результат зависит от порядка запуска."}
          fix={"@pytest_asyncio.fixture\nasync def session(test_engine):\n    async with async_sessionmaker(\n        test_engine,\n        expire_on_commit=False,\n    )() as session:\n        yield session\n        await session.rollback()\n\n\n@pytest_asyncio.fixture(autouse=True)\nasync def clean_database(test_engine):\n    await truncate_all_tables(test_engine)\n    yield"}
        />

        <div className="lesson-practice-steps">
          <h3>{"1. Воспроизведите"}</h3>
          <p>{"Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат."}</p>
          <h3>{"2. Найдите нарушенное ожидание"}</h3>
          <p>{"Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление."}</p>
          <h3>{"3. Защитите результат"}</h3>
          <p>{"Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно."}</p>
        </div>
      </Section>

      <Section number="06" title={"Собираем финальный quality gate"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"negative permission test"}

          code={
            "async def test_foreign_teacher_cannot_update_course(\n" +
            "    client: AsyncClient,\n" +
            "    teacher_a_headers: dict[str, str],\n" +
            "    teacher_b_headers: dict[str, str],\n" +
            "    session: AsyncSession,\n" +
            ") -> None:\n" +
            "    course = await create_course(\n" +
            "        client,\n" +
            "        headers=teacher_a_headers,\n" +
            "        title=\"Async Python\",\n" +
            "    )\n" +
            "\n" +
            "    response = await client.patch(\n" +
            "        f\"/api/v1/courses/{course['id']}\",\n" +
            "        headers=teacher_b_headers,\n" +
            "        json={\"title\": \"Hijacked\"},\n" +
            "    )\n" +
            "\n" +
            "    assert response.status_code == 403\n" +
            "    assert response.json()[\"code\"] == \"course_forbidden\"\n" +
            "\n" +
            "    stored = await session.get(Course, course[\"id\"])\n" +
            "    assert stored is not None\n" +
            "    assert stored.title == \"Async Python\""
          }
        />


        <BranchExplorer
          code={
            "if risk.needs_database:\n" +
            "    environment = clean_postgres()\n" +
            "elif risk.needs_redis:\n" +
            "    environment = isolated_redis_namespace()\n" +
            "elif risk.needs_external_api:\n" +
            "    environment = deterministic_http_mock()\n" +
            "else:\n" +
            "    environment = pure_python_fixture()"
          }
          scenarios={[
            { label: "transaction rollback", activeLine: 1, output: "clean PostgreSQL" },
            { label: "cache invalidation", activeLine: 3, output: "isolated Redis namespace" },
            { label: "recommendation timeout", activeLine: 5, output: "deterministic HTTP mock" },
            { label: "slug normalizer", activeLine: 7, output: "pure Python fixture" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Migrations gate"}>
            {"Создать пустую database, выполнить alembic upgrade head, проверить current head и запустить smoke query."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Determinism"}>
            {"Зафиксировать clock, random seed, external responses и unique namespaces вместо sleep и общей state."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Artifacts"}>
            {"Сохранять test report, coverage как сигнал, migration log и service logs при failure."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Запускаем gate в чистом окружении"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "docker compose -f compose.test.yaml up -d postgres redis" },
            { out: "postgres healthy\nredis healthy" },
            { cmd: "alembic upgrade head" },
            { out: "Running upgrade ... -> head" },
            { cmd: "pytest -m \"not slow\" -q" },
            { out: "214 passed in 18.71s" },
            { cmd: "pytest -m e2e -q" },
            { out: "12 passed in 9.82s" },
            { cmd: "python scripts/assert_migration_head.py" },
            { out: "database revision matches alembic head" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "services", code: "поднять clean test services" },
            { id: "migrate", code: "применить migrations from zero" },
            { id: "unit", code: "запустить быстрые unit checks" },
            { id: "integration", code: "запустить API/DB/Redis integration" },
            { id: "e2e", code: "запустить основной LMS flow" },
            { id: "artifacts", code: "сохранить отчёты и остановить services" },
          ]}
          correctOrder={["services", "migrate", "unit", "integration", "e2e", "artifacts"]}
          explanation={"Интеграционные tests доверяют только базе, созданной текущими migrations, а artifacts сохраняются даже при failure."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Коммит 1 — наблюдение"}</h3>
          <p>{"Зафиксируйте baseline, failing scenario или исходный документ до изменения."}</p>
          <h3>{"Коммит 2 — минимальное исправление"}</h3>
          <p>{"Измените только ответственную границу и сохраните маленький читаемый diff."}</p>
          <h3>{"Коммит 3 — evidence"}</h3>
          <p>{"Добавьте тест, документацию, diagram или runbook, который доказывает результат."}</p>
        </div>

        <RecallCard
          question={"Что должно позволить другому разработчику повторить результат?"}
          answer={<p>{"Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения."}</p>}
        />
      </Section>

      <Section number="08" title={"Контрольная точка и самостоятельная практика"}>
        <Lead>
          {"Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Как выбрать уровень теста?"}
            options={[
              "По привычке автора",
              "По риску и необходимой границе",
              "Всегда E2E",
            ]}
            correctIndex={1}
            explanation={"Уровень определяется тем, какие реальные компоненты нужны для доказательства правила."}
          />
          <QuizCard
            question={"Что обязательно проверить в permission test кроме 403?"}
            options={[
              "Цвет лога",
              "Неизменность protected resource",
              "Количество файлов",
            ]}
            correctIndex={1}
            explanation={"Запрещённый request не должен оставить побочный эффект."}
          />
          <QuizCard
            question={"Зачем migration gate начинает с пустой базы?"}
            options={[
              "Чтобы доказать воспроизводимость schema",
              "Чтобы ускорить unit tests",
              "Чтобы не запускать Alembic",
            ]}
            correctIndex={0}
            explanation={"Release должен уметь построить актуальную schema без локальной истории разработчика."}
          />
          <QuizCard
            question={"Почему sleep делает TTL test слабым?"}
            options={[
              "Он использует Python",
              "Добавляет время и нестабильность",
              "Redis не поддерживает TTL",
            ]}
            correctIndex={1}
            explanation={"Лучше управляемый clock или короткий изолированный expiry с polling и пределом."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Test matrix строится от рисков продукта и инфраструктуры, а не от желания получить красивый процент."}</>,

            <>{"Unit, integration и end-to-end уровни отвечают на разные вопросы и не заменяют друг друга."}</>,

            <>{"Permission test проверяет status, error code и отсутствие запрещённого изменения."}</>,

            <>{"Clean PostgreSQL и migrations from zero входят в release gate."}</>,

            <>{"Redis, external HTTP и время изолируются так, чтобы tests были deterministic."}</>,

            <>{"CI блокирует release при нарушении ключевого контракта и сохраняет диагностические artifacts."}</>,

          ]}
        />


        <PracticeCta text={"Составьте risk-based matrix минимум из 25 cases, добавьте отсутствующие permission, rollback, migration, cache и outage tests, запустите их на clean PostgreSQL/Redis и оформите один обязательный release quality gate."} />
      </Section>
    </RichLesson>
  );
}
