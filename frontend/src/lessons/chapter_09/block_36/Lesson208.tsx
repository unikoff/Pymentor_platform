import { AlertTriangle, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson208({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Аудит безопасности и производительности"}
        intro={"Проведём инженерный аудит без ложного ярлыка production-ready: составим риск-реестр, проверим secrets, auth, ownership, CORS, SQL, N+1, indexes, transactions, cache invalidation и rate limit, затем подтвердим минимум три исправления наблюдаемыми данными."}
        tags={[
          { icon: <Search size={14} />, label: "risk → evidence → fix" },
          { icon: <AlertTriangle size={14} />, label: "security · queries · cache" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"После стабилизации внешнего error contract можно исследовать системные границы: где проект раскрывает данные, допускает чужое действие или выполняет лишнюю работу."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Учебный checklist не является penetration test, formal certification или гарантией безопасности. Результат — прозрачный список проверок, рисков и подтверждённых исправлений."}
      </Callout>

      <Section number="01" title={"Почему финальный проект нужен аудит"}>
        <Lead>
          {"Проведём инженерный аудит без ложного ярлыка production-ready: составим риск-реестр, проверим secrets, auth, ownership, CORS, SQL, N+1, indexes, transactions, cache invalidation и rate limit, затем подтвердим минимум три исправления наблюдаемыми данными."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Определить активы"}:</strong> {"назвать данные и операции, ущерб от которых действительно важен."}
            </li>
            <li>
              <strong>{"Проверить контроль"}:</strong> {"для каждого риска найти код, configuration, test, query plan или log."}
            </li>
            <li>
              <strong>{"Оценить приоритет"}:</strong> {"сопоставить вероятность и влияние вместо случайного порядка fixes."}
            </li>
            <li>
              <strong>{"Доказать улучшение"}:</strong> {"сохранить before/after evidence и отдельный commit на каждую проблему."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"asset"} title={"Что защищаем"}>
            {"Пароль, token, персональные данные, ownership курса и доступность API."}
          </TypeCard>
          <TypeCard badge={"threat"} badgeTone="float" title={"Что может случиться"}>
            {"Утечка secret, чужое изменение course, SQL injection, N+1 или stale cache."}
          </TypeCard>
          <TypeCard badge={"control"} badgeTone="str" title={"Что снижает риск"}>
            {"Environment config, hash, permission check, parameters, eager loading или invalidation."}
          </TypeCard>
          <TypeCard badge={"evidence"} title={"Чем подтверждаем"}>
            {"Тест, redacted log, EXPLAIN, benchmark, git diff или воспроизводимый сценарий."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Risk register вместо общего списка"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"critical"}</>, "высокое влияние и реалистичный путь — исправить до release"],
            [<>{"high"}</>, "существенный риск — назначить owner и ближайший commit"],
            [<>{"medium"}</>, "ограниченный ущерб или сложный путь — документировать и планировать"],
            [<>{"low"}</>, "малое влияние — не маскировать им более важные проблемы"],
            [<>{"accepted"}</>, "осознанное ограничение с причиной и сроком пересмотра"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "critical", right: "высокое влияние и реалистичный путь — исправить до release" },
            { left: "high", right: "существенный риск — назначить owner и ближайший commit" },
            { left: "medium", right: "ограниченный ущерб или сложный путь — документировать и планировать" },
            { left: "low", right: "малое влияние — не маскировать им более важные проблемы" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Количество найденных пунктов важнее подтверждения того, что каждый пункт действительно применим к StudyHub."}</>}
          isTrue={false}
          explanation={"Аудит ценен точностью. Двадцать общих предупреждений без evidence хуже трёх конкретных рисков с воспроизводимым сценарием и исправлением."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Фиксируем находку как проверяемый объект"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"структура записи аудита"}

          code={
            "from dataclasses import dataclass\n" +
            "from enum import StrEnum\n" +
            "\n" +
            "\n" +
            "class Severity(StrEnum):\n" +
            "    CRITICAL = \"critical\"\n" +
            "    HIGH = \"high\"\n" +
            "    MEDIUM = \"medium\"\n" +
            "    LOW = \"low\"\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class AuditFinding:\n" +
            "    finding_id: str\n" +
            "    area: str\n" +
            "    severity: Severity\n" +
            "    evidence: str\n" +
            "    risk: str\n" +
            "    remediation: str\n" +
            "    verification: str\n" +
            "\n" +
            "\n" +
            "finding = AuditFinding(\n" +
            "    finding_id=\"AUTH-03\",\n" +
            "    area=\"object ownership\",\n" +
            "    severity=Severity.CRITICAL,\n" +
            "    evidence=\"teacher B can PATCH course owned by teacher A\",\n" +
            "    risk=\"unauthorized course modification\",\n" +
            "    remediation=\"load course and compare owner_id before update\",\n" +
            "    verification=\"integration test returns 403 and row stays unchanged\",\n" +
            ")"
          }
        />


        <StepThrough
          code={
            "from dataclasses import dataclass\n" +
            "from enum import StrEnum\n" +
            "\n" +
            "\n" +
            "class Severity(StrEnum):\n" +
            "    CRITICAL = \"critical\"\n" +
            "    HIGH = \"high\"\n" +
            "    MEDIUM = \"medium\"\n" +
            "    LOW = \"low\"\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class AuditFinding:\n" +
            "    finding_id: str\n" +
            "    area: str\n" +
            "    severity: Severity\n" +
            "    evidence: str\n" +
            "    risk: str\n" +
            "    remediation: str\n" +
            "    verification: str\n" +
            "\n" +
            "\n" +
            "finding = AuditFinding(\n" +
            "    finding_id=\"AUTH-03\",\n" +
            "    area=\"object ownership\",\n" +
            "    severity=Severity.CRITICAL,\n" +
            "    evidence=\"teacher B can PATCH course owned by teacher A\",\n" +
            "    risk=\"unauthorized course modification\",\n" +
            "    remediation=\"load course and compare owner_id before update\",\n" +
            "    verification=\"integration test returns 403 and row stays unchanged\",\n" +
            ")"
          }
          steps={[
            { line: 11, note: "AuditFinding хранит факт, риск и проверку раздельно.", vars: { "формат": "finding" } },
            { line: 23, note: "Evidence описывает воспроизводимое наблюдение, а не впечатление автора.", vars: { "evidence": "PATCH чужого course" } },
            { line: 24, note: "Risk отвечает на вопрос об ущербе.", vars: { "impact": "чужое изменение" } },
            { line: 25, note: "Remediation задаёт минимальное изменение контроля.", vars: { "control": "ownership check" } },
            { line: 26, note: "Verification заранее определяет доказательство закрытия.", vars: { "proof": "403 + unchanged row" } },
          ]}
        />

        <FillBlank
          prompt={"Какое поле должно описывать наблюдаемый факт до исправления?"}
          before={"    "}
          after={": str"}
          options={["evidence", "opinion", "marketing_score"]}
          answer={"evidence"}
          explanation={"Evidence должно позволять другому разработчику воспроизвести проблему и сравнить результат после fix."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Исправлять по ощущению или по риску"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой отчёт помогает принять решение о release?"}
          left={{
            title: "Общий чек-лист",
            code: "- passwords secure\n- database optimized\n- CORS configured\n- tests exist",
            note: "Нет места, сценария, severity и способа проверки.",
          }}
          right={{
            title: "Risk register",
            code: "AUTH-03 | critical\nEvidence: PATCH чужого course = 200\nFix: owner check\nVerify: 403 + unchanged row",
            note: "Проблема воспроизводится, имеет приоритет и критерий закрытия.",
          }}
          preferred="right"
          explanation={"Release decision требует evidence и остаточного риска, а не зелёных слов без контекста."}
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

      <Section number="05" title={"Находим дефект безопасности или производительности"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "@router.patch(\"/courses/{course_id}\")\n" +
            "async def update_course(\n" +
            "    course_id: int,\n" +
            "    payload: CourseUpdate,\n" +
            "    user: CurrentUser,\n" +
            "    session: AsyncSession,\n" +
            "):\n" +
            "    course = await session.get(Course, course_id)\n" +
            "    if course is None:\n" +
            "        raise CourseNotFound(course_id)\n" +
            "\n" +
            "    apply_patch(course, payload)\n" +
            "    await session.commit()\n" +
            "    return course"
          }
          question={"Какой critical permission defect виден в endpoint?"}
          options={[
            "Не проверено владение course или роль admin",
            "AsyncSession нельзя использовать с PATCH",
            "Commit должен быть до изменения",
          ]}
          correctIndex={0}
          explanation={"Любой authenticated user может изменить найденный course, если отдельная permission dependency отсутствует."}
          fix={"course = await get_course_or_404(session, course_id)\n\nif user.role != \"admin\" and course.owner_id != user.id:\n    raise CourseForbidden(course_id)\n\napply_patch(course, payload)\nawait session.commit()\nawait session.refresh(course)\nreturn course"}
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

      <Section number="06" title={"Проводим аудит реального StudyHub"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"аудит read-path каталога"}

          code={
            "async def list_catalog(\n" +
            "    session: AsyncSession,\n" +
            "    *,\n" +
            "    limit: int,\n" +
            "    offset: int,\n" +
            ") -> list[Course]:\n" +
            "    statement = (\n" +
            "        select(Course)\n" +
            "        .where(Course.status == CourseStatus.PUBLISHED)\n" +
            "        .options(selectinload(Course.modules))\n" +
            "        .order_by(Course.published_at.desc(), Course.id.desc())\n" +
            "        .limit(limit)\n" +
            "        .offset(offset)\n" +
            "    )\n" +
            "    result = await session.scalars(statement)\n" +
            "    return list(result.unique().all())"
          }
        />


        <BranchExplorer
          code={
            "if finding.area == \"secret\":\n" +
            "    evidence = inspect_config_and_git_history()\n" +
            "elif finding.area == \"permission\":\n" +
            "    evidence = run_negative_access_test()\n" +
            "elif finding.area == \"query\":\n" +
            "    evidence = capture_explain_and_query_count()\n" +
            "elif finding.area == \"cache\":\n" +
            "    evidence = reproduce_stale_read()\n" +
            "else:\n" +
            "    evidence = document_manual_review()"
          }
          scenarios={[
            { label: "secret in .env", activeLine: 1, output: "remove, rotate, scan history" },
            { label: "foreign course PATCH", activeLine: 3, output: "403 negative integration test" },
            { label: "catalog N+1", activeLine: 5, output: "query count + eager loading" },
            { label: "stale after publish", activeLine: 7, output: "commit → invalidate → miss" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Security lane"}>
            {"Secrets, password/token handling, ownership, permissions matrix, CORS и parameterized SQL."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Performance lane"}>
            {"Query count, EXPLAIN, N+1, indexes, transaction duration, cache hit/miss и invalidation."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Operational lane"}>
            {"Rate limit behavior, logs without secrets, health endpoints, dependency failure и rollback procedure."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Собираем evidence и commits"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "pytest tests/security/test_course_ownership.py -q" },
            { out: "4 passed" },
            { cmd: "python scripts/query_count.py /api/v1/courses" },
            { out: "before: 31 SQL statements\nafter: 3 SQL statements" },
            { cmd: "git grep -nE \"SECRET_KEY=|postgresql.*:.*@|Bearer \" -- . \":(exclude).env.example\"" },
            { out: "no tracked secrets found" },
            { cmd: "python scripts/audit_summary.py" },
            { out: "critical: 0 | high: 0 | medium accepted: 2 | evidence files: 20" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "scope", code: "зафиксировать scope и assets" },
            { id: "checklist", code: "пройти checklist с evidence" },
            { id: "triage", code: "назначить severity и owner" },
            { id: "fix", code: "исправить critical/high отдельными commits" },
            { id: "verify", code: "повторить сценарии и измерения" },
            { id: "report", code: "записать accepted risks и итог" },
          ]}
          correctOrder={["scope", "checklist", "triage", "fix", "verify", "report"]}
          explanation={"Исправление начинается после фиксации evidence и приоритета, иначе audit превращается в хаотичный refactoring."}
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
            question={"Что делает finding воспроизводимым?"}
            options={[
              "Severity без примера",
              "Evidence и verification",
              "Количество строк отчёта",
            ]}
            correctIndex={1}
            explanation={"Другой разработчик должен повторить исходный сценарий и проверить закрытие."}
          />
          <QuizCard
            question={"Какой контроль защищает object ownership?"}
            options={[
              "Сравнение owner_id или admin role",
              "CORS wildcard",
              "Redis TTL",
            ]}
            correctIndex={0}
            explanation={"Ownership проверяется на конкретном resource перед изменением."}
          />
          <QuizCard
            question={"Чем доказать исправление N+1?"}
            options={[
              "Переименованием функции",
              "Query count и повторным измерением",
              "Увеличением timeout",
            ]}
            correctIndex={1}
            explanation={"Нужно показать уменьшение количества запросов при том же результате."}
          />
          <QuizCard
            question={"Что честно указать после учебного аудита?"}
            options={[
              "Formal certification passed",
              "Проверенный scope и известные ограничения",
              "Абсолютную безопасность",
            ]}
            correctIndex={1}
            explanation={"Аудит ограничен конкретными сценариями и не даёт абсолютной гарантии."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Аудит начинается с assets, угроз и evidence, а не с случайного списка модных проверок."}</>,

            <>{"Severity связывает вероятность и влияние и помогает выпускать fixes в правильном порядке."}</>,

            <>{"Security и performance требуют наблюдаемого before/after, а не заявления «стало лучше»."}</>,

            <>{"Ownership, parameterized SQL, secret handling и безопасные logs входят в обязательную границу."}</>,

            <>{"N+1, indexes, transactions и cache invalidation проверяются измерением на одном сценарии."}</>,

            <>{"Итог аудита честно описывает scope, закрытые findings и принятые ограничения."}</>,

          ]}
        />


        <PracticeCta text={"Создайте audit-register минимум из 20 пунктов, воспроизведите три реальных findings StudyHub, исправьте critical/high отдельными commits и приложите тест, query count, EXPLAIN, log или другой before/after evidence."} />
      </Section>
    </RichLesson>
  );
}
