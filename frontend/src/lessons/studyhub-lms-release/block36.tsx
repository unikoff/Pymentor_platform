import {
  AlertTriangle,
  Braces,
  Bug,
  CheckCircle2,
  FileText,
  GitBranch,
  Layers,
  Package,
  Search,
  ShieldCheck,
  Trophy,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";
// 207. Единый API error contract и versioning
export function Lesson207({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Единый API error contract и versioning"}
        intro={"Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1."}
        tags={[
          { icon: <Braces size={14} />, label: "code · message · details" },
          { icon: <ShieldCheck size={14} />, label: "/api/v1 и совместимость" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"LMS-функциональность завершена, но routers пока могут возвращать разные формы ошибок. Финальный клиентский контракт должен быть стабильнее внутренней реализации."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Версия URL не означает поддержку нескольких активных major-веток. В блоке фиксируется одна текущая версия и правило совместимых изменений."}
      </Callout>

      <Section number="01" title={"Почему случайные ошибки стали проблемой"}>
        <Lead>
          {"Соберём единую внешнюю границу ошибок StudyHub: один JSON-контракт для validation, auth, permissions, domain conflicts, rate limit и unexpected failures. Затем закрепим request_id, exception handlers, OpenAPI examples и понятный префикс /api/v1."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Снять инвентаризацию"}:</strong> {"собрать реальные 400/401/403/404/409/422/429/500 и сравнить их тела."}
            </li>
            <li>
              <strong>{"Назвать схему"}:</strong> {"зафиксировать code, message, details и request_id как обязательную внешнюю форму."}
            </li>
            <li>
              <strong>{"Свести источники"}:</strong> {"направить validation, domain и unexpected exceptions в отдельные handlers."}
            </li>
            <li>
              <strong>{"Защитить контракт"}:</strong> {"добавить тесты, OpenAPI examples и префикс /api/v1 без переписывания сервисов."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"code"} title={"Машинный идентификатор"}>
            {"Стабильная строка вроде course_not_found, по которой клиент выбирает реакцию."}
          </TypeCard>
          <TypeCard badge={"message"} badgeTone="float" title={"Сообщение человеку"}>
            {"Короткое безопасное объяснение без traceback, SQL и внутренних секретов."}
          </TypeCard>
          <TypeCard badge={"details"} badgeTone="str" title={"Структурированный контекст"}>
            {"Поля ошибки: field, reason, limit или conflict, если клиент может их использовать."}
          </TypeCard>
          <TypeCard badge={"request_id"} title={"Связь с логом"}>
            {"Идентификатор позволяет сопоставить ответ клиента с серверным событием."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Главная модель единого error contract"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"RequestValidationError"}</>, "422 validation_error с нормализованным списком полей"],
            [<>{"DomainError"}</>, "осознанный status и code из бизнес-правила"],
            [<>{"HTTPException"}</>, "переходный адаптер для старых routers"],
            [<>{"RateLimitError"}</>, "429 rate_limit_exceeded и Retry-After"],
            [<>{"Exception"}</>, "500 internal_error без раскрытия внутренних деталей"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "RequestValidationError", right: "422 validation_error с нормализованным списком полей" },
            { left: "DomainError", right: "осознанный status и code из бизнес-правила" },
            { left: "HTTPException", right: "переходный адаптер для старых routers" },
            { left: "RateLimitError", right: "429 rate_limit_exceeded и Retry-After" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Клиенту достаточно HTTP status, поэтому стабильный error code и request_id не нужны."}</>}
          isTrue={false}
          explanation={"Status задаёт класс результата, но не различает десятки предметных причин. code нужен программе клиента, request_id — диагностике."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Минимальная схема и domain exception"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"минимальная схема и domain exception"}

          code={
            "from typing import Any\n" +
            "\n" +
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "\n" +
            "class ApiError(BaseModel):\n" +
            "    code: str = Field(examples=[\"course_not_found\"])\n" +
            "    message: str\n" +
            "    details: dict[str, Any] | list[dict[str, Any]] | None = None\n" +
            "    request_id: str\n" +
            "\n" +
            "\n" +
            "class DomainError(Exception):\n" +
            "    def __init__(\n" +
            "        self,\n" +
            "        *,\n" +
            "        status_code: int,\n" +
            "        code: str,\n" +
            "        message: str,\n" +
            "        details: dict[str, Any] | None = None,\n" +
            "    ) -> None:\n" +
            "        super().__init__(message)\n" +
            "        self.status_code = status_code\n" +
            "        self.code = code\n" +
            "        self.message = message\n" +
            "        self.details = details"
          }
        />


        <StepThrough
          code={
            "from typing import Any\n" +
            "\n" +
            "from pydantic import BaseModel, Field\n" +
            "\n" +
            "\n" +
            "class ApiError(BaseModel):\n" +
            "    code: str = Field(examples=[\"course_not_found\"])\n" +
            "    message: str\n" +
            "    details: dict[str, Any] | list[dict[str, Any]] | None = None\n" +
            "    request_id: str\n" +
            "\n" +
            "\n" +
            "class DomainError(Exception):\n" +
            "    def __init__(\n" +
            "        self,\n" +
            "        *,\n" +
            "        status_code: int,\n" +
            "        code: str,\n" +
            "        message: str,\n" +
            "        details: dict[str, Any] | None = None,\n" +
            "    ) -> None:\n" +
            "        super().__init__(message)\n" +
            "        self.status_code = status_code\n" +
            "        self.code = code\n" +
            "        self.message = message\n" +
            "        self.details = details"
          }
          steps={[
            { line: 5, note: "ApiError описывает только данные HTTP-ответа и не зависит от конкретного router.", vars: { "граница": "response schema" } },
            { line: 12, note: "DomainError переносит предметный смысл из service к общему handler.", vars: { "источник": "service" } },
            { line: 20, note: "Status и machine-readable code задаются явно в месте обнаружения правила.", vars: { "code": "course_not_found" } },
            { line: 23, note: "details остаётся структурой, а не строкой со случайным форматом.", vars: { "details": "{course_id: 42}" } },
          ]}
        />

        <FillBlank
          prompt={"Дополните поле, связывающее HTTP-ошибку с серверным логом."}
          before={"    "}
          after={": str"}
          options={["request_id", "traceback", "password"]}
          answer={"request_id"}
          explanation={"Внешний request_id безопасно возвращается клиенту и помогает найти соответствующее событие в логах."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Случайные формы против единого контракта"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой response contract проще использовать frontend-клиенту и тестам?"}
          left={{
            title: "Случайные формы",
            code: "{\"detail\": \"Not found\"}\n{\"error\": \"duplicate slug\"}\n{\"message\": [\"invalid field\"]}",
            note: "Клиент вынужден угадывать форму по endpoint и status.",
          }}
          right={{
            title: "Единая схема",
            code: "{\n  \"code\": \"course_slug_conflict\",\n  \"message\": \"Slug is already used\",\n  \"details\": {\"field\": \"slug\"},\n  \"request_id\": \"req-8b1\"\n}",
            note: "Форма постоянна, а предметная причина находится в code.",
          }}
          preferred="right"
          explanation={"Единая структура уменьшает ветвление клиента и делает отрицательные тесты одинаковыми для всех routers."}
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

      <Section number="05" title={"Unexpected 500 не раскрывает внутренности"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "@app.exception_handler(Exception)\n" +
            "async def unexpected_handler(request, exc):\n" +
            "    return JSONResponse(\n" +
            "        status_code=500,\n" +
            "        content={\n" +
            "            \"code\": \"internal_error\",\n" +
            "            \"message\": str(exc),\n" +
            "            \"request_id\": request.state.request_id,\n" +
            "        },\n" +
            "    )"
          }
          question={"Какой риск остаётся в unexpected handler?"}
          options={[
            "В message раскрываются внутренние детали исключения",
            "JSONResponse нельзя использовать в FastAPI",
            "Status 500 должен быть 404",
          ]}
          correctIndex={0}
          explanation={"Текст неожиданного исключения может содержать SQL, путь, hostname или другое внутреннее состояние."}
          fix={"@app.exception_handler(Exception)\nasync def unexpected_handler(request, exc):\n    logger.exception(\n        \"unexpected request failure\",\n        extra={\"request_id\": request.state.request_id},\n    )\n    return JSONResponse(\n        status_code=500,\n        content={\n            \"code\": \"internal_error\",\n            \"message\": \"Unexpected server error\",\n            \"details\": None,\n            \"request_id\": request.state.request_id,\n        },\n    )"}
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

      <Section number="06" title={"Встраиваем handlers и /api/v1"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"общий handler и versioned router"}

          code={
            "from fastapi import APIRouter, FastAPI, Request\n" +
            "from fastapi.responses import JSONResponse\n" +
            "\n" +
            "api_v1 = APIRouter(prefix=\"/api/v1\")\n" +
            "\n" +
            "\n" +
            "@app.exception_handler(DomainError)\n" +
            "async def domain_error_handler(\n" +
            "    request: Request,\n" +
            "    exc: DomainError,\n" +
            ") -> JSONResponse:\n" +
            "    body = ApiError(\n" +
            "        code=exc.code,\n" +
            "        message=exc.message,\n" +
            "        details=exc.details,\n" +
            "        request_id=request.state.request_id,\n" +
            "    )\n" +
            "    return JSONResponse(\n" +
            "        status_code=exc.status_code,\n" +
            "        content=body.model_dump(),\n" +
            "    )\n" +
            "\n" +
            "\n" +
            "app.include_router(api_v1)"
          }
        />


        <BranchExplorer
          code={
            "if error_source == \"validation\":\n" +
            "    response = validation_handler(error)\n" +
            "elif error_source == \"domain\":\n" +
            "    response = domain_handler(error)\n" +
            "elif error_source == \"rate_limit\":\n" +
            "    response = rate_limit_handler(error)\n" +
            "else:\n" +
            "    response = unexpected_handler(error)"
          }
          scenarios={[
            { label: "invalid body", activeLine: 1, output: "422 validation_error" },
            { label: "duplicate enrollment", activeLine: 3, output: "409 enrollment_conflict" },
            { label: "too many requests", activeLine: 5, output: "429 rate_limit_exceeded" },
            { label: "unknown defect", activeLine: 7, output: "500 internal_error" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Version prefix"}>
            {"Все публичные LMS routers подключаются через один APIRouter(prefix=\"/api/v1\")."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Compatibility"}>
            {"Добавление необязательного response-поля совместимо; переименование или удаление требует новой major-границы."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"OpenAPI"}>
            {"Для каждого status приводится пример ApiError, а успешные schemas не смешиваются с error schema."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Проверяем контракт и фиксируем порядок"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "pytest tests/api/test_error_contract.py -q" },
            { out: "18 passed in 1.42s" },
            { cmd: "curl -i http://localhost:8000/api/v1/courses/999" },
            { out: "HTTP/1.1 404 Not Found\nX-Request-ID: req-8b1\n{\"code\":\"course_not_found\",\"message\":\"Course not found\",\"details\":{\"course_id\":999},\"request_id\":\"req-8b1\"}" },
            { cmd: "curl -i http://localhost:8000/courses/999" },
            { out: "HTTP/1.1 404 Not Found\n{\"code\":\"route_not_found\", ...}" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "inventory", code: "собрать текущие error responses" },
            { id: "schema", code: "утвердить ApiError" },
            { id: "handlers", code: "подключить handlers по источникам" },
            { id: "version", code: "перенести routers под /api/v1" },
            { id: "tests", code: "зафиксировать statuses и bodies тестами" },
            { id: "docs", code: "обновить OpenAPI examples" },
          ]}
          correctOrder={["inventory", "schema", "handlers", "version", "tests", "docs"]}
          explanation={"Сначала фиксируется реальное расхождение, затем единая форма, и только после этого меняются маршруты и документация."}
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
            question={"Какое поле должно оставаться стабильным для программной реакции клиента?"}
            options={[
              "message",
              "code",
              "traceback",
            ]}
            correctIndex={1}
            explanation={"Message можно уточнять, а machine-readable code является частью внешнего контракта."}
          />
          <QuizCard
            question={"Что безопасно возвращать при unexpected 500?"}
            options={[
              "Полный repr исключения",
              "Общее сообщение и request_id",
              "SQL statement",
            ]}
            correctIndex={1}
            explanation={"Внутренняя причина пишется в защищённый лог, клиент получает безопасную форму."}
          />
          <QuizCard
            question={"Какое изменение обычно совместимо внутри /api/v1?"}
            options={[
              "Удалить обязательное поле",
              "Переименовать endpoint",
              "Добавить необязательное поле",
            ]}
            correctIndex={2}
            explanation={"Клиент старой версии может проигнорировать новое необязательное поле."}
          />
          <QuizCard
            question={"Где нормализовать RequestValidationError?"}
            options={[
              "В каждом endpoint",
              "В общем exception handler",
              "В README",
            ]}
            correctIndex={1}
            explanation={"Общий handler устраняет повторение и гарантирует одну форму 422."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"HTTP status задаёт класс результата, а code — конкретную машинную причину."}</>,

            <>{"ApiError имеет одинаковые поля для validation, auth, domain, rate limit и unexpected failures."}</>,

            <>{"Request ID связывает внешний ответ с серверным логом и не раскрывает внутренние данные."}</>,

            <>{"Unexpected exception логируется с traceback, но клиент получает безопасное сообщение."}</>,

            <>{"Префикс /api/v1 фиксирует внешнюю границу, а не создаёт несколько параллельных реализаций."}</>,

            <>{"Совместимость проверяется тестами и OpenAPI examples, а не обещанием автора."}</>,

          ]}
        />


        <PracticeCta text={"Проведите инвентаризацию всех error responses StudyHub, реализуйте ApiError и handlers для 422, DomainError, 429 и 500, подключите /api/v1, добавьте минимум восемь contract tests и приложите before/after таблицу."} />
      </Section>
    </RichLesson>
  );
}


// 208. Аудит безопасности и производительности
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


// 209. Финальный test suite и quality gate
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


// 210. README, ER-диаграмма и архитектурный рассказ
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


// 211. Interview lab: Python, SQL, API и code review
export function Lesson211({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Interview lab: Python, SQL, API и code review"}
        intro={"Проведём ограниченную по времени лабораторию, близкую к junior backend-интервью: уточним требования, прочитаем Python-код, найдём дефект, допишем отрицательный тест, составим SQL JOIN, реализуем маленький endpoint и проведём code review."}
        tags={[
          { icon: <Bug size={14} />, label: "90 минут · рабочие задачи" },
          { icon: <Wrench size={14} />, label: "объяснить → проверить → улучшить" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"Проект даёт знакомый контекст, но на интервью подсказок архитектуры может не быть. Нужна отдельная тренировка процесса: понять условие, назвать предположения, сделать минимальное изменение и доказать результат."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Лаборатория не превращается в олимпиадный марафон или senior system design. Проверяются базовые рабочие действия и качество объяснения."}
      </Callout>

      <Section number="01" title={"Интервью проверяет процесс решения"}>
        <Lead>
          {"Проведём ограниченную по времени лабораторию, близкую к junior backend-интервью: уточним требования, прочитаем Python-код, найдём дефект, допишем отрицательный тест, составим SQL JOIN, реализуем маленький endpoint и проведём code review."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Уточнить"}:</strong> {"пересказать задачу, назвать вход, выход, ограничения и спорные случаи."}
            </li>
            <li>
              <strong>{"Предложить"}:</strong> {"сформулировать минимальное решение и оценить его сложность до кода."}
            </li>
            <li>
              <strong>{"Проверить"}:</strong> {"добавить пример, тест или EXPLAIN, который подтверждает поведение."}
            </li>
            <li>
              <strong>{"Объяснить"}:</strong> {"описать trade-off, обнаруженный риск и следующий шаг без оправданий."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"Python"} title={"Поток данных"}>
            {"Прочитать функцию, заметить mutability, exceptions и сложность."}
          </TypeCard>
          <TypeCard badge={"SQL"} badgeTone="float" title={"Связи и агрегаты"}>
            {"Написать SELECT/JOIN/GROUP BY и проверить строки без дубликатов."}
          </TypeCard>
          <TypeCard badge={"API"} badgeTone="str" title={"Контракт и границы"}>
            {"Реализовать endpoint с validation, status, permission и service call."}
          </TypeCard>
          <TypeCard badge={"Review"} title={"Риск и улучшение"}>
            {"Отделить blocker от suggestion и дать проверяемое исправление."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Таймлайн 90-минутной лаборатории"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"5 минут"}</>, "прочитать условие, задать вопросы, сформулировать acceptance criteria"],
            [<>{"20 минут"}</>, "исправить Python defect и объяснить complexity"],
            [<>{"15 минут"}</>, "написать отрицательный pytest"],
            [<>{"20 минут"}</>, "собрать SQL SELECT/JOIN и проверить результат"],
            [<>{"15 минут"}</>, "реализовать небольшой FastAPI endpoint"],
            [<>{"15 минут"}</>, "провести code review и подвести итог"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "5 минут", right: "прочитать условие, задать вопросы, сформулировать acceptance criteria" },
            { left: "20 минут", right: "исправить Python defect и объяснить complexity" },
            { left: "15 минут", right: "написать отрицательный pytest" },
            { left: "20 минут", right: "собрать SQL SELECT/JOIN и проверить результат" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Во время интервью лучше молча писать код, чтобы не тратить время на объяснения."}</>}
          isTrue={false}
          explanation={"Интервьюер оценивает модель мышления. Короткие гипотезы, проверки и проговаривание trade-offs уменьшают риск неверно понять задачу."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Читаем алгоритм и оцениваем сложность"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"линейный поиск первого уникального slug"}

          code={
            "def first_unique_slug(slugs: list[str]) -> str | None:\n" +
            "    counts: dict[str, int] = {}\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        counts[slug] = counts.get(slug, 0) + 1\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        if counts[slug] == 1:\n" +
            "            return slug\n" +
            "\n" +
            "    return None\n" +
            "\n" +
            "\n" +
            "assert first_unique_slug([\"python\", \"sql\", \"python\"]) == \"sql\"\n" +
            "assert first_unique_slug([\"api\", \"api\"]) is None"
          }
        />


        <StepThrough
          code={
            "def first_unique_slug(slugs: list[str]) -> str | None:\n" +
            "    counts: dict[str, int] = {}\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        counts[slug] = counts.get(slug, 0) + 1\n" +
            "\n" +
            "    for slug in slugs:\n" +
            "        if counts[slug] == 1:\n" +
            "            return slug\n" +
            "\n" +
            "    return None\n" +
            "\n" +
            "\n" +
            "assert first_unique_slug([\"python\", \"sql\", \"python\"]) == \"sql\"\n" +
            "assert first_unique_slug([\"api\", \"api\"]) is None"
          }
          steps={[
            { line: 2, note: "Сначала создаётся словарь частот; один проход не теряет исходный порядок.", vars: { "time": "O(n)" } },
            { line: 4, note: "get(..., 0) отделяет отсутствующий ключ от уже встреченного slug.", vars: { "state": "counts" } },
            { line: 7, note: "Второй проход идёт по исходному списку и находит первое, а не любое уникальное значение.", vars: { "order": "preserved" } },
            { line: 10, note: "Явный None фиксирует сценарий отсутствия ответа.", vars: { "result": "str | None" } },
          ]}
        />

        <FillBlank
          prompt={"Какова временная сложность двух последовательных проходов по n элементам?"}
          before={""}
          after={""}
          options={["O(n)", "O(n²)", "O(log n)"]}
          answer={"O(n)"}
          explanation={"Два последовательных линейных прохода дают O(n + n), что упрощается до O(n)."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"Оценка кода или полезный review"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой комментарий code review помогает автору исправить риск?"}
          left={{
            title: "Оценка без доказательства",
            code: "Плохо. Перепиши этот метод.",
            note: "Не названы сценарий, последствие и критерий исправления.",
          }}
          right={{
            title: "Наблюдаемый риск",
            code: "Blocker: default `items=[]` разделяется между вызовами. Тест с двумя экземплярами воспроизводит утечку; используйте `None` или default_factory.",
            note: "Есть severity, причина, воспроизведение и направление исправления.",
          }}
          preferred="right"
          explanation={"Полезный review-комментарий связывает конкретный фрагмент с наблюдаемым дефектом и проверкой."}
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

      <Section number="05" title={"Диагностируем изменяемый default"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "def add_tag(tag: str, tags: list[str] = []):\n" +
            "    tags.append(tag)\n" +
            "    return tags\n" +
            "\n" +
            "\n" +
            "print(add_tag(\"python\"))\n" +
            "print(add_tag(\"sql\"))"
          }
          question={"Почему второй вызов неожиданно содержит оба тега?"}
          options={[
            "Default list создаётся один раз и повторно используется",
            "append сортирует строки",
            "Аннотация list[str] копирует данные",
          ]}
          correctIndex={0}
          explanation={"Изменяемое default-значение живёт между вызовами функции."}
          fix={"def add_tag(\n    tag: str,\n    tags: list[str] | None = None,\n) -> list[str]:\n    result = [] if tags is None else list(tags)\n    result.append(tag)\n    return result"}
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

      <Section number="06" title={"SQL, API и review в одном контексте"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"SQL-задача: прогресс каждого студента"}

          code={
            "SELECT\n" +
            "    u.id,\n" +
            "    u.email,\n" +
            "    COUNT(DISTINCT l.id) AS total_lessons,\n" +
            "    COUNT(DISTINCT c.lesson_id) AS completed_lessons\n" +
            "FROM users AS u\n" +
            "JOIN enrollments AS e\n" +
            "    ON e.student_id = u.id\n" +
            "JOIN modules AS m\n" +
            "    ON m.course_id = e.course_id\n" +
            "JOIN lessons AS l\n" +
            "    ON l.module_id = m.id\n" +
            "    AND l.is_published = TRUE\n" +
            "LEFT JOIN completions AS c\n" +
            "    ON c.enrollment_id = e.id\n" +
            "    AND c.lesson_id = l.id\n" +
            "WHERE e.course_id = :course_id\n" +
            "GROUP BY u.id, u.email\n" +
            "ORDER BY u.id;"
          }
        />


        <BranchExplorer
          code={
            "if task == \"bug\":\n" +
            "    reproduce_then_fix()\n" +
            "elif task == \"test\":\n" +
            "    write_failure_case_first()\n" +
            "elif task == \"sql\":\n" +
            "    inspect_rows_then_aggregate()\n" +
            "else:\n" +
            "    review_risk_and_evidence()"
          }
          scenarios={[
            { label: "traceback task", activeLine: 1, output: "minimal reproduction → failing line → fix" },
            { label: "pytest task", activeLine: 3, output: "negative case → assertion → implementation" },
            { label: "SQL task", activeLine: 5, output: "raw rows → JOIN cardinality → GROUP BY" },
            { label: "review task", activeLine: 7, output: "severity → evidence → suggested change" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Clarification"}>
            {"Уточните, считать ли только published lessons и что делать с курсом без уроков."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Cardinality"}>
            {"Проверьте raw JOIN до COUNT, иначе дубликаты скрываются DISTINCT."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Explanation"}>
            {"Назовите сложность Python-решения и индекс, полезный SQL query, но не оптимизируйте без плана."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Работаем по таймеру и объясняем"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "pytest interview_lab/test_service.py -q" },
            { out: "1 failed, 4 passed" },
            { cmd: "pytest interview_lab/test_service.py::test_foreign_teacher_cannot_update -q" },
            { out: "1 passed" },
            { cmd: "psql \"$DATABASE_URL\" -f interview_lab/progress.sql" },
            { out: " id | email            | total_lessons | completed_lessons\n----+------------------+---------------+------------------\n  7 | student@test.io  |             4 |                3" },
            { cmd: "ruff check interview_lab" },
            { out: "All checks passed!" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "clarify", code: "5 минут: вопросы и acceptance criteria" },
            { id: "python", code: "20 минут: дефект и complexity" },
            { id: "test", code: "15 минут: отрицательный pytest" },
            { id: "sql", code: "20 минут: SELECT/JOIN" },
            { id: "api", code: "15 минут: маленький endpoint" },
            { id: "review", code: "15 минут: review и итог" },
          ]}
          correctOrder={["clarify", "python", "test", "sql", "api", "review"]}
          explanation={"Сначала снимается неопределённость, затем выполняются независимые рабочие задания, а последние минуты остаются на review и объяснение."}
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
            question={"Что сделать до первой правки незнакомого кода?"}
            options={[
              "Переписать функцию",
              "Воспроизвести поведение и уточнить контракт",
              "Добавить кеш",
            ]}
            correctIndex={1}
            explanation={"Минимальное воспроизведение отделяет наблюдаемый дефект от догадки."}
          />
          <QuizCard
            question={"Почему LEFT JOIN нужен для completions?"}
            options={[
              "Чтобы сохранить студентов без завершений",
              "Чтобы ускорить любой запрос",
              "Чтобы запретить NULL",
            ]}
            correctIndex={0}
            explanation={"INNER JOIN удалил бы строки без completion и скрыл 0%."}
          />
          <QuizCard
            question={"Что отличает blocker в review?"}
            options={[
              "Он длиннее",
              "Есть риск корректности/безопасности и доказуемый сценарий",
              "Он написан заглавными",
            ]}
            correctIndex={1}
            explanation={"Severity определяется последствием, а не тоном."}
          />
          <QuizCard
            question={"Как лучше завершить задачу на интервью?"}
            options={[
              "Сказать «готово»",
              "Назвать проверки, ограничения и следующий шаг",
              "Начать новый refactoring",
            ]}
            correctIndex={1}
            explanation={"Короткий итог показывает контроль результата и понимание границ."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Сначала уточняются контракт и edge cases, затем пишется код."}</>,

            <>{"Минимальное воспроизведение и failing test важнее случайной догадки."}</>,

            <>{"Два последовательных прохода по n элементам остаются O(n)."}</>,

            <>{"SQL JOIN проверяется на уровне сырых строк до агрегирования."}</>,

            <>{"Review-комментарий содержит severity, риск, evidence и проверяемое улучшение."}</>,

            <>{"На интервью оценивается процесс решения и способность объяснить границы."}</>,

          ]}
        />


        <PracticeCta text={"Проведите 90-минутный mock без подсказок: исправьте один Python bug, добавьте отрицательный pytest, напишите JOIN/aggregate query, реализуйте небольшой FastAPI endpoint и оформите три review-комментария. После таймера запишите, где потеряли время и какую проверку пропустили."} />
      </Section>
    </RichLesson>
  );
}


// 212. StudyHub LMS Release и финальная защита
export function Lesson212({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"StudyHub LMS Release и финальная защита"}
        intro={"Соберём последний контролируемый выпуск StudyHub LMS: заморозим scope, пройдём quality gates и migrations, создадим immutable tag, развернём чистое окружение, покажем teacher/student/admin flow, воспроизведём failure и rollback, а затем защитим ключевые решения."}
        tags={[
          { icon: <Trophy size={14} />, label: "release · demo · rollback" },
          { icon: <Package size={14} />, label: "защита решений и следующий план" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"Предыдущие занятия сделали контракт, качество и документацию проверяемыми. Финал соединяет код, эксплуатацию и объяснение в один воспроизводимый release, а не добавляет последнюю случайную функцию."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Защита не является сертификатом production security и не гарантирует трудоустройство. Она подтверждает готовность показывать junior-level backend, принимать review и продолжать системную практику."}
      </Callout>

      <Section number="01" title={"Релиз — это воспроизводимая версия"}>
        <Lead>
          {"Соберём последний контролируемый выпуск StudyHub LMS: заморозим scope, пройдём quality gates и migrations, создадим immutable tag, развернём чистое окружение, покажем teacher/student/admin flow, воспроизведём failure и rollback, а затем защитим ключевые решения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Заморозить scope"}:</strong> {"не добавлять функции после release candidate; исправлять только подтверждённые blockers."}
            </li>
            <li>
              <strong>{"Собрать evidence"}:</strong> {"quality gate, clean migrations, image digest, smoke test и release notes."}
            </li>
            <li>
              <strong>{"Провести demo"}:</strong> {"показать teacher, student и admin flow по короткому воспроизводимому сценарию."}
            </li>
            <li>
              <strong>{"Защитить решение"}:</strong> {"объяснить архитектуру, ограничения, failure/rollback и план следующих 8–12 недель."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"artifact"} title={"Immutable release"}>
            {"Git tag, Docker image по SHA и release notes обозначают одну версию."}
          </TypeCard>
          <TypeCard badge={"evidence"} badgeTone="float" title={"Проверяемое качество"}>
            {"CI, tests, migration check, health/readiness и smoke scenario."}
          </TypeCard>
          <TypeCard badge={"demo"} badgeTone="str" title={"Пользовательский результат"}>
            {"Teacher публикует, student enrolls/completes, admin проверяет доступ."}
          </TypeCard>
          <TypeCard badge={"recovery"} title={"Контролируемый сбой"}>
            {"Команда показывает лог, определяет impact и возвращает предыдущий artifact."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Release manifest и evidence"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"source commit"}</>, "один SHA, прошедший review и quality gates"],
            [<>{"database state"}</>, "alembic current = head и проверенный backup/restore runbook"],
            [<>{"runtime artifact"}</>, "Docker image с immutable SHA tag и digest"],
            [<>{"deployment evidence"}</>, "health, readiness, smoke flow, logs и metrics"],
            [<>{"portfolio evidence"}</>, "README, diagrams, demo script, release notes и limitations"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "source commit", right: "один SHA, прошедший review и quality gates" },
            { left: "database state", right: "alembic current = head и проверенный backup/restore runbook" },
            { left: "runtime artifact", right: "Docker image с immutable SHA tag и digest" },
            { left: "deployment evidence", right: "health, readiness, smoke flow, logs и metrics" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Для финального релиза достаточно, чтобы приложение успешно запускалось на компьютере автора."}</>}
          isTrue={false}
          explanation={"Release должен воспроизводиться из конкретного commit и artifact, проходить clean deployment и иметь проверяемый recovery path."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Связываем commit, image и schema"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"release manifest связывает commit, image и schema"}

          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class ReleaseManifest:\n" +
            "    version: str\n" +
            "    commit_sha: str\n" +
            "    image: str\n" +
            "    migration_head: str\n" +
            "\n" +
            "\n" +
            "release = ReleaseManifest(\n" +
            "    version=\"v1.0.0\",\n" +
            "    commit_sha=\"8b1c2d3\",\n" +
            "    image=\"ghcr.io/example/studyhub:8b1c2d3\",\n" +
            "    migration_head=\"20260721_01\",\n" +
            ")"
          }
        />


        <StepThrough
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class ReleaseManifest:\n" +
            "    version: str\n" +
            "    commit_sha: str\n" +
            "    image: str\n" +
            "    migration_head: str\n" +
            "\n" +
            "\n" +
            "release = ReleaseManifest(\n" +
            "    version=\"v1.0.0\",\n" +
            "    commit_sha=\"8b1c2d3\",\n" +
            "    image=\"ghcr.io/example/studyhub:8b1c2d3\",\n" +
            "    migration_head=\"20260721_01\",\n" +
            ")"
          }
          steps={[
            { line: 4, note: "Frozen dataclass не даёт случайно изменить уже зафиксированный manifest.", vars: { "contract": "immutable" } },
            { line: 10, note: "Version удобна человеку, commit SHA связывает release с исходниками.", vars: { "version": "v1.0.0" } },
            { line: 12, note: "Image использует тот же SHA и не зависит от плавающего latest.", vars: { "artifact": "8b1c2d3" } },
            { line: 13, note: "Migration head фиксирует ожидаемое состояние database schema.", vars: { "schema": "20260721_01" } },
          ]}
        />

        <FillBlank
          prompt={"Какой tag лучше связывает runtime image с проверенным commit?"}
          before={""}
          after={""}
          options={["commit SHA", "latest", "local"]}
          answer={"commit SHA"}
          explanation={"SHA-tag позволяет однозначно определить исходный commit и повторно развернуть тот же artifact."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"latest или immutable artifact"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой release artifact проще проверить и откатить?"}
          left={{
            title: "Плавающий latest",
            code: "docker pull ghcr.io/example/studyhub:latest",
            note: "Один tag может начать указывать на другой image без изменения команды.",
          }}
          right={{
            title: "Immutable SHA",
            code: "docker pull ghcr.io/example/studyhub:8b1c2d3\n# digest: sha256:4a9...",
            note: "Commit, image и digest однозначно связаны.",
          }}
          preferred="right"
          explanation={"Rollback требует точно знать предыдущий artifact; плавающий tag не даёт такой гарантии."}
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

      <Section number="05" title={"Порядок deployment защищает schema"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "docker compose pull api\n" +
            "docker compose up -d api\n" +
            "alembic upgrade head\n" +
            "curl --fail https://studyhub.example/health"
          }
          question={"Почему порядок опасен для несовместимой migration?"}
          options={[
            "Новый API получает traffic до завершения schema change",
            "curl нельзя использовать после Docker",
            "Migrations всегда выполняются автоматически",
          ]}
          correctIndex={0}
          explanation={"Новый process может начать обслуживать requests со старой schema, а failure migration оставит неоднозначное состояние."}
          fix={"docker compose pull api\n./scripts/backup.sh\ndocker compose run --rm migrations\ndocker compose up -d api\n./scripts/wait-ready.sh\n./scripts/smoke.sh"}
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

      <Section number="06" title={"Проводим demo и recovery scenario"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"финальный demo-сценарий"}

          code={
            "DEMO = [\n" +
            "    \"teacher logs in\",\n" +
            "    \"teacher creates course, module and lesson\",\n" +
            "    \"teacher publishes course\",\n" +
            "    \"student opens public catalog\",\n" +
            "    \"student enrolls\",\n" +
            "    \"student completes lesson\",\n" +
            "    \"student reads progress\",\n" +
            "    \"admin verifies audit event\",\n" +
            "    \"operator checks health, logs and cache behavior\",\n" +
            "]"
          }
        />


        <BranchExplorer
          code={
            "if smoke_status == \"passed\":\n" +
            "    publish_release_notes()\n" +
            "elif migration_status == \"failed\":\n" +
            "    stop_deployment_and_restore()\n" +
            "elif readiness_status == \"failed\":\n" +
            "    inspect_logs_and_keep_old_version()\n" +
            "else:\n" +
            "    rollback_to_previous_image()"
          }
          scenarios={[
            { label: "all checks green", activeLine: 1, output: "publish v1.0.0" },
            { label: "migration failure", activeLine: 3, output: "stop, diagnose, restore if required" },
            { label: "new API not ready", activeLine: 5, output: "old version keeps serving traffic" },
            { label: "smoke regression", activeLine: 7, output: "deploy previous SHA and verify recovery" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Demo script"}>
            {"Один основной flow занимает 7–10 минут и заранее содержит ожидаемые statuses и данные."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Architecture defense"}>
            {"Для каждого решения названы проблема, выбранный вариант, альтернатива и ограничение."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Next plan"}>
            {"8–12 недель направлены на отклики, code review, дополнительные tasks и улучшение одного измеримого места проекта."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Выпускаем, проверяем и откатываем"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "make release-check" },
            { out: "format ✓  lint ✓  tests 214 passed  migrations ✓  image scan ✓" },
            { cmd: "git tag -a v1.0.0 -m 'StudyHub LMS Release' && git push origin v1.0.0" },
            { cmd: "IMAGE_TAG=8b1c2d3 ./scripts/deploy.sh" },
            { out: "readiness: ok\nsmoke: teacher/student flow passed" },
            { cmd: "IMAGE_TAG=79aa110 ./scripts/rollback.sh" },
            { out: "rollback: complete\nhealth: ok\nsmoke: previous release passed" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "freeze", code: "заморозить scope и составить release candidate" },
            { id: "gate", code: "пройти tests, migrations, security и docs checks" },
            { id: "tag", code: "создать Git tag и immutable image" },
            { id: "deploy", code: "развернуть из чистого окружения" },
            { id: "smoke", code: "выполнить demo/smoke и recovery drill" },
            { id: "publish", code: "опубликовать notes, evidence и следующий план" },
          ]}
          correctOrder={["freeze", "gate", "tag", "deploy", "smoke", "publish"]}
          explanation={"Release публикуется только после воспроизводимого deployment, smoke test и проверенного recovery path."}
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
            question={"Что связывает deployed image с исходным кодом?"}
            options={[
              "Цвет badge",
              "Commit SHA tag и digest",
              "Имя разработчика",
            ]}
            correctIndex={1}
            explanation={"Immutable identifiers позволяют найти и повторить конкретный artifact."}
          />
          <QuizCard
            question={"Когда публиковать release notes?"}
            options={[
              "До smoke test",
              "После успешного clean deploy и smoke/recovery checks",
              "Сразу после первого commit",
            ]}
            correctIndex={1}
            explanation={"Notes должны описывать реально проверенный release."}
          />
          <QuizCard
            question={"Что показывать при failure scenario на защите?"}
            options={[
              "Только traceback",
              "Detection, impact, logs, решение и recovery verification",
              "Скрыть сбой",
            ]}
            correctIndex={1}
            explanation={"Контролируемая диагностика демонстрирует эксплуатационное мышление."}
          />
          <QuizCard
            question={"Что означает финальная защита?"}
            options={[
              "Гарантированное трудоустройство",
              "Готовность объяснять и развивать junior-level backend",
              "Enterprise certification",
            ]}
            correctIndex={1}
            explanation={"Результат курса — доказуемый проект и база для системных откликов и практики."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Release начинается с freeze scope и одного проверенного source commit."}</>,

            <>{"Git tag, image SHA/digest и migration head образуют воспроизводимый manifest."}</>,

            <>{"Clean deployment и smoke flow доказывают больше, чем запуск на машине автора."}</>,

            <>{"Failure/rollback scenario является частью release, а не импровизацией после аварии."}</>,

            <>{"Архитектурная защита связывает проблему, решение, альтернативу и ограничение."}</>,

            <>{"После релиза нужен конкретный 8–12-недельный план откликов, практики и улучшений."}</>,

          ]}
        />


        <PracticeCta text={"Соберите release candidate StudyHub LMS, пройдите полный gate, создайте immutable tag/image, разверните clean environment, проведите teacher/student/admin demo и один rollback drill. Подготовьте 12-минутную защиту и письменный план следующих 8–12 недель без обещаний автоматического трудоустройства."} />
      </Section>
    </RichLesson>
  );
}
