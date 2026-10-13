import { FileText, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson210({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"README, ER-диаграмма и архитектурный рассказ"}
        intro={"Превратим репозиторий StudyHub в самостоятельный инженерный рассказ: сначала покажем проблему и основной пользовательский flow, затем дадим воспроизводимый запуск, ER-диаграмму, путь HTTP-запроса, примеры API и честные ограничения."}
        tags={[
          { icon: <FileText size={14} />, label: "recruiter → reviewer → developer" },
          { icon: <Layers size={14} />, label: "ER · request flow · trade-offs" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"После quality gate код уже доказал работоспособность. Теперь другой человек должен понять назначение проекта, запустить его и увидеть ключевые решения без устных подсказок автора."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"README не становится учебником по FastAPI, PostgreSQL и Redis. Он ведёт читателя к проекту, а подробные runbooks и решения выносятся в docs."}
      </Callout>

      <Section number="01" title={"Репозиторий должен говорить без автора"}>
        <Lead>
          {"Превратим репозиторий StudyHub в самостоятельный инженерный рассказ: сначала покажем проблему и основной пользовательский flow, затем дадим воспроизводимый запуск, ER-диаграмму, путь HTTP-запроса, примеры API и честные ограничения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Ориентировать"}:</strong> {"за первые 30 секунд назвать проблему, роли, основной flow и итог проекта."}
            </li>
            <li>
              <strong>{"Дать запуск"}:</strong> {"описать точные prerequisites, environment variables и одну проверенную последовательность команд."}
            </li>
            <li>
              <strong>{"Показать устройство"}:</strong> {"добавить ER-диаграмму, request flow и карту PostgreSQL/Redis/background operations."}
            </li>
            <li>
              <strong>{"Объяснить решения"}:</strong> {"зафиксировать причины выбора, trade-offs, known limitations и следующий разумный шаг."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"recruiter"} title={"Ценность и масштаб"}>
            {"Что делает продукт, какие роли и сценарии реализованы, где посмотреть demo."}
          </TypeCard>
          <TypeCard badge={"reviewer"} badgeTone="float" title={"Инженерные решения"}>
            {"Как устроены границы API, данные, permissions, кеш, тесты и CI."}
          </TypeCard>
          <TypeCard badge={"developer"} badgeTone="str" title={"Воспроизводимый старт"}>
            {"Какие команды, переменные и проверки нужны для локального запуска."}
          </TypeCard>
          <TypeCard badge={"maintainer"} title={"Эксплуатация"}>
            {"Где находятся migrations, logs, healthcheck, runbooks и процедура rollback."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Четыре маршрута чтения README"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"Problem"}</>, "один абзац о задаче LMS, а не общая фраза «учебный backend»"],
            [<>{"Flow"}</>, "teacher публикует course → student enrolls → completes lesson → sees progress"],
            [<>{"Architecture"}</>, "HTTP → FastAPI → service → PostgreSQL; Redis остаётся временным слоем"],
            [<>{"Operations"}</>, "Compose, migrations, health/readiness, logs, CI и smoke test"],
            [<>{"Trade-offs"}</>, "что упрощено, почему и какое условие заставит пересмотреть решение"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "Problem", right: "один абзац о задаче LMS, а не общая фраза «учебный backend»" },
            { left: "Flow", right: "teacher публикует course → student enrolls → completes lesson → sees progress" },
            { left: "Architecture", right: "HTTP → FastAPI → service → PostgreSQL; Redis остаётся временным слоем" },
            { left: "Operations", right: "Compose, migrations, health/readiness, logs, CI и smoke test" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Чем длиннее README, тем лучше он демонстрирует уровень разработчика."}</>}
          isTrue={false}
          explanation={"Ценность README в маршруте чтения и проверяемости. Длинный перечень технологий без причин и команд только увеличивает шум."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Каркас README и clean start"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"каркас README с маршрутом чтения"}

          code={
            "# StudyHub LMS\n" +
            "\n" +
            "Backend API для публикации курсов и отслеживания прогресса.\n" +
            "\n" +
            "## Demo flow\n" +
            "\n" +
            "teacher → course → module → lesson → publish  \n" +
            "student → enrollment → completion → progress\n" +
            "\n" +
            "## Quick start\n" +
            "\n" +
            "~~~bash\n" +
            "cp .env.example .env\n" +
            "docker compose up --build -d\n" +
            "docker compose run --rm migrations\n" +
            "curl http://localhost:8000/health\n" +
            "~~~\n" +
            "\n" +
            "## Architecture\n" +
            "\n" +
            "- PostgreSQL — source of truth\n" +
            "- Redis — cache, rate limit и временное состояние\n" +
            "- FastAPI — HTTP contract и dependencies"
          }
        />


        <StepThrough
          code={
            "# StudyHub LMS\n" +
            "\n" +
            "Backend API для публикации курсов и отслеживания прогресса.\n" +
            "\n" +
            "## Demo flow\n" +
            "\n" +
            "teacher → course → module → lesson → publish  \n" +
            "student → enrollment → completion → progress\n" +
            "\n" +
            "## Quick start\n" +
            "\n" +
            "~~~bash\n" +
            "cp .env.example .env\n" +
            "docker compose up --build -d\n" +
            "docker compose run --rm migrations\n" +
            "curl http://localhost:8000/health\n" +
            "~~~\n" +
            "\n" +
            "## Architecture\n" +
            "\n" +
            "- PostgreSQL — source of truth\n" +
            "- Redis — cache, rate limit и временное состояние\n" +
            "- FastAPI — HTTP contract и dependencies"
          }
          steps={[
            { line: 1, note: "Заголовок и первый абзац сразу называют продукт и его назначение.", vars: { "читатель": "recruiter" } },
            { line: 5, note: "Demo flow показывает готовый бизнес-сценарий раньше списка технологий.", vars: { "артефакт": "vertical flow" } },
            { line: 11, note: "Quick start содержит воспроизводимые команды, а не фразу «запустите Docker».", vars: { "результат": "health = ok" } },
            { line: 21, note: "Architecture связывает технологию с ролью, а не перечисляет логотипы.", vars: { "истина": "PostgreSQL" } },
          ]}
        />

        <FillBlank
          prompt={"Какой файл должен показывать названия обязательных переменных без реальных секретов?"}
          before={""}
          after={""}
          options={[".env.example", ".env", "secrets.txt"]}
          answer={".env.example"}
          explanation={"`.env.example` документирует контракт конфигурации и безопасно хранится в репозитории."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Стек ради списка или архитектурный рассказ"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой фрагмент быстрее доказывает ценность и зрелость проекта?"}
          left={{
            title: "Список технологий",
            code: "FastAPI, PostgreSQL, Redis, Docker, pytest, GitHub Actions",
            note: "Неясно, какую проблему решает проект и где технология используется.",
          }}
          right={{
            title: "Проблема и flow",
            code: "Teacher publishes a course. Student enrolls, completes lessons and receives progress. PostgreSQL stores truth; Redis accelerates the catalog.",
            note: "Читатель видит пользовательский результат и роли компонентов.",
          }}
          preferred="right"
          explanation={"Стек важен после контекста. Сначала нужно показать продуктовый flow, затем причины инженерных решений."}
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

      <Section number="05" title={"Quick start должен быть воспроизводимым"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "## Запуск\n" +
            "\n" +
            "1. Скачайте проект.\n" +
            "2. Настройте окружение.\n" +
            "3. Запустите приложение.\n" +
            "4. Всё должно работать."
          }
          question={"Почему такой quick start нельзя считать воспроизводимым?"}
          options={[
            "Нет точных prerequisites, команд и проверяемого результата",
            "README обязан содержать только код",
            "Нельзя использовать нумерованный список",
          ]}
          correctIndex={0}
          explanation={"Другой разработчик не знает версию инструментов, имена переменных, порядок migrations и способ проверить успех."}
          fix={"## Quick start\n\nPrerequisites: Docker 27+ и Docker Compose v2.\n\n~~~bash\ngit clone <repository-url>\ncd studyhub\ncp .env.example .env\ndocker compose up --build -d\ndocker compose run --rm migrations\ncurl --fail http://localhost:8000/health\n~~~\n\nОжидаемый результат: `{\"status\":\"ok\"}`."}
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

      <Section number="06" title={"Добавляем ER и request flow"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"ER-диаграмма и путь одного запроса"}

          code={
            "erDiagram\n" +
            "    USER ||--o{ COURSE : owns\n" +
            "    USER ||--o{ ENROLLMENT : creates\n" +
            "    COURSE ||--|{ MODULE : contains\n" +
            "    MODULE ||--|{ LESSON : contains\n" +
            "    COURSE ||--o{ ENROLLMENT : receives\n" +
            "    ENROLLMENT ||--o{ COMPLETION : records\n" +
            "    LESSON ||--o{ COMPLETION : completed\n" +
            "\n" +
            "request\n" +
            "  → /api/v1 router\n" +
            "  → authentication dependency\n" +
            "  → permission check\n" +
            "  → service\n" +
            "  → AsyncSession transaction\n" +
            "  → PostgreSQL\n" +
            "  → cache invalidation\n" +
            "  → ApiResponse"
          }
        />


        <BranchExplorer
          code={
            "if reader == \"recruiter\":\n" +
            "    open_section(\"problem_and_demo\")\n" +
            "elif reader == \"reviewer\":\n" +
            "    open_section(\"architecture_and_tests\")\n" +
            "elif reader == \"developer\":\n" +
            "    open_section(\"quick_start_and_config\")\n" +
            "else:\n" +
            "    open_section(\"operations_and_limitations\")"
          }
          scenarios={[
            { label: "первое знакомство", activeLine: 1, output: "problem, roles, demo flow" },
            { label: "code review", activeLine: 3, output: "architecture, contracts, test matrix" },
            { label: "локальный запуск", activeLine: 5, output: "prerequisites, env, commands, health" },
            { label: "поддержка", activeLine: 7, output: "migrations, logs, runbooks, limitations" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"ER diagram"}>
            {"Показывает сущности, cardinality и отдельные association records, а не все поля моделей."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Request flow"}>
            {"Объясняет ответственность router, dependency, service, transaction и cache invalidation."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Known limitations"}>
            {"Честно фиксирует отсутствие payment, media hosting, distributed queue и enterprise RBAC."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Проверяем README другим человеком"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "git clone https://example.com/studyhub.git && cd studyhub" },
            { cmd: "cp .env.example .env && docker compose up --build -d" },
            { cmd: "docker compose run --rm migrations" },
            { out: "INFO  [alembic.runtime.migration] Running upgrade -> head" },
            { cmd: "curl --fail http://localhost:8000/health" },
            { out: "{\"status\":\"ok\"}" },
            { cmd: "make quality" },
            { out: "format: passed\nlint: passed\ntests: 214 passed" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "overview", code: "написать problem, roles и demo flow" },
            { id: "quickstart", code: "проверить запуск из чистой директории" },
            { id: "diagrams", code: "добавить ER и request flow" },
            { id: "examples", code: "показать curl/Postman и demo accounts" },
            { id: "decisions", code: "зафиксировать trade-offs и limitations" },
            { id: "review", code: "дать README другому человеку и исправить разрывы" },
          ]}
          correctOrder={["overview", "quickstart", "diagrams", "examples", "decisions", "review"]}
          explanation={"README строится от смысла к воспроизведению и только затем к деталям архитектуры и ограничениям."}
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
            question={"Что должно находиться до полного списка stack?"}
            options={[
              "История всех коммитов",
              "Проблема и основной пользовательский flow",
              "Все SQL-запросы",
            ]}
            correctIndex={1}
            explanation={"Контекст позволяет понять, зачем технологии вообще появились."}
          />
          <QuizCard
            question={"Как доказать качество quick start?"}
            options={[
              "Запустить по нему проект из чистой папки",
              "Сделать больше скриншотов",
              "Добавить слово production",
            ]}
            correctIndex={0}
            explanation={"Воспроизводимость проверяется повторным запуском без скрытых действий."}
          />
          <QuizCard
            question={"Какую роль Redis нужно указать в архитектуре StudyHub?"}
            options={[
              "Source of truth курсов",
              "Временный cache/rate-limit слой",
              "Замена PostgreSQL",
            ]}
            correctIndex={1}
            explanation={"Основные данные остаются в PostgreSQL."}
          />
          <QuizCard
            question={"Что делает limitations сильнее?"}
            options={[
              "Скрывает слабые места",
              "Показывает границы и условия следующего решения",
              "Обещает enterprise-ready",
            ]}
            correctIndex={1}
            explanation={"Честная граница показывает осознанность, а не незавершённость."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"README ведёт разные роли читателей по коротким маршрутам."}</>,

            <>{"Problem и demo flow появляются раньше перечня технологий."}</>,

            <>{"Quick start содержит prerequisites, команды, migrations и проверяемый результат."}</>,

            <>{"ER-диаграмма показывает отношения данных, request flow — ответственность runtime-слоёв."}</>,

            <>{"Стек объясняется через роль и причину выбора."}</>,

            <>{"Trade-offs и known limitations делают архитектурный рассказ проверяемым и честным."}</>,

          ]}
        />


        <PracticeCta text={"Перепишите README StudyHub по маршрутам recruiter → reviewer → developer, добавьте проверенный quick start, `.env.example`, ER и request-flow диаграммы, demo accounts, два curl-примера, decision table и known limitations. Перед коммитом передайте репозиторий другому человеку для clean-start проверки."} />
      </Section>
    </RichLesson>
  );
}
